import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

export default function ProtectedRoute({ allowedRoles }) {
  const { user, isAuthenticated, loading } = useContext(AuthContext);

  // ⏳ Đợi AuthContext khởi tạo xong
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span>Loading...</span>
      </div>
    );
  }

  // 🔒 Chưa đăng nhập
  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  // 👉 Lấy role name từ mảng roles
  const userRole =
    Array.isArray(user.roles) && user.roles.length > 0
      ? user.roles[0].name
      : null;
      
  // 🛑 Sai role
  if (
    allowedRoles &&
    Array.isArray(allowedRoles) &&
    !allowedRoles.includes(userRole)
  ) {
    return <Navigate to="/" replace />;
  }

  // ✅ OK
  return <Outlet />;
}
