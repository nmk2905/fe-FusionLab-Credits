import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  UserPlus,
  Edit,
  Trash2,
  Download,
  Users,
  GraduationCap,
  UserCog,
  Loader2,
  AlertCircle,
} from "lucide-react";
import userService from "../../../services/apis/userApi"; // Đảm bảo đường dẫn đúng

export default function AccountManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Bộ lọc & tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");

  // Phân trang
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Hàm gọi API lấy danh sách người dùng
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const roleFilter = selectedRole === "all" ? "" : selectedRole;

      const response = await userService.getUsers({
        role: roleFilter,
        pageIndex,
        pageSize,
        sortDir: "desc", // hoặc "asc" tùy bạn
        search: searchTerm || undefined, // nếu có thêm search ở backend
      });

      // Giả sử API trả về cấu trúc: { data: [], totalCount: number, totalPages: number }
      setUsers(response.data || response.items || []);
      setTotalUsers(response.totalCount || response.total || 0);
      setTotalPages(
        response.totalPages || Math.ceil((response.totalCount || 0) / pageSize)
      );
    } catch (err) {
      console.error("Lỗi khi tải danh sách người dùng:", err);
      setError("Không thể tải danh sách tài khoản. Vui lòng thử lại sau.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Gọi API khi thay đổi bộ lọc, trang, tìm kiếm
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setPageIndex(1); // Reset về trang 1 khi tìm kiếm hoặc lọc
      fetchUsers();
    }, 500); // Debounce 500ms để tránh gọi API liên tục khi gõ tìm kiếm

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, selectedRole]);

  // Gọi lại khi đổi trang
  useEffect(() => {
    fetchUsers();
  }, [pageIndex]);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa tài khoản này?")) return;

    try {
      // await userService.deleteUser(id); // Nếu có API xóa
      setUsers(users.filter((u) => u.id !== id));
      alert("Xóa thành công!");
    } catch (err) {
      alert("Xóa thất bại!");
    }
  };

  const handleExport = () => {
    alert("Chức năng export đang được phát triển...");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-6"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Quản lý Tài khoản</h1>
        <p className="text-gray-600">
          Quản lý tài khoản giảng viên, sinh viên và quản trị viên
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-500" />
              <select
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="all">Tất cả vai trò</option>
                <option value="Mentor">Giảng viên</option>
                <option value="User">Sinh viên</option>
                <option value="Staff">Quản trị viên</option>
                <option value="Finance">Nhân viên tài chính</option>
              </select>
            </div>

            <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition">
              <UserPlus size={20} />
              <span>Thêm tài khoản</span>
            </button>

            <button
              onClick={handleExport}
              className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
            >
              <Download size={20} />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Loading & Error State */}
      {loading && (
        <div className="text-center py-12">
          <Loader2 className="animate-spin inline-block" size={32} />
          <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Họ tên
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Vai trò
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center py-8 text-gray-500"
                      >
                        Không tìm thấy tài khoản nào.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          #{user.id}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {user.name || user.fullName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {user.email}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              user.role === "Giảng viên"
                                ? "bg-purple-100 text-purple-800"
                                : user.role === "Sinh viên"
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              user.status === "active" || user.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {user.status === "active" || user.isActive
                              ? "Hoạt động"
                              : "Đã khóa"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-3">
                            <button className="text-blue-600 hover:text-blue-800">
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Phân trang */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => setPageIndex((p) => Math.max(1, p - 1))}
                disabled={pageIndex === 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50"
              >
                Trước
              </button>
              <span className="px-4">
                Trang {pageIndex} / {totalPages}
              </span>
              <button
                onClick={() => setPageIndex((p) => Math.min(totalPages, p + 1))}
                disabled={pageIndex === totalPages}
                className="px-4 py-2 border rounded-lg disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}

      {/* Thống kê nhanh */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tổng tài khoản</p>
                <p className="text-2xl font-bold">{totalUsers}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="text-blue-600" size={28} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Giảng viên</p>
                <p className="text-2xl font-bold">
                  {users.filter((u) => u.role === "Giảng viên").length}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <UserCog className="text-purple-600" size={28} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Sinh viên</p>
                <p className="text-2xl font-bold">
                  {users.filter((u) => u.role === "Sinh viên").length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <GraduationCap className="text-green-600" size={28} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Quản trị viên</p>
                <p className="text-2xl font-bold">
                  {users.filter((u) => u.role === "Quản trị viên").length}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <UserCog className="text-orange-600" size={28} />
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
