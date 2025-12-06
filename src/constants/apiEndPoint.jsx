export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

// Các endpoint cho xác thực
export const API_ENDPOINTS_AUTH = {
  LOGIN: "/api/Auth/login",
  REGISTER: "/api/Auth/register",
};

// Các endpoint cho user
export const API_ENDPOINTS_USER = {
  GET_USER: (userId) => `/api/Users/${userId}`,
  UPDATE_INFORMATION_USER: "/api/User/UpdateInfoUser",
};

export const API_ENDPOINTS_PROJECT = {
  GET_PROJECT_BY_ID: (projectId) => `/api/projects/${projectId}`,
};
