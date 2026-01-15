import React, { useState, useEffect } from "react";
import taskService from "../../../../../services/apis/taskApi";
import projectMemberService from "../../../../../services/apis/projectMemberApi";
import userService from "../../../../../services/apis/userApi";
import { useParams } from "react-router-dom";
import { useNotification } from "../../../../../hook/useNotification";

const CreateTaskPopup = ({ isOpen, onClose, milestoneId, onTaskAdded }) => {
  const { showNotification } = useNotification();
  const [taskData, setTaskData] = useState({
    label: "",
    description: "",
    priority: "Medium",
    complexity: 3,
    estimatedHours: 8,
    weight: 0.1,
    status: "Not Started",
    startDate: "",
    dueDate: "",
    assigneeId: "",
    parentTaskId: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { projectId } = useParams();
  const [assignees, setAssignees] = useState([]);
  const [loadingAssignees, setLoadingAssignees] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && projectId) {
      fetchProjectMembers();
      // Set default dates
      const today = new Date().toISOString().split("T")[0];
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      setTaskData((prev) => ({
        ...prev,
        startDate: today,
        dueDate: nextWeek,
      }));
    }
  }, [isOpen, projectId]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const fetchProjectMembers = async () => {
    setLoadingAssignees(true);
    try {
      const membersResponse = await projectMemberService.getProjectMembers({
        projectId: projectId,
      });

      const memberData = membersResponse?.rawResponse?.data || [];

      if (memberData.length > 0) {
        const userIds = memberData.map((member) => member.userId);
        const userPromises = userIds.map((userId) =>
          userService.getCurrentUser(userId)
        );

        const userResponses = await Promise.all(userPromises);
        const users = userResponses.map((response, index) => {
          const user = response?.rawResponse?.data;
          const member = memberData[index];

          return {
            userId: member.userId,
            fullName: user?.fullName || `User ${member.userId}`,
            email: user?.email || "",
            memberId: member.id,
            role: member.role,
            avatar:
              user?.avatar ||
              `https://ui-avatars.com/api/?name=${
                user?.fullName || "User"
              }&background=random`,
          };
        });

        setAssignees(users);

        if (users.length > 0 && !taskData.assigneeId) {
          setTaskData((prev) => ({
            ...prev,
            assigneeId: users[0].userId,
          }));
        }
      }
    } catch (err) {
      console.error("Error fetching project members:", err);
      showNotification("Failed to load team members.", "error");
    } finally {
      setLoadingAssignees(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    if (type === "number") {
      setTaskData({
        ...taskData,
        [name]: value === "" ? "" : parseFloat(value),
      });
      return;
    }

    setTaskData({
      ...taskData,
      [name]: value,
    });
  };

  const handleSliderChange = (name, value) => {
    setTaskData({
      ...taskData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    if (!taskData.label.trim()) {
      setError("Task label is required");
      setIsSubmitting(false);
      return;
    }

    try {
      const dataToSend = {
        ...taskData,
        milestoneId: milestoneId,
        startDate: taskData.startDate
          ? new Date(taskData.startDate).toISOString()
          : new Date().toISOString(),
        dueDate: taskData.dueDate
          ? new Date(taskData.dueDate).toISOString()
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        weight: parseFloat(taskData.weight),
        complexity: parseInt(taskData.complexity),
        estimatedHours: parseInt(taskData.estimatedHours),
      };

      const response = await taskService.addTask(dataToSend);

      if (response && response.data) {
        showNotification("🎉 Task created successfully!", "success");
        onTaskAdded();
        onClose();
        setTaskData({
          label: "",
          description: "",
          priority: "Medium",
          complexity: 3,
          estimatedHours: 8,
          weight: 0.1,
          status: "Not Started",
          startDate: new Date().toISOString().split("T")[0],
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          assigneeId: assignees.length > 0 ? assignees[0].userId : "",
          parentTaskId: null,
        });
      }
    } catch (err) {
      console.error("Error adding task:", err);
      setError(
        err.response?.data?.message ||
          "Failed to create task. Please try again."
      );
      showNotification("Failed to create task. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const priorityColors = {
    Low: "bg-green-100 text-green-800",
    Medium: "bg-yellow-100 text-yellow-800",
    High: "bg-orange-100 text-orange-800",
    Critical: "bg-red-100 text-red-800",
  };

  const statusColors = {
    "Not Started": "bg-gray-100 text-gray-800",
    Pending: "bg-blue-100 text-blue-800",
    "In Progress": "bg-purple-100 text-purple-800",
    Completed: "bg-green-100 text-green-800",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">
                  Create New Task
                </h3>
                <p className="text-blue-100 mt-1">
                  Add a new task to this milestone
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-6">
            {error && (
              <div className="mb-6 rounded-xl bg-red-50 p-4 border border-red-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-1 text-sm text-red-700">{error}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Task Label */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Task Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="label"
                      value={taskData.label}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="What needs to be done?"
                      autoFocus
                    />
                    <div className="absolute right-3 top-3">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Description
                  </label>
                  <div className="relative">
                    <textarea
                      name="description"
                      value={taskData.description}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                      placeholder="Describe the task details, requirements, and objectives..."
                    />
                    <div className="absolute right-3 top-3">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                        />
                      </svg>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {taskData.description.length}/500 characters
                  </p>
                </div>

                {/* Assignee */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Assign To
                  </label>
                  {loadingAssignees ? (
                    <div className="flex items-center justify-center px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">
                        Loading team members...
                      </span>
                    </div>
                  ) : assignees.length === 0 ? (
                    <div className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-500">
                      No team members available
                    </div>
                  ) : (
                    <div className="relative">
                      <select
                        name="assigneeId"
                        value={taskData.assigneeId}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                      >
                        {assignees.map((user) => (
                          <option key={user.userId} value={user.userId}>
                            {user.fullName} • {user.role}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-3 pointer-events-none">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          viewBox="0 0 20 20"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 7l3-3 3 3m0 6l-3 3-3-3"
                          />
                        </svg>
                      </div>

                      {/* Selected assignee preview */}
                      {taskData.assigneeId && (
                        <div className="mt-3 flex items-center px-3 py-2 bg-blue-50 rounded-lg">
                          <div className="flex-shrink-0">
                            <img
                              src={
                                assignees.find(
                                  (u) => u.userId === taskData.assigneeId
                                )?.avatar
                              }
                              alt=""
                              className="h-8 w-8 rounded-full"
                            />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {
                                assignees.find(
                                  (u) => u.userId === taskData.assigneeId
                                )?.fullName
                              }
                            </p>
                            <p className="text-xs text-gray-500">
                              {
                                assignees.find(
                                  (u) => u.userId === taskData.assigneeId
                                )?.role
                              }
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Priority & Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Priority
                    </label>
                    <div className="space-y-2">
                      {["Low", "Medium", "High", "Critical"].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() =>
                            setTaskData({ ...taskData, priority: level })
                          }
                          className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            taskData.priority === level
                              ? priorityColors[level] +
                                " ring-2 ring-offset-1 ring-blue-300"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Status
                    </label>
                    <div className="space-y-2">
                      {[
                        "Not Started",
                        "Pending",
                        "In Progress",
                        "Completed",
                      ].map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setTaskData({ ...taskData, status })}
                          className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            taskData.status === status
                              ? statusColors[status] +
                                " ring-2 ring-offset-1 ring-blue-300"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Complexity Slider */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-semibold text-gray-900">
                      Complexity
                    </label>
                    <span className="text-lg font-bold text-blue-600">
                      {taskData.complexity}/10
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={taskData.complexity}
                    onChange={(e) =>
                      handleSliderChange("complexity", parseInt(e.target.value))
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Simple</span>
                    <span>Complex</span>
                  </div>
                </div>

                {/* Estimated Hours */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Estimated Hours
                  </label>
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() =>
                        setTaskData({
                          ...taskData,
                          estimatedHours: Math.max(
                            1,
                            taskData.estimatedHours - 1
                          ),
                        })
                      }
                      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 12H4"
                        />
                      </svg>
                    </button>
                    <div className="flex-1 text-center">
                      <span className="text-3xl font-bold text-gray-900">
                        {taskData.estimatedHours}
                      </span>
                      <span className="ml-2 text-gray-600">hours</span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setTaskData({
                          ...taskData,
                          estimatedHours: taskData.estimatedHours + 1,
                        })
                      }
                      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Weight */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-semibold text-gray-900">
                      Weight
                    </label>
                    <span className="text-lg font-bold text-blue-600">
                      {(taskData.weight * 100).toFixed(0)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={taskData.weight}
                    onChange={(e) =>
                      handleSliderChange("weight", parseFloat(e.target.value))
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600"
                  />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Start Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="startDate"
                        value={taskData.startDate}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Due Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="dueDate"
                        value={taskData.dueDate}
                        onChange={handleChange}
                        required
                        min={
                          taskData.startDate ||
                          new Date().toISOString().split("T")[0]
                        }
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Date Info */}
                {taskData.startDate && taskData.dueDate && (
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <p className="text-sm text-blue-800">
                      Duration:{" "}
                      {Math.ceil(
                        (new Date(taskData.dueDate) -
                          new Date(taskData.startDate)) /
                          (1000 * 60 * 60 * 24)
                      )}{" "}
                      days
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || loadingAssignees}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating Task...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Create Task
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTaskPopup;
