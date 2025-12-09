import React, { useState, useEffect } from "react";
import { X, Save, Key, Eye, EyeOff } from "lucide-react";
import userService from "../../../../../services/apis/userApi";

export default function EditAccountModal({ isOpen, onClose, onSuccess, user }) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "",
    phone: "",
    department: "",
    status: "Active",
    password: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changePassword, setChangePassword] = useState(false);

  // Role options (chỉ mentor và finance có thể được chỉnh sửa từ admin)
  const roleOptions = [
    { value: "Mentor", label: "Giảng viên/Hướng dẫn" },
    { value: "Finance", label: "Nhân viên tài chính" },
    { value: "User", label: "Sinh viên" },
    { value: "Staff", label: "Quản trị viên" },
  ];

  // Khởi tạo form data từ user prop
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.name || user.fullName || "",
        email: user.email || "",
        role: user.role || "Mentor",
        phone: user.phone || "",
        department: user.department || "",
        status: user.status || (user.isActive ? "Active" : "Inactive"),
        password: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ tên";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (changePassword) {
      if (formData.newPassword && formData.newPassword.length < 6) {
        newErrors.newPassword = "Mật khẩu mới phải có ít nhất 6 ký tự";
      }
      
      if (formData.newPassword !== formData.confirmNewPassword) {
        newErrors.confirmNewPassword = "Mật khẩu không khớp";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Chuẩn bị dữ liệu gửi lên server
      const updateData = {
        fullName: formData.fullName,
        username: formData.email,
      };

      // Nếu đổi mật khẩu
      if (changePassword && formData.newPassword) {
        updateData.password = formData.password; // Mật khẩu cũ để xác thực
        updateData.newPassword = formData.newPassword;
      }

      // Gọi API cập nhật user
      //const response = await userService.updateUser(user.id, updateData);

      onSuccess(response.data);
      onClose();
      alert("Cập nhật tài khoản thành công!");
    } catch (err) {
      console.error("Lỗi khi cập nhật tài khoản:", err);
      const errorMessage = err.response?.data?.message || "Cập nhật thất bại";
      
      if (err.response?.status === 401) {
        setErrors({ password: "Mật khẩu hiện tại không đúng" });
      } else {
        setErrors({ submit: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const togglePasswordVisibility = (field) => {
    switch (field) {
      case 'password':
        setShowPassword(!showPassword);
        break;
      case 'newPassword':
        setShowNewPassword(!showNewPassword);
        break;
      case 'confirm':
        setShowConfirmPassword(!showConfirmPassword);
        break;
    }
  };

  const handleResetPassword = async () => {
    if (!window.confirm("Bạn có chắc muốn reset mật khẩu về mặc định? User sẽ nhận được email với mật khẩu mới.")) return;

    try {
      setLoading(true);
      await userService.resetPassword(user.id);
      alert("Đã gửi email reset mật khẩu thành công!");
    } catch (err) {
      console.error("Lỗi khi reset mật khẩu:", err);
      alert("Reset mật khẩu thất bại!");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <Save className="text-blue-600" size={24} />
            <h2 className="text-xl font-bold">Chỉnh sửa tài khoản</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Thông tin cơ bản */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700 border-b pb-2">Thông tin cơ bản</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Họ tên *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              {errors.fullName && (
                <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vai trò
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  {roleOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  <option value="Active">Hoạt động</option>
                  <option value="Inactive">Đã khóa</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0987654321"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phòng ban/Bộ môn
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="VD: Khoa CNTT"
                disabled={loading}
              />
            </div>
          </div>

          {/* Quản lý mật khẩu */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-700">Quản lý mật khẩu</h3>
              <button
                type="button"
                onClick={handleResetPassword}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                disabled={loading}
              >
                <Key size={16} />
                Reset mật khẩu
              </button>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                id="changePassword"
                checked={changePassword}
                onChange={(e) => setChangePassword(e.target.checked)}
                className="rounded"
                disabled={loading}
              />
              <label htmlFor="changePassword" className="text-sm text-gray-700">
                Thay đổi mật khẩu
              </label>
            </div>

            {changePassword && (
              <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mật khẩu hiện tại *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                      placeholder="Nhập mật khẩu hiện tại"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('password')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                      placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('newPassword')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Xác nhận mật khẩu mới
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmNewPassword"
                      value={formData.confirmNewPassword}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                      placeholder="Nhập lại mật khẩu mới"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirmNewPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.confirmNewPassword}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Lưu ý */}
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-lg text-sm">
            <p className="font-semibold">Lưu ý:</p>
            <ul className="list-disc pl-4 mt-1 space-y-1">
              <li>Các trường có dấu * là bắt buộc</li>
              <li>Mật khẩu phải có ít nhất 6 ký tự</li>
              <li>Khi thay đổi mật khẩu cần nhập đúng mật khẩu hiện tại</li>
              <li>Trạng thái "Đã khóa" sẽ không thể đăng nhập</li>
            </ul>
          </div>

          {/* Thông báo lỗi */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
              {errors.submit}
            </div>
          )}

          {/* Nút hành động */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Lưu thay đổi
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}