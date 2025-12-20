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
import CreateAccountModal from "./components/CreateAccountModal";
import ViewAccountModal from "./components/ViewAccountModal";
import EditAccountModal from "./components/EditAccountModal";

export default function AccountManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & search
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");

  // Pagination
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(1000);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Role options for creating accounts (only mentor and finance)
  const roleOptions = [
    { value: "Mentor", label: "Mentor", icon: UserCog },
    { value: "Finance", label: "Finance Officer", icon: Users },
    // Can add other roles if needed
  ];

  // Role options for filtering (including all)
  const filterRoleOptions = [
    { value: "all", label: "All Roles" },
    { value: "Mentor", label: "Mentor" },
    { value: "User", label: "Student" },
    { value: "Staff", label: "Staff" },
    { value: "FinanceOfficer", label: "Finance Officer" },
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
      setTotalUsers(response?.data?.totalItems || response.total || 0);
      setTotalPages(
        response.totalPages || Math.ceil((response.totalCount || 0) / pageSize)
      );
    } catch (err) {
      console.error("Error loading user list:", err);
      setError("Unable to load account list. Please try again later.");
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
    if (!window.confirm("Are you sure you want to delete this account?"))
      return;

    try {
      await userService.deleteUser(id);
      setUsers(users.filter((u) => u.id !== id));
      alert("Delete successful!");
    } catch (err) {
      console.error("Error deleting:", err);
      alert("Delete failed!");
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === "Active" ? "Inactive" : "Active";
    const confirmMessage =
      newStatus === "Active"
        ? "Are you sure you want to activate this account?"
        : "Are you sure you want to deactivate this account?";

    if (!window.confirm(confirmMessage)) return;

    try {
      // Call API to update status
      await userService.updateUserStatus(user.id, { status: newStatus });

      // Update local state
      setUsers(
        users.map((u) =>
          u.id === user.id
            ? { ...u, status: newStatus, isActive: newStatus === "Active" }
            : u
        )
      );

      alert(
        `Account has been ${
          newStatus === "Active" ? "activated" : "deactivated"
        }!`
      );
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Status update failed!");
    }
  };

  // Trong handleCreateSuccess của AccountManagement
  const handleCreateSuccess = (newUser) => {
    // Optimistic update - thêm user mới ngay lập tức
    setUsers((prevUsers) => [newUser, ...prevUsers]);
    setTotalUsers((prev) => prev + 1);
    setShowCreateModal(false);

    // Optionally fetch lại để đảm bảo data consistency
    setTimeout(() => {
      fetchUsers();
    }, 500);
  };

  const handleEditSuccess = (updatedUser) => {
    setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    setShowEditModal(false);
    alert("Account updated successfully!");
  };

  const handleExport = () => {
    // Filter and format data for export
    const exportData = users.map((user) => ({
      ID: user.id,
      "Full Name": user.name || user.fullName,
      Email: user.email,
      Role: user.role,
      Status: user.status === "Active" ? "Active" : "Inactive",
      "Created Date": user.createdAt || new Date().toLocaleDateString(),
    }));

    // Create CSV
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

    alert("CSV file exported successfully!");
  };

  // Function to format role display
  const formatRoleDisplay = (user) => {
    // If user.roles is an array, take the first role
    const role =
      Array.isArray(user.roles) && user.roles.length > 0
        ? user.roles[0].name
        : user.role || "Not specified";

    const roleMap = {
      Mentor: "Mentor",
      User: "Student",
      Staff: "Staff",
      Finance: "Finance Staff",
      "Giảng viên": "Mentor",
      "Sinh viên": "Student",
      "Quản trị viên": "Staff",
      "Nhân viên tài chính": "Finance Staff",
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
        <h1 className="text-3xl font-bold text-gray-800">Account Management</h1>
        <p className="text-gray-600">
          Manage and create accounts for lecturers and finance staff
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
              placeholder="Search by name, email, or ID..."
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
              <span>Create Account</span>
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
          <p className="mt-2 text-gray-600">Loading data...</p>
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
            Retry
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
                      Full Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
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
                        <p>No accounts found.</p>
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          #{user.id}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {user.name || user.fullName || "Not updated"}
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
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewUser(user)}
                              className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                              title="View details"
                            >
                              <Eye size={16} />
                            </button>
                            {/* <button
                              onClick={() => handleEditUser(user)}
                              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button> */}
                            <button
                              onClick={() => handleToggleStatus(user)}
                              className="p-1.5 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded"
                              title={
                                user.status === "Active"
                                  ? "Deactivate account"
                                  : "Activate account"
                              }
                            >
                              {user.status === "Active" || user.isActive ? (
                                <Lock size={16} />
                              ) : (
                                <Unlock size={16} />
                              )}
                            </button>
                            {/* <button
                              onClick={() => handleDelete(user.id)}
                              className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                              title="Delete account"
                            >
                              <Trash2 size={16} />
                            </button> */}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => setPageIndex((p) => Math.max(1, p - 1))}
                disabled={pageIndex === 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-4 text-sm">
                Page {pageIndex} / {totalPages}
              </span>
              <button
                onClick={() => setPageIndex((p) => Math.min(totalPages, p + 1))}
                disabled={pageIndex === totalPages}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Quick Statistics */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Accounts</p>
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
                <p className="text-sm text-gray-500">Mentors</p>
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
                <p className="text-sm text-gray-500">Finance Officer</p>
                <p className="text-2xl font-bold">
                  {
                    users.filter(
                      (u) =>
                        (Array.isArray(u.roles) &&
                          u.roles[0]?.name === "FinanceOfficer") ||
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
                <p className="text-sm text-gray-500">Active Accounts</p>
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
