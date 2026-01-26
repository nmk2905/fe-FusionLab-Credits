// src/pages/ProjectDetail/components/MilestonesTab/TaskManagement/TaskList.jsx
import React, { useState, useEffect } from "react";
import taskService from "../../../../../services/apis/taskApi";
import CreateTaskPopup from "./CreateTaskPopup";
import ViewSubmissionPopup from "./ViewSubmissionPopup";

const TaskList = ({ milestoneId, milestone }) => {
  const [tasks, setTasks] = useState([]);
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [showSubmissionPopup, setShowSubmissionPopup] = useState(false); // Thêm state cho popup submission
  const [selectedTask, setSelectedTask] = useState(null); // Thêm state để lưu task được chọn
  const [loading, setLoading] = useState(true);
  const [expandedTask, setExpandedTask] = useState(null);
  const role = localStorage.getItem("role");

  useEffect(() => {
    fetchTasks();
  }, [milestoneId]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await taskService.getTasksByMilestone(
        {milestoneId: milestoneId,
        pageIndex: 1,
        pageSize: 100,
        sortDir: "Desc",
    });

      let tasksData = [];
      if (response?.rawResponse?.data) {
        tasksData = response.rawResponse.data;
      } else if (response.rawResponse && response.rawResponse.data) {
        tasksData = response.rawResponse.data;
      } else if (Array.isArray(response)) {
        tasksData = response;
      }

      setTasks(tasksData || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshTasks = async () => {
    await fetchTasks();
  };

  const handleAddTask = async () => {
    await refreshTasks();
  };

  const handleViewSubmission = (task) => {
    setSelectedTask(task);
    setShowSubmissionPopup(true);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No deadline";
    try {
      const date = new Date(dateString);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const timeDiff = date - today;
      const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

      if (daysDiff === 0) return "Today";
      if (daysDiff === 1) return "Tomorrow";
      if (daysDiff === -1) return "Yesterday";
      if (daysDiff < 0) return `${Math.abs(daysDiff)} days ago`;

      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year:
          date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const formatWeight = (weight) => {
    if (weight === null || weight === undefined) return "0%";
    return `${(weight * 100).toFixed(1)}%`;
  };

  const getComplexityText = (complexity) => {
    const levels = {
      1: "Very Easy",
      2: "Easy",
      3: "Medium",
      4: "Hard",
      5: "Very Hard",
    };
    return levels[complexity] || "Not Set";
  };

  const getComplexityColor = (complexity) => {
    const colors = {
      1: "bg-green-100 text-green-800",
      2: "bg-blue-100 text-blue-800",
      3: "bg-yellow-100 text-yellow-800",
      4: "bg-orange-100 text-orange-800",
      5: "bg-red-100 text-red-800",
    };
    return colors[complexity] || "bg-gray-100 text-gray-800";
  };

  const getStatusConfig = (status) => {
    const configs = {
      Completed: {
        color: "bg-green-50 text-green-700 border-green-200",
        icon: (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        ),
      },
      "In Progress": {
        color: "bg-blue-50 text-blue-700 border-blue-200",
        icon: (
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        ),
      },
      Pending: {
        color: "bg-yellow-50 text-yellow-700 border-yellow-200",
        icon: (
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
      },
      "Not Started": {
        color: "bg-gray-50 text-gray-700 border-gray-200",
        icon: (
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
        ),
      },
    };
    return configs[status] || configs["Not Started"];
  };

  const getPriorityConfig = (priority) => {
    const configs = {
      High: {
        color: "bg-red-50 text-red-700 border-red-200",
        dotColor: "bg-red-500",
      },
      Medium: {
        color: "bg-yellow-50 text-yellow-700 border-yellow-200",
        dotColor: "bg-yellow-500",
      },
      Low: {
        color: "bg-green-50 text-green-700 border-green-200",
        dotColor: "bg-green-500",
      },
    };
    return (
      configs[priority] || {
        color: "bg-gray-50 text-gray-700 border-gray-200",
        dotColor: "bg-gray-400",
      }
    );
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      setTasks(tasks.filter((task) => task.id !== taskId));
    }
  };

  const toggleTaskExpand = (taskId) => {
    setExpandedTask(expandedTask === taskId ? null : taskId);
  };

  const getStatusStats = () => {
    const stats = {
      total: tasks.length,
      completed: tasks.filter((t) => t.status === "Completed").length,
      inProgress: tasks.filter((t) => t.status === "In Progress").length,
      pending: tasks.filter(
        (t) => t.status === "Pending" || t.status === "Not Started",
      ).length,
      totalWeight: tasks.reduce((sum, task) => sum + (task.weight || 0), 0),
    };

    stats.progressPercentage =
      stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

    return stats;
  };

  const stats = getStatusStats();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-600">Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Tasks
              <span className="ml-2 text-sm font-normal text-gray-500">
                for "{milestone?.title || `Milestone ${milestoneId}`}"
              </span>
            </h2>
            <p className="text-gray-600 mt-1">
              Manage and track all tasks within this milestone
            </p>
          </div>
          {role === "Mentor" && (
            <button
              onClick={() => setShowCreatePopup(true)}
              className="inline-flex items-center justify-center px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm transition-all duration-200"
            >
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
              Add New Task
            </button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-xl border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.total}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-white p-4 rounded-xl border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-700 mt-1">
                  {stats.completed}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.progressPercentage}% of total
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-white p-4 rounded-xl border border-yellow-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-yellow-700 mt-1">
                  {stats.inProgress}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-yellow-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Weight</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatWeight(stats.totalWeight)}
                </p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{stats.progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${stats.progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Task List */}
      {tasks.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No tasks yet
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Start by creating your first task to track progress and assign work
            for this milestone.
          </p>
          {role === "Mentor" && (
            <button
              onClick={() => setShowCreatePopup(true)}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm transition-all duration-200"
            >
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
              Create Your First Task
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => {
            const statusConfig = getStatusConfig(task.status);
            const priorityConfig = getPriorityConfig(task.priority);
            const isExpanded = expandedTask === task.id;

            return (
              <div
                key={task.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 overflow-hidden"
              >
                {/* Clickable Header Area */}
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                  onClick={() => toggleTaskExpand(task.id)}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center ${statusConfig.color}`}
                          >
                            {statusConfig.icon}
                          </div>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {task.label}
                              </h3>
                              <span className="text-sm font-medium text-gray-500">
                                #{task.id}
                              </span>
                            </div>
                            <svg
                              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>

                          <p className="text-gray-600 mb-4 line-clamp-2">
                            {task.description || "No description provided"}
                          </p>

                          <div className="flex flex-wrap gap-3">
                            <span
                              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border ${statusConfig.color}`}
                            >
                              {statusConfig.icon}
                              {task.status || "Not Started"}
                            </span>

                            <span
                              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border ${priorityConfig.color}`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full ${priorityConfig.dotColor}`}
                              ></span>
                              {task.priority || "Not Set"}
                            </span>

                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-50 text-gray-700 border border-gray-200">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                />
                              </svg>
                              {formatWeight(task.weight)}
                            </span>

                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-50 text-gray-700 border border-gray-200">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              {formatDate(task.dueDate)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewSubmission(task);
                        }}
                        title="View Submissions"
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
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </button>
                      <button
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle edit action here
                        }}
                        title="Edit Task"
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
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTask(task.id);
                        }}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        title="Delete Task"
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expandable Detail Section */}
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50">
                    <div className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Column 1: Basic Info */}
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              Description
                            </h4>
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <p className="text-gray-700 whitespace-pre-wrap">
                                {task.description || "No description provided"}
                              </p>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                />
                              </svg>
                              Task Details
                            </h4>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200">
                                <span className="text-sm text-gray-600">
                                  Task ID:
                                </span>
                                <span className="text-sm font-medium text-gray-900">
                                  #{task.id}
                                </span>
                              </div>
                              <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200">
                                <span className="text-sm text-gray-600">
                                  Milestone ID:
                                </span>
                                <span className="text-sm font-medium text-gray-900">
                                  #{task.milestoneId}
                                </span>
                              </div>
                              <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200">
                                <span className="text-sm text-gray-600">
                                  Parent Task:
                                </span>
                                <span className="text-sm font-medium text-gray-900">
                                  {task.parentTaskId
                                    ? `#${task.parentTaskId}`
                                    : "None"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Column 2: Time & Priority */}
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              Time Information
                            </h4>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200">
                                <span className="text-sm text-gray-600">
                                  Start Date:
                                </span>
                                <span className="text-sm font-medium text-gray-900">
                                  {task.startDate
                                    ? formatDate(task.startDate)
                                    : "Not set"}
                                </span>
                              </div>
                              <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200">
                                <span className="text-sm text-gray-600">
                                  Due Date:
                                </span>
                                <span className="text-sm font-medium text-gray-900">
                                  {task.dueDate
                                    ? formatDate(task.dueDate)
                                    : "Not set"}
                                </span>
                              </div>
                              <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200">
                                <span className="text-sm text-gray-600">
                                  Completed At:
                                </span>
                                <span className="text-sm font-medium text-gray-900">
                                  {task.completedAt
                                    ? formatDateTime(task.completedAt)
                                    : "Not completed"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z"
                                />
                              </svg>
                              Priority & Complexity
                            </h4>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200">
                                <span className="text-sm text-gray-600">
                                  Priority:
                                </span>
                                <span
                                  className={`text-sm font-medium px-3 py-1 rounded-full ${priorityConfig.color}`}
                                >
                                  {task.priority || "Not Set"}
                                </span>
                              </div>
                              <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200">
                                <span className="text-sm text-gray-600">
                                  Complexity:
                                </span>
                                <span
                                  className={`text-sm font-medium px-3 py-1 rounded-full ${getComplexityColor(
                                    task.complexity,
                                  )}`}
                                >
                                  {getComplexityText(task.complexity)} (
                                  {task.complexity}/5)
                                </span>
                              </div>
                              <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200">
                                <span className="text-sm text-gray-600">
                                  Estimated Hours:
                                </span>
                                <span className="text-sm font-medium text-gray-900">
                                  {task.estimatedHours || 0} hours
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Column 3: Additional Info */}
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                              </svg>
                              Assignment
                            </h4>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200">
                                <span className="text-sm text-gray-600">
                                  Assignee ID:
                                </span>
                                <span className="text-sm font-medium text-gray-900">
                                  {task.assigneeId
                                    ? `User #${task.assigneeId}`
                                    : "Unassigned"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              Status & Weight
                            </h4>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200">
                                <span className="text-sm text-gray-600">
                                  Status:
                                </span>
                                <span
                                  className={`text-sm font-medium px-3 py-1 rounded-full ${statusConfig.color}`}
                                >
                                  {task.status || "Not Started"}
                                </span>
                              </div>
                              <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200">
                                <span className="text-sm text-gray-600">
                                  Weight:
                                </span>
                                <span className="text-sm font-medium text-gray-900">
                                  {formatWeight(task.weight)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              Creation Info
                            </h4>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200">
                                <span className="text-sm text-gray-600">
                                  Created:
                                </span>
                                <span className="text-sm font-medium text-gray-900">
                                  {formatDateTime(task.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Task Popup */}
      <CreateTaskPopup
        isOpen={showCreatePopup}
        onClose={() => setShowCreatePopup(false)}
        milestoneId={milestoneId}
        onTaskAdded={handleAddTask}
      />

      {/* View Submission Popup */}
      <ViewSubmissionPopup
        isOpen={showSubmissionPopup}
        onClose={() => setShowSubmissionPopup(false)}
        taskId={selectedTask?.id}
        taskLabel={selectedTask?.label}
      />
    </div>
  );
};

export default TaskList;
