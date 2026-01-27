// src/ProjectDetail/components/MilestonesTab/MilestonePopup.jsx
import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Save,
  Calendar,
  Target,
  AlertCircle,
  Loader,
  ChevronDown,
} from "lucide-react";
import projectService from "../../../../services/apis/projectApi";
import milestoneService from "../../../../services/apis/milestoneApi";
import { AuthContext } from "../../../../contexts/AuthContext";

const MilestonePopup = ({ projectId, isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    startDate: "",
    projectId: projectId || "",
    status: "PENDING",
    weight: "",
    isDelayed: false,
    originalDueDate: "",
  });

  // Lấy danh sách project khi component mount
  useEffect(() => {
    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen]);

  // Reset form khi popup mở
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: "",
        description: "",
        dueDate: "",
        startDate: "",
        projectId: projectId || "",
        status: "Pending",
        weight: "",
        isDelayed: false,
        originalDueDate: "",
      });
      setError("");
      setSuccess("");
    }
  }, [isOpen, projectId]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectService.getProjectByMentorId(
        user.id,
        100,
        1,
        "Desc",
      );
      if (response.rawResponse && response.rawResponse.data) {
        setProjects(response.rawResponse.data);
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError("Failed to load projects. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Lọc project theo projectId được truyền vào
  const filteredProjects = projects.filter((project) => {
    if (projectId) {
      return project.id == projectId;
    }
    return true; // Nếu không có projectId, hiển thị tất cả
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    const updatedFormData = {
      ...formData,
      [name]:
        type === "checkbox"
          ? checked
          : name === "weight"
            ? value // Giữ nguyên string để xử lý validation
            : name === "projectId"
              ? parseInt(value) || ""
              : value,
    };

    // Nếu bật isDelayed, tự động điền originalDueDate từ dueDate nếu chưa có
    if (
      name === "isDelayed" &&
      checked &&
      !formData.originalDueDate &&
      formData.dueDate
    ) {
      updatedFormData.originalDueDate = formData.dueDate;
    }

    // Nếu tắt isDelayed, xóa originalDueDate
    if (name === "isDelayed" && !checked) {
      updatedFormData.originalDueDate = "";
    }

    // Nếu thay đổi dueDate khi isDelayed đang bật, cập nhật originalDueDate nếu chưa có
    if (name === "dueDate" && formData.isDelayed && !formData.originalDueDate) {
      updatedFormData.originalDueDate = formData.dueDate;
    }

    setFormData(updatedFormData);

    // Clear messages khi người dùng bắt đầu nhập
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleWeightChange = (e) => {
    const value = e.target.value;

    // Chỉ cho phép số và dấu chấm
    if (!/^\d*\.?\d*$/.test(value)) return;

    // Cho phép rỗng, 0, 0.x, 1, 1.0
    setFormData({
      ...formData,
      weight: value,
    });

    if (error) setError("");
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    const dateValue = value ? new Date(value).toISOString() : "";

    const updatedFormData = {
      ...formData,
      [name]: dateValue,
    };

    // Nếu thay đổi dueDate khi isDelayed đang bật, cập nhật originalDueDate nếu chưa có
    if (name === "dueDate" && formData.isDelayed && !formData.originalDueDate) {
      updatedFormData.originalDueDate = dateValue;
    }

    setFormData(updatedFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.title.trim()) {
      setError("Milestone name is required");
      return;
    }

    if (!formData.projectId) {
      setError("Please select a project");
      return;
    }

    if (!formData.dueDate) {
      setError("Due date is required");
      return;
    }

    // Validate weight
    const weightValue =
      formData.weight === "" ? 0 : parseFloat(formData.weight);

    // Nếu user nhập khác 0 thì phải > 0 và ≤ 1
    if (weightValue !== 0 && (weightValue <= 0 || weightValue > 1)) {
      setError("Weight must be greater than 0 and less than or equal to 1");
      return;
    }

    // Chuẩn bị dữ liệu để gửi API
    const milestoneData = {
      ...formData,
      startDate: formData.startDate || new Date().toISOString(),
      dueDate: new Date(formData.dueDate).toISOString(),
      // Chỉ gửi originalDueDate nếu isDelayed là true
      originalDueDate: formData.isDelayed
        ? formData.originalDueDate || new Date(formData.dueDate).toISOString()
        : null,
      projectId: parseInt(formData.projectId),
      weight: weightValue || 0,
      status: formData.status,
    };

    console.log("Sending milestone data:", milestoneData);

    try {
      setLoading(true);
      setError("");

      // Gọi API tạo milestone
      const response = await milestoneService.addMilestone(milestoneData);

      console.log("API Response:", response);

      // Kiểm tra nếu API trả về success = false
      if (response.success === false) {
        // Sử dụng message từ response nếu có
        const errorMessage =
          response.message ||
          response.data?.message ||
          "Failed to create milestone";
        setError(errorMessage);

        // Log lỗi ra console
        console.error("Milestone creation failed:", response);
        return; // Dừng lại, không chạy tiếp phần thành công
      }

      // Nếu response.success = true hoặc không có trường success
      console.log("Milestone created successfully:", response);
      setSuccess("Milestone created successfully!");

      // Gọi callback onSuccess nếu có
      if (onSuccess) {
        onSuccess(response);
      }

      // Auto close sau 2 giây
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error("Error creating milestone:", err);

      // Hiển thị lỗi từ API nếu có
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Failed to create milestone. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Format date cho input type="date"
  const formatDateForInput = (isoDate) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    return date.toISOString().split("T")[0];
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
          className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl z-10">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Target className="text-blue-600" size={24} />
                  </div>
                  <span>Create New Milestone</span>
                </h2>
                <p className="text-gray-600 mt-2 ml-11">
                  Define important milestones for project tracking
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
            {/* Error Message */}
            {error && (
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

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Milestone Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Milestone Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400"
                  placeholder="Enter milestone title"
                  required
                  disabled={loading}
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Description
                  <span className="text-gray-500 font-normal ml-2">
                    (Optional)
                  </span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 resize-none"
                  placeholder="Describe the milestone requirements, objectives, or notes..."
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Start Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Start Date *
                  </label>
                  <div className="relative">
                    <Calendar
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="date"
                      name="startDate"
                      value={formatDateForInput(formData.startDate)}
                      onChange={handleDateChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Due Date *
                  </label>
                  <div className="relative">
                    <Calendar
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="date"
                      name="dueDate"
                      value={formatDateForInput(formData.dueDate)}
                      onChange={handleDateChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Weight - Đã sửa */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Weight
                    <span className="text-gray-500 font-normal ml-2">
                      (0 ≤ weight ≤ 1)
                    </span>
                  </label>
                  <input
                    type="text"
                    name="weight"
                    value={formData.weight}
                    onChange={handleWeightChange}
                    onKeyDown={(e) => {
                      // Ngăn không cho nhập ký tự không phải số
                      if (["e", "E", "+", "-"].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="0.01 - 1.00"
                    disabled={loading}
                    min="0.01"
                    max="1"
                    step="0.01"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Enter a value between 0.01 and 1.00 (e.g., 0.25 for 25%)
                  </p>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Status
                  </label>
                  <div className="relative">
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none bg-white"
                      disabled={loading}
                    >
                      <option value="Pending">⏳ Pending</option>
                      <option value="In Progress">🚧 In Progress</option>
                      <option value="Completed">✅ Completed</option>
                      <option value="Delayed">⚠️ Delayed</option>
                    </select>
                    <ChevronDown
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                      size={20}
                    />
                  </div>
                </div>

                {/* Project Selection - Đã sửa */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Associated Project *
                  </label>
                  <div className="relative">
                    <select
                      name="projectId"
                      value={formData.projectId}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none bg-white"
                      required
                      disabled={loading || projects.length === 0}
                    >
                      <option value="">
                        {loading
                          ? "Loading projects..."
                          : filteredProjects.length === 0
                            ? "No projects available"
                            : "Select a project"}
                      </option>
                      {filteredProjects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.title || `Project ${project.id}`}
                          {projectId &&
                            project.id === projectId &&
                            " (Current)"}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                      size={20}
                    />
                  </div>
                  {projectId && (
                    <p className="text-sm text-blue-600 mt-2">
                      Showing project matching the current context
                    </p>
                  )}
                </div>

                {/* Original Due Date - Chỉ hiển thị khi isDelayed = true */}
                {formData.isDelayed && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Original Due Date (Before Delay) *
                    </label>
                    <div className="relative">
                      <Calendar
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-500"
                        size={20}
                      />
                      <input
                        type="date"
                        name="originalDueDate"
                        value={formatDateForInput(formData.originalDueDate)}
                        onChange={handleDateChange}
                        className="w-full pl-12 pr-4 py-3 border border-amber-300 bg-amber-50 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                        required={formData.isDelayed}
                        disabled={loading}
                      />
                    </div>
                    <p className="mt-2 text-sm text-amber-600">
                      This field is required because the milestone is marked as
                      delayed
                    </p>
                  </div>
                )}
              </div>

              {/* Is Delayed Checkbox */}
              {/* <div
                className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-200 ${
                  formData.isDelayed
                    ? "bg-amber-50 border border-amber-200"
                    : "bg-gray-50"
                }`}
              >
                <div
                  className={`flex items-center justify-center h-6 w-6 border rounded ${
                    formData.isDelayed
                      ? "border-amber-500 bg-amber-500"
                      : "border-gray-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    id="isDelayed"
                    name="isDelayed"
                    checked={formData.isDelayed}
                    onChange={handleChange}
                    className="opacity-0 absolute h-6 w-6 cursor-pointer"
                    disabled={loading}
                  />
                  {formData.isDelayed && (
                    <svg
                      className="h-4 w-4 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="isDelayed"
                    className="text-sm font-semibold text-gray-800 cursor-pointer flex items-center gap-2"
                  >
                    Mark as delayed
                    {formData.isDelayed && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        <AlertCircle size={12} className="mr-1" />
                        Active
                      </span>
                    )}
                  </label>
                  <p className="text-sm text-gray-600 mt-1">
                    Check this if the milestone is delayed from its original schedule
                  </p>
                </div>
              </div> */}

              {/* Submit Button */}
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
                  className={`flex-1 flex items-center justify-center gap-3 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed`}
                >
                  {loading ? (
                    <>
                      <Loader className="animate-spin" size={20} />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      Create Milestone
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MilestonePopup;
