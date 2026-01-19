import { createContext, useState, useEffect } from "react";
import { decodeToken } from "../utils/tokenUtils";
import userService from "../services/apis/userApi";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isUpdate, setIsUpdate] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasCheckedIn, setHasCheckedIn] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const tokenInfo = decodeToken(token);

        if (!tokenInfo || tokenInfo.exp <= Date.now() / 1000) {
          console.log("Token invalid or expired");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("role");
          setLoading(false);
          return;
        }

        localStorage.setItem("role", tokenInfo.role);
        setIsAuthenticated(true);

        // Sửa API call: kiểm tra tokenInfo.userId
        if (tokenInfo.userId) {
          const response = await userService.getCurrentUser(tokenInfo.userId);

          if (response && response.success && response.data) {
            setUser(response.data);
          } else {
            console.warn("No user data in response");
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        localStorage.clear();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [isUpdate]);

  const login = async (token) => {
    if (!token) {
      console.error("Invalid token");
      return;
    }

    const tokenInfo = decodeToken(token);
    if (!tokenInfo || tokenInfo.exp <= Date.now() / 1000) {
      alert("Token không hợp lệ hoặc đã hết hạn");
      return;
    }

    localStorage.setItem("accessToken", token); // Chỉ lưu token
    localStorage.setItem("role", tokenInfo.role); // Lưu role từ token
    setIsAuthenticated(true);

    // Gọi API để lấy thông tin user
    try {
      const response = await userService.getCurrentUser(tokenInfo.userId);
      if (response.success) {
        setUser(response.data); // Cập nhật user từ API
      } else {
        console.error("Failed to fetch user data:", response.error);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const logout = () => {
    localStorage.clear(); // Xóa toàn bộ localStorage (token và role)
    setUser(null);
    setIsAuthenticated(false);
    setHasCheckedIn(true); // Reset trạng thái điểm danh khi đăng xuất
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        setIsUpdate,
        hasCheckedIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
