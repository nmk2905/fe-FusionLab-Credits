import React from "react";
import {
  X,
  Mail,
  User,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function ViewAccountModal({ isOpen, onClose, user }) {
  if (!isOpen || !user) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "Not updated";
    return new Date(dateString).toLocaleDateString("en-US");
  };

  // Hàm map role name từ backend sang display name
  const getRoleDisplay = (roleName) => {
    const roleMap = {
      Admin: "staff",
      User: "student",
      Mentor: "mentor",
      Finance: "finance",
      Staff: "staff",
      Student: "student",
    };
    return roleMap[roleName] || roleName;
  };

  // Hàm lấy style cho role dựa trên display name
  const getRoleStyle = (roleName) => {
    const displayName = getRoleDisplay(roleName);

    switch (displayName.toLowerCase()) {
      case "mentor":
        return "bg-purple-100 text-purple-800 border border-purple-200";
      case "finance":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "staff":
        return "bg-red-100 text-red-800 border border-red-200";
      case "student":
        return "bg-green-100 text-green-800 border border-green-200";
      default:
        return "bg-blue-100 text-blue-800 border border-blue-200";
    }
  };

  // Hàm lấy role chính ưu tiên (nếu chỉ muốn hiển thị 1 role)
  const getPrimaryRole = () => {
    if (!user.roles || user.roles.length === 0)
      return { name: "No Role", display: "No Role" };

    const priorityOrder = [
      "Mentor",
      "Finance",
      "Staff",
      "Admin",
      "Student",
      "User",
    ];

    for (const roleName of priorityOrder) {
      const foundRole = user.roles.find(
        (role) =>
          role.name === roleName ||
          getRoleDisplay(role.name).toLowerCase() === roleName.toLowerCase()
      );
      if (foundRole) {
        return {
          name: foundRole.name,
          display: getRoleDisplay(foundRole.name),
        };
      }
    }

    const firstRole = user.roles[0];
    return {
      name: firstRole.name,
      display: getRoleDisplay(firstRole.name),
    };
  };

  const primaryRole = getPrimaryRole();

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">Account Details</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User size={32} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                {user.name || user.fullName}
              </h3>
              <div className="flex items-center gap-2 text-gray-600">
                <Mail size={16} />
                <span>{user.email}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">ID:</span>
              <span className="font-medium">#{user.id}</span>
            </div>

            {/* Hiển thị role chính và tất cả các role */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Main Role:</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleStyle(
                    primaryRole.name
                  )}`}
                >
                  {primaryRole.display.charAt(0).toUpperCase() +
                    primaryRole.display.slice(1)}
                </span>
              </div>

              {user.roles && user.roles.length > 1 && (
                <div className="flex justify-between items-start">
                  <span className="text-gray-600 pt-1">All Roles:</span>
                  <div className="flex flex-wrap gap-2 justify-end">
                    {user.roles.map((role, index) => {
                      const displayName = getRoleDisplay(role.name);
                      return (
                        <span
                          key={index}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleStyle(
                            role.name
                          )}`}
                        >
                          {displayName.charAt(0).toUpperCase() +
                            displayName.slice(1)}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Status:</span>
              <div className="flex items-center gap-2">
                {user.status === "Active" || user.isActive ? (
                  <CheckCircle size={16} className="text-green-500" />
                ) : (
                  <XCircle size={16} className="text-red-500" />
                )}
                <span
                  className={
                    user.status === "Active" || user.isActive
                      ? "text-green-600 font-medium"
                      : "text-red-600 font-medium"
                  }
                >
                  {user.status === "Active" || user.isActive
                    ? "Active"
                    : "Inactive"}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Created Date:</span>
              <span className="font-medium">{formatDate(user.createdAt)}</span>
            </div>

            {user.phone && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Phone Number:</span>
                <span className="font-medium">{user.phone}</span>
              </div>
            )}

            {user.department && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Department:</span>
                <span className="font-medium">{user.department}</span>
              </div>
            )}

            {user.address && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Address:</span>
                <span className="font-medium text-right max-w-[200px]">
                  {user.address}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
