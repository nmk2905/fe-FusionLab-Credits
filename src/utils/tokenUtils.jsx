// src/utils/tokenUtils.js
import { jwtDecode } from "jwt-decode";

/**
 * Decode token và lấy thông tin từ token
 * @param {string} token - Token dưới dạng chuỗi
 * @returns {Object} - Đối tượng chứa email, role, userName, userId, fullName, phoneNumber và exp
 */
export const decodeToken = (token) => {
  try {
    const decodedToken = jwtDecode(token);

    // Lấy email từ các claim có thể có
    const email =
      decodedToken.email ||
      decodedToken[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
      ] ||
      decodedToken[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
      ] ||
      decodedToken.sub;

    // Lấy role
    const role =
      decodedToken[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
      ] || decodedToken.role;

    // Lấy username từ các nguồn khác nhau
    const userName =
      decodedToken.user_name ||
      decodedToken[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
      ] ||
      decodedToken.userName ||
      email; // Fallback về email nếu không tìm thấy

    // Lấy user ID từ các nguồn khác nhau
    const userId =
      decodedToken.id ||
      decodedToken[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ] ||
      decodedToken.userId;

    // Lấy thông tin bổ sung
    const fullName = decodedToken.full_name;
    const phoneNumber = decodedToken.phone_number;
    const exp = decodedToken.exp;

    return {
      email,
      role,
      userName,
      userId,
      fullName,
      phoneNumber,
      exp,
    };
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

/**
 * Kiểm tra token có hợp lệ không (chưa hết hạn)
 * @param {string} token - Token dưới dạng chuỗi
 * @returns {boolean} - Trả về true nếu token còn hiệu lực
 */
export const isTokenValid = (token) => {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Chuyển sang seconds
    return decoded.exp > currentTime;
  } catch (error) {
    console.error("Error checking token validity:", error);
    return false;
  }
};

/**
 * Lấy thông tin user từ token
 * @param {string} token - Token dưới dạng chuỗi
 * @returns {Object} - Đối tượng chứa thông tin user cơ bản
 */
export const getUserInfoFromToken = (token) => {
  const decoded = decodeToken(token);
  if (!decoded) return null;

  return {
    id: decoded.userId,
    email: decoded.email,
    userName: decoded.userName,
    fullName: decoded.fullName,
    role: decoded.role,
    phoneNumber: decoded.phoneNumber,
  };
};
