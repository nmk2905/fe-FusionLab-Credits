// src/components/Admin/MilestonesManagement/components/CreateMilestone.jsx
import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { Save, Calendar, Target, AlertCircle, Loader } from "lucide-react";
import projectService from "../../../../../services/apis/projectApi";
import milestoneService from "../../../../../services/apis/milestoneApi";
import { AuthContext } from "../../../../../contexts/AuthContext";

export default function CreateMilestone() {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    startDate: "", // Thêm startDate theo yêu cầu
    projectId: "",
    status: "PENDING", // Chú ý: status phải là chữ hoa
    weight: 0,
    isDelayed: false,
    originalDueDate: "", // Thêm originalDueDate
  });

  // Lấy danh sách project khi component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectService.getProjectByMentorId(user.id, 100, 1, "Desc");
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "weight"
          ? parseFloat(value) || 0
          : name === "projectId"
          ? parseInt(value) || ""
          : value,
    }));

    // Clear messages khi người dùng bắt đầu nhập
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    const dateValue = value ? new Date(value).toISOString() : "";

    setFormData((prev) => ({
      ...prev,
      [name]: dateValue,
    }));
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

    // Chuẩn bị dữ liệu để gửi API
    const milestoneData = {
      ...formData,
      // Đảm bảo các trường date đúng định dạng ISO
      startDate: formData.startDate || new Date().toISOString(),
      dueDate: new Date(formData.dueDate).toISOString(),
      originalDueDate:
        formData.originalDueDate || new Date(formData.dueDate).toISOString(),
      // Đảm bảo projectId là số
      projectId: parseInt(formData.projectId),
      // Đảm bảo weight là số
      weight: parseFloat(formData.weight) || 0,
      // Status phải là chữ hoa
      status: formData.status.toUpperCase(),
    };

    console.log("Sending milestone data:", milestoneData);

    try {
      setLoading(true);
      setError("");

      // Gọi API tạo milestone
      const response = await milestoneService.addMilestone(milestoneData);

      console.log("Milestone created successfully:", response);

      setSuccess("Milestone created successfully!");

      // Reset form
      setFormData({
        title: "",
        description: "",
        dueDate: "",
        startDate: "",
        projectId: "",
        status: "PENDING",
        weight: 0,
        isDelayed: false,
        originalDueDate: "",
      });

      // Auto clear success message after 5 seconds
      setTimeout(() => {
        setSuccess("");
      }, 5000);
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
    return isoDate.split("T")[0];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Target className="text-blue-500" />
            Create New Milestone
          </h2>
          <p className="text-gray-600 mt-1">
            Define important milestones for project tracking
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle
              className="text-red-500 mt-0.5 flex-shrink-0"
              size={20}
            />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <AlertCircle
              className="text-green-500 mt-0.5 flex-shrink-0"
              size={20}
            />
            <p className="text-green-700">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Milestone Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Milestone Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="Enter milestone title"
              required
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="Describe the milestone requirements..."
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <div className="relative">
                <Calendar
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="date"
                  name="startDate"
                  value={formatDateForInput(formData.startDate)}
                  onChange={handleDateChange}
                  className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date *
              </label>
              <div className="relative">
                <Calendar
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="date"
                  name="dueDate"
                  value={formatDateForInput(formData.dueDate)}
                  onChange={handleDateChange}
                  className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Original Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Original Due Date
              </label>
              <div className="relative">
                <Calendar
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="date"
                  name="originalDueDate"
                  value={formatDateForInput(formData.originalDueDate)}
                  onChange={handleDateChange}
                  className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Project Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Associated Project *
              </label>
              <select
                name="projectId"
                value={formData.projectId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                required
                disabled={loading || projects.length === 0}
              >
                <option value="">
                  {projects.length === 0
                    ? "Loading projects..."
                    : "Select a project"}
                </option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title || `Project ${project.id}`}
                  </option>
                ))}
              </select>
              {projects.length === 0 && !loading && (
                <p className="text-sm text-gray-500 mt-1">
                  No projects available
                </p>
              )}
            </div>

            {/* Weight */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight (%)
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                min="0"
                max="100"
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="0-100"
                disabled={loading}
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                disabled={loading}
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="DELAYED">Delayed</option>
              </select>
            </div>
          </div>

          {/* Is Delayed Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isDelayed"
              name="isDelayed"
              checked={formData.isDelayed}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={loading}
            />
            <label htmlFor="isDelayed" className="ml-2 text-sm text-gray-700">
              Mark as delayed
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-lg transition-colors shadow-sm ${
                loading ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"
              }`}
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={18} />
                  Creating...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Create Milestone
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
