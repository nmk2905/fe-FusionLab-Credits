// src/pages/StudentAccount.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  IdCard,
  Calendar,
  Clock,
  Shield,
  CheckCircle,
  XCircle,
  Loader2,
  Edit3,
  Save,
  X,
} from "lucide-react";
import userService from "../../../services/apis/userApi";
import { getUserInfoFromToken } from "../../../utils/tokenUtils";
import { format } from "date-fns";
import { apiUtils } from "../../../utils/apiUtils";
import { API_ENDPOINTS_USER } from "../../../constants/apiEndPoint";

export default function StudentAccount() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editForm, setEditForm] = useState({
    fullName: "",
    phoneNumber: "",
    studentCode: "",
  });

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
        if (!token) {
          setError("No authentication token found. Please log in again.");
          setLoading(false);
          return;
        }

        const userInfo = getUserInfoFromToken(token);
        if (!userInfo?.id) {
          setError("Unable to retrieve user ID from token.");
          setLoading(false);
          return;
        }

        const response = await userService.getCurrentUser(userInfo.id);

        if (response.success) {
          const userData = response.data;
          setUser(userData);
          setEditForm({
            fullName: userData.fullName || "",
            phoneNumber: userData.phoneNumber || "",
            studentCode: userData.studentCode || "",
          });
        } else {
          setError(response.error || "Failed to load account information");
        }
      } catch (err) {
        setError("An error occurred while loading account information");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleSave = async () => {
    if (!user?.id) return;

    setSaving(true);
    try {
      const response = await apiUtils.put(API_ENDPOINTS_USER.GET_USER(user.id), {
        fullName: editForm.fullName.trim(),
        phoneNumber: editForm.phoneNumber.trim(),
        studentCode: editForm.studentCode.trim(),
        status: user.status || "Active",
      });

      if (response.success) {
        setUser((prev) => ({
          ...prev,
          fullName: editForm.fullName,
          phoneNumber: editForm.phoneNumber,
          studentCode: editForm.studentCode,
        }));
        setIsEditing(false);
        alert("Profile updated successfully!");
      } else {
        alert(response.error || "Update failed. Please try again.");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("An error occurred while saving changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditForm({
      fullName: user?.fullName || "",
      phoneNumber: user?.phoneNumber || "",
      studentCode: user?.studentCode || "",
    });
    setIsEditing(false);
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm");
  };

  const getStatusBadge = (status) => {
    const isActive = ["active", "hoạt động"].includes(status?.toLowerCase());
    return (
      <span
        className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 w-fit ${
          isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}
      >
        {isActive ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
        {status || "Unknown"}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <XCircle className="w-16 h-16 text-red-500 mb-4" />
        <p className="text-xl text-gray-700">{error || "Unable to load profile"}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-5xl font-bold shadow-xl">
              {user.fullName?.[0]?.toUpperCase() || user.userName?.[0]?.toUpperCase() || "U"}
            </div>

            <div className="text-center md:text-left flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="text-3xl font-bold text-gray-900 bg-gray-100 px-4 py-2 rounded-lg w-full max-w-md border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Full Name"
                  autoFocus
                />
              ) : (
                <h1 className="text-3xl font-bold text-gray-900">
                  {user.fullName || "Not set"}
                </h1>
              )}

              <p className="text-gray-600 mt-1">@{user.userName}</p>

              <div className="mt-4 flex flex-wrap gap-3 justify-center md:justify-start">
                {user.roles?.map((role) => (
                  <span
                    key={role.id}
                    className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    {role.name}
                  </span>
                ))}
                {getStatusBadge(user.status)}
              </div>

              {/* Edit Button */}
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-6 flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition shadow-md"
                >
                  <Edit3 size={18} />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
              <User className="w-6 h-6 text-blue-600" />
              Personal Information
            </h2>

            <div className="space-y-5">
              <div>
                <p className="text-sm text-gray-500">Student ID</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.studentCode}
                    onChange={(e) => setEditForm({ ...editForm, studentCode: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., HE123456"
                  />
                ) : (
                  <p className="font-medium text-gray-900 mt-1">
                    {user.studentCode || "Not set"}
                  </p>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900 flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4 text-gray-500" />
                  {user.email}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Phone Number</p>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editForm.phoneNumber}
                    onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 0901234567"
                  />
                ) : (
                  <p className="font-medium text-gray-900 mt-1">
                    {user.phoneNumber || "Not set"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Account Activity */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
              <Calendar className="w-6 h-6 text-green-600" />
              Account Activity
            </h2>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Clock className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Account Created</p>
                  <p className="font-medium text-gray-900">{formatDate(user.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="font-medium text-gray-900">{formatDate(user.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save/Cancel Buttons (Edit Mode) */}
        {isEditing && (
          <div className="mt-10 flex justify-end gap-4">
            <button
              onClick={handleCancel}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition"
              disabled={saving}
            >
              <X size={18} />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !editForm.fullName.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition shadow-md"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          Email and username cannot be changed. Contact administrator if needed.
        </div>
      </motion.div>
    </div>
  );
}