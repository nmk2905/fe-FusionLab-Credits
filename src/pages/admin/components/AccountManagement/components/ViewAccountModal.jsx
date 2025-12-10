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

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">Account Details</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg"
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

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Role:</span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user.role === "Mentor"
                    ? "bg-purple-100 text-purple-800"
                    : user.role === "Finance"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {user.role}
              </span>
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
                      ? "text-green-600"
                      : "text-red-600"
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
          </div>
        </div>

        <div className="p-6 border-t">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
