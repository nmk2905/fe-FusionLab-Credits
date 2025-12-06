import axiosInstance from "../services/axiosInstance";

/**
 * Hàm gọi API hoàn thiện
 */
export const performApiRequest = async (
  endpoint,
  {
    data = {},
    method = "POST",
    params,
    headers = {},
    timeout = 30000,
    responseType = "json",
    isMultipart = false, // Thêm flag để xác định có phải upload file không
  } = {}
) => {
  try {
    method = method.toUpperCase();

    // Chuẩn bị config
    const config = {
      url: endpoint,
      method,
      params,
      headers: {
        // Mặc định là application/json, trừ khi là multipart
        "Content-Type": isMultipart
          ? "multipart/form-data"
          : "application/json",
        ...headers,
      },
      data,
      timeout,
      responseType,
    };

    // Xử lý đặc biệt cho FormData
    // Xử lý đặc biệt cho FormData
    if (data instanceof FormData || isMultipart) {
      // Để axios tự set boundary cho FormData
      delete config.headers["Content-Type"];
    }

    console.log(`API Call: ${method} ${endpoint}`, {
      headers: config.headers,
    });

    const response = await axiosInstance(config);

    return normalizeResponse(response);
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Chuẩn hóa response từ API
 */
const normalizeResponse = (response) => {
  const { data, status, statusText } = response;
  const responseData = data || {};

  // Kiểm tra nếu response có field success
  const hasSuccessField = responseData.hasOwnProperty("success");
  const isSuccessFromField = hasSuccessField ? responseData.success : undefined;

  // Kiểm tra HTTP status code
  const isSuccessFromStatus = status >= 200 && status < 300;

  // Quyết định success
  let finalSuccess;
  if (hasSuccessField) {
    // Ưu tiên field success từ response body
    finalSuccess = isSuccessFromField;
  } else {
    // Nếu không có field success, dựa vào HTTP status
    finalSuccess = isSuccessFromStatus;
  }

  // Chuẩn hóa error message
  let errorMessage = null;
  if (!finalSuccess) {
    errorMessage =
      responseData.message ||
      responseData.error ||
      (typeof responseData === "string" ? responseData : null) ||
      statusText ||
      `Request failed with status ${status}`;
  }

  // Loại bỏ field success khỏi data nếu có
  const { success, message, error, ...cleanData } = responseData;

  return {
    success: finalSuccess,
    data: cleanData,
    message:
      responseData.message || (finalSuccess ? "Request successful" : null),
    error: errorMessage,
    status: status,
    statusText: statusText,
    headers: response.headers,
    rawResponse: response,
  };
};

/**
 * Xử lý lỗi từ API
 */
export const handleApiError = (error) => {
  console.error("API Error Details:", {
    message: error.message,
    code: error.code,
    response: error.response,
    request: error.request,
  });

  if (error.response) {
    const { status, data, statusText } = error.response;
    const errorData = data || {};

    let errorMessage =
      errorData.message ||
      errorData.error ||
      (typeof errorData === "string" ? errorData : null) ||
      statusText ||
      `Server error (${status})`;

    // Xử lý validation errors
    if (errorData.errors && typeof errorData.errors === "object") {
      const validationErrors = Object.values(errorData.errors)
        .flat()
        .filter((msg) => msg)
        .join(", ");
      if (validationErrors) {
        errorMessage = validationErrors;
      }
    }

    return {
      success: false,
      data: errorData,
      error: errorMessage,
      status: status,
      statusText: statusText,
      isNetworkError: false,
      isTimeout: false,
    };
  } else if (error.request) {
    const isTimeout = error.code === "ECONNABORTED";

    return {
      success: false,
      data: null,
      error: isTimeout
        ? "Request timeout. Please try again."
        : "No response from server. Please check your connection.",
      status: null,
      statusText: null,
      isNetworkError: true,
      isTimeout: isTimeout,
    };
  } else {
    return {
      success: false,
      data: null,
      error: error.message || "Failed to send request",
      status: null,
      statusText: null,
      isNetworkError: false,
      isTimeout: false,
    };
  }
};

/**
 * Helper functions với Content-Type đúng
 */
export const apiUtils = {
  // GET - không có body data
  get: (endpoint, params, config = {}) =>
    performApiRequest(endpoint, {
      method: "GET",
      params,
      ...config,
    }),

  // POST với JSON (mặc định)
  post: (endpoint, data, config = {}) =>
    performApiRequest(endpoint, {
      method: "POST",
      data,
      isMultipart: false, // Rõ ràng là JSON
      ...config,
    }),

  // PUT với JSON
  put: (endpoint, data, config = {}) =>
    performApiRequest(endpoint, {
      method: "PUT",
      data,
      isMultipart: false,
      ...config,
    }),

  // PATCH với JSON
  patch: (endpoint, data, config = {}) =>
    performApiRequest(endpoint, {
      method: "PATCH",
      data,
      isMultipart: false,
      ...config,
    }),

  // DELETE có thể có hoặc không có data
  delete: (endpoint, data = {}, config = {}) =>
    performApiRequest(endpoint, {
      method: "DELETE",
      data,
      isMultipart: false,
      ...config,
    }),

  // UPLOAD FILE - dùng FormData
  upload: (endpoint, formData, config = {}) =>
    performApiRequest(endpoint, {
      method: "POST",
      data: formData, // FormData sẽ tự động được xử lý
      isMultipart: true,
      ...config,
    }),

  // POST với form-urlencoded (nếu cần)
  postFormUrlEncoded: (endpoint, data, config = {}) => {
    const formData = new URLSearchParams();
    Object.keys(data).forEach((key) => {
      formData.append(key, data[key]);
    });

    return performApiRequest(endpoint, {
      method: "POST",
      data: formData,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        ...config.headers,
      },
      ...config,
    });
  },
};

export default performApiRequest;
