// src/components/Milestones/MilestoneUpdatePopup.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Save,
  Calendar,
  AlertCircle,
  Loader,
  Clock,
  AlertTriangle,
} from "lucide-react";
import milestoneService from "../../../../services/apis/milestoneApi";

const MilestoneUpdatePopup = ({ milestoneId, isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [milestoneData, setMilestoneData] = useState(null);

  const [formData, setFormData] = useState({
    isDelayed: false,
    originalDueDate: "",
    dueDate: "", // Thêm dueDate cho ngày kết thúc mới
  });

  // Fetch milestone data khi popup mở
  useEffect(() => {
    if (isOpen && milestoneId) {
      fetchMilestoneData();
    }
  }, [isOpen, milestoneId]);

  // Reset form khi popup mở
  useEffect(() => {
    if (isOpen) {
      setFormData({
        isDelayed: false,
        originalDueDate: "",
        dueDate: "",
      });
      setError("");
      setSuccess("");
      setMilestoneData(null);
    }
  }, [isOpen]);

  const fetchMilestoneData = async () => {
    try {
      setFetching(true);
      const response = await milestoneService.getMilestoneById(milestoneId);
      setMilestoneData(response.data);

      // Pre-fill form với dữ liệu hiện tại
      setFormData({
        isDelayed: response.data.isDelayed || false,
        originalDueDate: response.data.originalDueDate || response.data.dueDate,
        dueDate: response.data.dueDate, // Set dueDate hiện tại làm giá trị mặc định
      });
    } catch (err) {
      console.error("Error fetching milestone:", err);
      setError("Failed to load milestone data. Please try again.");
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    const updatedFormData = {
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    };

    // Nếu bật isDelayed, tự động lấy originalDueDate từ dueDate hiện tại
    if (
      name === "isDelayed" &&
      checked &&
      !formData.originalDueDate &&
      milestoneData
    ) {
      updatedFormData.originalDueDate = milestoneData.dueDate;
    }

    // Nếu tắt isDelayed, reset về giá trị ban đầu
    if (name === "isDelayed" && !checked) {
      updatedFormData.originalDueDate = "";
      updatedFormData.dueDate = milestoneData?.dueDate || "";
    }

    setFormData(updatedFormData);

    // Clear messages khi người dùng bắt đầu nhập
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    const dateValue = value ? new Date(value).toISOString() : "";

    setFormData({
      ...formData,
      [name]: dateValue,
    });
  };

  const validateForm = () => {
    if (formData.isDelayed) {
      if (!formData.dueDate) {
        setError("New due date is required for delayed milestone");
        return false;
      }
      // Kiểm tra ngày mới phải sau ngày originalDueDate
      if (new Date(formData.dueDate) <= new Date(formData.originalDueDate)) {
        setError("New due date must be later than the original due date");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Chuẩn bị dữ liệu để cập nhật - gửi tất cả các field
    const updateData = {
      // Các field khác lấy từ milestoneData hiện tại
      title: milestoneData.title,
      description: milestoneData.description,
      startDate: milestoneData.startDate,
      weight: milestoneData.weight,
      status: milestoneData.status,

      // Chỉ thay đổi 3 field này
      isDelayed: formData.isDelayed,
      originalDueDate: formData.isDelayed ? formData.originalDueDate : null,
      dueDate: formData.dueDate, // Ngày kết thúc mới
    };

    console.log("Updating milestone with data:", updateData);

    try {
      setLoading(true);
      setError("");

      // Gọi API cập nhật milestone
      const response = await milestoneService.updateMilestone(
        milestoneId,
        updateData,
      );

      console.log("Update API Response:", response);

      // Kiểm tra nếu API trả về success = false
      if (response.success === false) {
        const errorMessage =
          response.message ||
          response.data?.message ||
          "Failed to update milestone";
        setError(errorMessage);
        return;
      }

      console.log("Milestone updated successfully:", response);
      setSuccess(
        formData.isDelayed
          ? "Milestone marked as delayed successfully with new due date!"
          : "Milestone delay status removed successfully!",
      );

      // Gọi callback onSuccess nếu có
      if (onSuccess) {
        onSuccess(response);
      }

      // Auto close sau 2 giây
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error("Error updating milestone:", err);

      // Hiển thị lỗi từ API nếu có
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Failed to update milestone. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Format date cho input type="date"
  const formatDateForInput = (isoDate) => {
    if (!isoDate) return "";
    try {
      const date = new Date(isoDate);
      return date.toISOString().split("T")[0];
    } catch (error) {
      return "";
    }
  };

  // Format date cho display
  const formatDateForDisplay = (isoDate) => {
    if (!isoDate) return "N/A";
    try {
      const date = new Date(isoDate);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  // Handle escape key to close
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Popup Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl z-10">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${formData.isDelayed ? "bg-red-100" : "bg-amber-100"}`}
                  >
                    {formData.isDelayed ? (
                      <AlertTriangle className="text-red-600" size={24} />
                    ) : (
                      <Clock className="text-amber-600" size={24} />
                    )}
                  </div>
                  <span>
                    {formData.isDelayed
                      ? "Mark as Delayed"
                      : "Update Delay Status"}
                  </span>
                </h2>
                <p className="text-gray-600 mt-2 ml-11">
                  {milestoneData?.title || `Milestone ${milestoneId}`}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X size={24} className="text-gray-500 hover:text-gray-700" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Loading state khi fetching data */}
            {fetching && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader
                    className="animate-spin text-blue-600 mx-auto"
                    size={32}
                  />
                  <p className="mt-4 text-gray-600">
                    Loading milestone data...
                  </p>
                </div>
              </div>
            )}

            {/* Error Message khi fetch failed */}
            {!fetching && error && !milestoneData && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 font-medium">{error}</p>
                <button
                  onClick={fetchMilestoneData}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Error Message từ form */}
            {error && milestoneData && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
              >
                <AlertCircle
                  className="text-red-500 mt-0.5 flex-shrink-0"
                  size={20}
                />
                <p className="text-red-700 font-medium">{error}</p>
              </motion.div>
            )}

            {/* Success Message */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3"
              >
                <AlertCircle
                  className="text-green-500 mt-0.5 flex-shrink-0"
                  size={20}
                />
                <p className="text-green-700 font-medium">{success}</p>
              </motion.div>
            )}

            {!fetching && milestoneData && (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Current Milestone Info - Readonly */}
                <div className="p-4 rounded-lg border bg-gray-50 border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock size={18} className="text-gray-500" />
                    Current Milestone Information
                  </h3>

                  <div className="space-y-4">
                    {/* Title & Description */}
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Title
                        </label>
                        <div className="p-2 bg-white border border-gray-200 rounded-md">
                          <p className="text-gray-900">{milestoneData.title}</p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Description
                        </label>
                        <div className="p-2 bg-white border border-gray-200 rounded-md">
                          <p className="text-gray-900">
                            {milestoneData.description || "No description"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Start Date
                        </label>
                        <div className="p-2 bg-white border border-gray-200 rounded-md">
                          <p className="text-gray-900">
                            {formatDateForDisplay(milestoneData.startDate)}
                          </p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Current Due Date
                        </label>
                        <div className="p-2 bg-white border border-gray-200 rounded-md">
                          <p className="text-gray-900">
                            {formatDateForDisplay(milestoneData.dueDate)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Weight & Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Weight
                        </label>
                        <div className="p-2 bg-white border border-gray-200 rounded-md">
                          <p className="text-gray-900">
                            {(milestoneData.weight * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Status
                        </label>
                        <div className="p-2 bg-white border border-gray-200 rounded-md">
                          <p className="text-gray-900">
                            {milestoneData.status}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Editable Fields Section */}
                <div className="p-4 rounded-lg border border-blue-200 bg-blue-50">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertTriangle size={18} className="text-blue-500" />
                    Delay Status Configuration
                  </h3>

                  {/* Is Delayed Toggle */}
                  <div
                    className={`flex items-start gap-4 p-4 rounded-lg transition-all duration-200 ${
                      formData.isDelayed
                        ? "bg-red-50 border border-red-200"
                        : "bg-white border border-gray-200"
                    }`}
                  >
                    <div className="flex items-center h-6">
                      <input
                        type="checkbox"
                        id="isDelayed"
                        name="isDelayed"
                        checked={formData.isDelayed}
                        onChange={handleChange}
                        className="h-5 w-5 text-red-600 rounded focus:ring-red-500 border-gray-300 cursor-pointer"
                        disabled={loading}
                      />
                    </div>
                    <div className="flex-1">
                      <label
                        htmlFor="isDelayed"
                        className="text-lg font-semibold text-gray-900 cursor-pointer flex items-center gap-2"
                      >
                        Mark as Delayed
                        {formData.isDelayed && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <AlertTriangle size={12} className="mr-1" />
                            Active
                          </span>
                        )}
                      </label>
                      <p className="text-sm text-gray-600 mt-1">
                        Check this to mark milestone as delayed. This will set
                        current due date as original due date and allow you to
                        set a new due date.
                      </p>
                    </div>
                  </div>

                  {/* Delay Information Fields (chỉ hiển thị khi isDelayed = true) */}
                  {formData.isDelayed && (
                    <div className="space-y-4 mt-4">
                      {/* Original Due Date - Readonly */}
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          Original Due Date (Auto-filled) *
                        </label>
                        <div className="p-3 bg-white border border-amber-300 rounded-lg flex items-center gap-3">
                          <Calendar className="text-amber-500" size={20} />
                          <div>
                            <p className="text-gray-900 font-medium">
                              {formatDateForDisplay(formData.originalDueDate)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Automatically set from current due date
                            </p>
                          </div>
                        </div>
                        <input
                          type="hidden"
                          name="originalDueDate"
                          value={formData.originalDueDate}
                        />
                      </div>

                      {/* New Due Date - Editable */}
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="mb-2">
                          <label className="block text-sm font-semibold text-gray-800">
                            New Due Date *
                          </label>
                          <p className="text-xs text-gray-600 mt-1">
                            Select the new deadline for the delayed milestone
                          </p>
                        </div>
                        <div className="relative">
                          <Calendar
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-red-500"
                            size={20}
                          />
                          <input
                            type="date"
                            name="dueDate"
                            value={formatDateForInput(formData.dueDate)}
                            onChange={handleDateChange}
                            className="w-full pl-12 pr-4 py-3 border border-red-300 bg-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                            required
                            disabled={loading}
                            min={formatDateForInput(new Date())}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Must be later than the original due date
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Summary of Changes */}
                <div className="p-4 rounded-lg border border-amber-200 bg-amber-50">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <AlertCircle size={18} className="text-amber-500" />
                    Update Summary
                  </h3>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 mt-0.5">•</span>
                      <span>
                        <strong>
                          Title, Description, Start Date, Weight, Status:
                        </strong>{" "}
                        Remain unchanged
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 mt-0.5">•</span>
                      <span>
                        <strong>isDelayed:</strong>{" "}
                        {formData.isDelayed ? (
                          <span className="text-red-600 font-medium">True</span>
                        ) : (
                          <span className="text-gray-600">False</span>
                        )}
                      </span>
                    </li>
                    {formData.isDelayed ? (
                      <>
                        <li className="flex items-start gap-2">
                          <span className="text-amber-600 mt-0.5">•</span>
                          <span>
                            <strong>originalDueDate:</strong>{" "}
                            <span className="text-amber-700">
                              {formatDateForDisplay(formData.originalDueDate)}
                            </span>
                            {" (from current due date)"}
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-amber-600 mt-0.5">•</span>
                          <span>
                            <strong>dueDate:</strong>{" "}
                            <span className="text-red-600 font-medium">
                              {formData.dueDate
                                ? formatDateForDisplay(formData.dueDate)
                                : "Select new date"}
                            </span>
                            {" (new deadline)"}
                          </span>
                        </li>
                      </>
                    ) : (
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600 mt-0.5">•</span>
                        <span>
                          <strong>dueDate:</strong>{" "}
                          <span className="text-gray-600">
                            {formatDateForDisplay(milestoneData.dueDate)}
                          </span>
                          {" (remains unchanged)"}
                        </span>
                      </li>
                    )}
                  </ul>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="flex-1 px-6 py-3.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex-1 flex items-center justify-center gap-3 px-6 py-3.5 ${
                      formData.isDelayed
                        ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                        : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    } text-white font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed`}
                  >
                    {loading ? (
                      <>
                        <Loader className="animate-spin" size={20} />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save size={20} />
                        {formData.isDelayed
                          ? "Save Delay Changes"
                          : "Update Status"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MilestoneUpdatePopup;
