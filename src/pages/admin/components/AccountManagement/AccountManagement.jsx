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
  Eye,
  Lock,
  Unlock,
} from "lucide-react";
import userService from "../../../../services/apis/userApi";
import CreateAccountModal from "../AccountManagement/components/CreateAccountModal";
import ViewAccountModal from "../AccountManagement/components/ViewAccountModal";
import EditAccountModal from "../AccountManagement/components/EditAccountModal";

export default function AccountManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Bộ lọc & tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");

  // Phân trang
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(1000);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Role options for creating accounts (chỉ mentor và finance)
  const roleOptions = [
    { value: "Mentor", label: "Giảng viên/Hướng dẫn", icon: UserCog },
    { value: "Finance", label: "Nhân viên tài chính", icon: Users },
    // Có thể thêm các role khác nếu cần
  ];

  // Role options for filtering (bao gồm tất cả)
  const filterRoleOptions = [
    { value: "all", label: "Tất cả vai trò" },
    { value: "Mentor", label: "Giảng viên" },
    { value: "User", label: "Sinh viên" },
    { value: "Staff", label: "Quản trị viên" },
    { value: "Finance", label: "Nhân viên tài chính" },
  ];

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const roleFilter = selectedRole === "all" ? "" : selectedRole;

      const response = await userService.getUsers({
        role: roleFilter,
        pageIndex,
        pageSize,
        sortDir: "desc",
        search: searchTerm || undefined,
      });

      console.log("Users response:", response);

      setUsers(response?.data?.contends || response.items || []);
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

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setPageIndex(1);
      fetchUsers();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, selectedRole]);

  useEffect(() => {
    fetchUsers();
  }, [pageIndex]);

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa tài khoản này?")) return;

    try {
      await userService.deleteUser(id);
      setUsers(users.filter((u) => u.id !== id));
      alert("Xóa thành công!");
    } catch (err) {
      console.error("Lỗi khi xóa:", err);
      alert("Xóa thất bại!");
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === "Active" ? "Inactive" : "Active";
    const confirmMessage =
      newStatus === "Active"
        ? "Bạn có chắc muốn kích hoạt tài khoản này?"
        : "Bạn có chắc muốn khóa tài khoản này?";

    if (!window.confirm(confirmMessage)) return;

    try {
      // Gọi API để cập nhật trạng thái
      await userService.updateUserStatus(user.id, { status: newStatus });

      // Cập nhật local state
      setUsers(
        users.map((u) =>
          u.id === user.id
            ? { ...u, status: newStatus, isActive: newStatus === "Active" }
            : u
        )
      );

      alert(`Đã ${newStatus === "Active" ? "kích hoạt" : "khóa"} tài khoản!`);
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái:", err);
      alert("Cập nhật trạng thái thất bại!");
    }
  };

  const handleCreateSuccess = (newUser) => {
    // Thêm user mới vào danh sách
    setUsers([newUser, ...users]);
    setTotalUsers((prev) => prev + 1);
    setShowCreateModal(false);
    alert("Tạo tài khoản thành công!");
  };

  const handleEditSuccess = (updatedUser) => {
    setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    setShowEditModal(false);
    alert("Cập nhật tài khoản thành công!");
  };

  const handleExport = () => {
    // Lọc và định dạng dữ liệu để export
    const exportData = users.map((user) => ({
      ID: user.id,
      "Họ tên": user.name || user.fullName,
      Email: user.email,
      "Vai trò": user.role,
      "Trạng thái": user.status === "Active" ? "Hoạt động" : "Đã khóa",
      "Ngày tạo": user.createdAt || new Date().toLocaleDateString(),
    }));

    // Tạo CSV
    const csvContent = [
      Object.keys(exportData[0]).join(","),
      ...exportData.map((row) => Object.values(row).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `accounts_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert("Xuất file CSV thành công!");
  };

  // Hàm format hiển thị role
  const formatRoleDisplay = (user) => {
    // Nếu user.roles là mảng, lấy role đầu tiên
    const role =
      Array.isArray(user.roles) && user.roles.length > 0
        ? user.roles[0].name
        : user.role || "Chưa xác định";

    const roleMap = {
      Mentor: "Giảng viên",
      User: "Sinh viên",
      Staff: "Quản trị viên",
      Finance: "Nhân viên tài chính",
      "Giảng viên": "Giảng viên",
      "Sinh viên": "Sinh viên",
      "Quản trị viên": "Quản trị viên",
      "Nhân viên tài chính": "Nhân viên tài chính",
    };
    return roleMap[role] || role;
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
          Quản lý và tạo tài khoản cho giảng viên, nhân viên tài chính
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
              placeholder="Tìm kiếm theo tên, email hoặc ID..."
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
                {filterRoleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <UserPlus size={20} />
              <span>Tạo tài khoản</span>
            </button>

            <button
              onClick={handleExport}
              className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
            >
              <Download size={20} />
              <span>Export CSV</span>
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
          <button
            onClick={fetchUsers}
            className="ml-auto text-blue-600 hover:text-blue-800"
          >
            Thử lại
          </button>
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
                        <Users className="inline-block mb-2" size={32} />
                        <p>Không tìm thấy tài khoản nào.</p>
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          #{user.id}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {user.name || user.fullName || "Chưa cập nhật"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {user.email}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              Array.isArray(user.roles) &&
                              user.roles[0]?.name === "Mentor"
                                ? "bg-purple-100 text-purple-800"
                                : Array.isArray(user.roles) &&
                                  user.roles[0]?.name === "User"
                                ? "bg-green-100 text-green-800"
                                : Array.isArray(user.roles) &&
                                  user.roles[0]?.name === "Finance"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {formatRoleDisplay(user)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              user.status === "Active" || user.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {user.status === "Active" || user.isActive
                              ? "Hoạt động"
                              : "Đã khóa"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewUser(user)}
                              className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                              title="Xem chi tiết"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleEditUser(user)}
                              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                              title="Chỉnh sửa"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(user)}
                              className="p-1.5 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded"
                              title={
                                user.status === "Active"
                                  ? "Khóa tài khoản"
                                  : "Kích hoạt"
                              }
                            >
                              {user.status === "Active" || user.isActive ? (
                                <Lock size={16} />
                              ) : (
                                <Unlock size={16} />
                              )}
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                              title="Xóa tài khoản"
                            >
                              <Trash2 size={16} />
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
                className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Trước
              </button>
              <span className="px-4 text-sm">
                Trang {pageIndex} / {totalPages}
              </span>
              <button
                onClick={() => setPageIndex((p) => Math.min(totalPages, p + 1))}
                disabled={pageIndex === totalPages}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
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
                  {
                    users.filter(
                      (u) =>
                        (Array.isArray(u.roles) &&
                          u.roles[0]?.name === "Mentor") ||
                        u.role === "Mentor" ||
                        u.role === "Giảng viên"
                    ).length
                  }
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
                <p className="text-sm text-gray-500">Nhân viên tài chính</p>
                <p className="text-2xl font-bold">
                  {
                    users.filter(
                      (u) =>
                        (Array.isArray(u.roles) &&
                          u.roles[0]?.name === "Finance") ||
                        u.role === "Finance" ||
                        u.role === "Nhân viên tài chính"
                    ).length
                  }
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Users className="text-yellow-600" size={28} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Đang hoạt động</p>
                <p className="text-2xl font-bold">
                  {
                    users.filter((u) => u.status === "Active" || u.isActive)
                      .length
                  }
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <UserCog className="text-green-600" size={28} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateAccountModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
          roleOptions={roleOptions}
        />
      )}

      {showViewModal && selectedUser && (
        <ViewAccountModal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          user={selectedUser}
        />
      )}

      {showEditModal && selectedUser && (
        <EditAccountModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
          user={selectedUser}
        />
      )}
    </motion.div>
  );
}
