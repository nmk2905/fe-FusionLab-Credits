// src/ProjectDetail/components/MilestonesTab/MilestonesTab.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  ListTodo,
  GanttChart,
  Kanban,
  Target,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  PlayCircle,
  PauseCircle,
  TrendingUp,
} from "lucide-react";
import milestoneService from "../../../../services/apis/milestoneApi";
import MilestonePopup from "./MilestonePopup";

const MilestonesTab = ({ projectId }) => {
  const navigate = useNavigate();
  const [milestones, setMilestones] = useState([]);
  const [milestonesLoading, setMilestonesLoading] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  const [error, setError] = useState(null);
  const [isCreatePopupOpen, setIsCreatePopupOpen] = useState(false);
  const role = localStorage.getItem("role");

  useEffect(() => {
    fetchMilestones();
  }, [projectId]);

  const fetchMilestones = async () => {
    if (!projectId) return;

    try {
      setMilestonesLoading(true);
      setError(null);

      const pageIndex = 1;
      const pageSize = 100;

      const response = await milestoneService.getMilestonesByProject(
        pageIndex,
        pageSize,
        projectId
      );

      console.log("Milestones API Response:", response);

      let milestonesData = [];

      if (Array.isArray(response)) {
        milestonesData = response;
      } else if (
        response?.rawResponse?.data &&
        Array.isArray(response.rawResponse.data)
      ) {
        milestonesData = response.rawResponse.data;
      } else if (response?.data && Array.isArray(response.data)) {
        milestonesData = response.data;
      } else if (response?.items && Array.isArray(response.items)) {
        milestonesData = response.items;
      }

      setMilestones(milestonesData);
    } catch (error) {
      console.error("Error fetching milestones:", error);
      setError("Failed to load milestones. Please try again.");
      setMilestones([]);
    } finally {
      setMilestonesLoading(false);
    }
  };

  const handleCreateMilestone = () => {
    console.log("Create milestone clicked");
    setIsCreatePopupOpen(true); // Mở popup
  };
  const handlePopupClose = () => {
    setIsCreatePopupOpen(false);
  };

  const handleMilestoneCreated = (newMilestone) => {
    // Refresh danh sách milestones sau khi tạo thành công
    fetchMilestones();
  };

  const handleViewMilestone = (milestoneId) => {
    const role = localStorage.getItem("role").toLowerCase();
    navigate(`/${role}/projects/${projectId}/milestones/${milestoneId}`);
  };

  // Format ngày tháng ngắn gọn
  const formatShortDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "-";
    }
  };

  // Format trạng thái milestone
  const getStatusInfo = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "done":
        return {
          icon: <CheckCircle size={16} />,
          color: "bg-green-100 text-green-800",
          label: "Completed",
        };
      case "on-going":
      case "in-progress":
      case "inprogress":
        return {
          icon: <PlayCircle size={16} />,
          color: "bg-blue-100 text-blue-800",
          label: "In Progress",
        };
      case "pending":
        return {
          icon: <Clock size={16} />,
          color: "bg-yellow-100 text-yellow-800",
          label: "Pending",
        };
      case "delayed":
        return {
          icon: <AlertCircle size={16} />,
          color: "bg-red-100 text-red-800",
          label: "Delayed",
        };
      default:
        return {
          icon: <PauseCircle size={16} />,
          color: "bg-gray-100 text-gray-800",
          label: status || "Unknown",
        };
    }
  };

  // Tính số ngày còn lại
  const calculateDaysRemaining = (dueDate) => {
    if (!dueDate) return null;

    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  // Hiển thị trọng số
  const renderWeight = (weight) => {
    if (weight === 0) return "Normal";
    if (weight === 1) return "High";
    if (weight === 2) return "Critical";
    return `Weight: ${weight}`;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Milestones</h3>
          <p className="text-gray-500 text-sm">
            Manage project milestones ({milestones.length})
          </p>
        </div>
        {role === "Mentor" && (
          <button
            onClick={handleCreateMilestone}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            New Milestone
          </button>
        )}
      </div>

      {/* View Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setViewMode("list")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center ${
            viewMode === "list"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <ListTodo size={16} className="mr-2" />
          List
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Milestones List */}
      {milestonesLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-500">Loading milestones...</p>
        </div>
      ) : milestones.length > 0 ? (
        <div className="space-y-4">
          {milestones.map((milestone) => {
            const statusInfo = getStatusInfo(milestone.status);
            const daysRemaining = calculateDaysRemaining(milestone.dueDate);
            const isDelayed = milestone.isDelayed;
            const isOverdue = daysRemaining < 0;

            // Chuyển đổi weight từ 0-1 sang phần trăm (0-100)
            const weightPercentage = (milestone.weight * 100).toFixed(1);

            return (
              <div
                key={milestone.id}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => handleViewMilestone(milestone.id)}
              >
                {/* Header với ID, Title và Weight */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    {/* ID Badge */}
                    <div className="bg-gray-100 text-gray-800 font-mono font-semibold text-sm px-3 py-1.5 rounded-lg border border-gray-200 min-w-[70px] text-center">
                      #{milestone.id}
                    </div>

                    {/* Title */}
                    <h4 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                      {milestone.title}
                    </h4>
                  </div>

                  {/* Weight với progress bar */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {weightPercentage}%
                      </div>
                      <div className="text-xs text-gray-500">Weight</div>
                    </div>

                    {/* Progress bar visual */}
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${weightPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                  {/* Left side - Description và timeline */}
                  <div className="flex-1">
                    {/* Description */}
                    {milestone.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        <span className="font-medium text-gray-700">
                          Description:{" "}
                        </span>
                        {milestone.description}
                      </p>
                    )}

                    {/* Timeline info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Calendar size={16} className="text-gray-500" />
                            <span className="font-medium">Start Date:</span>
                            <span className="text-gray-600">
                              {formatShortDate(milestone.startDate)}
                            </span>
                          </div>
                          {milestone.originalDueDate && isDelayed && (
                            <div className="flex items-center gap-2 text-sm text-amber-700">
                              <AlertCircle
                                size={16}
                                className="text-amber-600"
                              />
                              <span className="font-medium">Original Due:</span>
                              <span className="text-amber-600 line-through">
                                {formatShortDate(milestone.originalDueDate)}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Target size={16} className="text-gray-500" />
                            <span className="font-medium">Due Date:</span>
                            <span
                              className={`font-semibold ${
                                isOverdue ? "text-red-600" : "text-gray-600"
                              }`}
                            >
                              {formatShortDate(milestone.dueDate)}
                            </span>
                          </div>

                          {/* Days remaining/overdue */}
                          {daysRemaining !== null && (
                            <div className="flex items-center gap-2 text-sm">
                              <Clock
                                size={16}
                                className={
                                  isOverdue
                                    ? "text-red-500"
                                    : daysRemaining <= 3
                                    ? "text-orange-500"
                                    : "text-green-500"
                                }
                              />
                              <span
                                className={`font-medium ${
                                  isOverdue
                                    ? "text-red-600"
                                    : daysRemaining <= 3
                                    ? "text-orange-600"
                                    : "text-green-600"
                                }`}
                              >
                                {isOverdue
                                  ? `Overdue by ${Math.abs(daysRemaining)} days`
                                  : `${daysRemaining} days left`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right side - Status và các indicators */}
                  <div className="lg:w-1/3 flex flex-col gap-4">
                    {/* Status badge - lớn hơn */}
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Status
                      </span>
                      <div
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-base font-semibold ${
                          statusInfo.color
                        } ${statusInfo.bgColor || "bg-opacity-10"}`}
                      >
                        {statusInfo.icon}
                        <span>{statusInfo.label}</span>
                      </div>
                    </div>

                    {/* Delayed indicator - nổi bật hơn */}
                    {isDelayed && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-amber-700 font-medium">
                          <AlertCircle size={18} className="text-amber-600" />
                          <span>Delayed Milestone</span>
                        </div>
                        {milestone.originalDueDate && (
                          <p className="text-xs text-amber-600 mt-1">
                            Rescheduled from original due date
                          </p>
                        )}
                      </div>
                    )}

                    {/* Created date và view button */}
                    <div className="mt-auto pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          Created: {formatShortDate(milestone.createdAt)}
                        </div>
                        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                          View Details
                          <TrendingUp size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Target size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg mb-2">No milestones yet</p>
          <p className="text-gray-400 mb-6">
            Create your first milestone to start tracking project progress
          </p>
          <button
            onClick={handleCreateMilestone}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <Plus size={18} />
            Create First Milestone
          </button>
        </div>
      )}

      {/* Quick Stats (optional) */}
      {milestones.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Milestone Summary
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Pending Status */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                <h4 className="font-medium text-gray-800">Pending</h4>
              </div>
              <p className="text-2xl font-bold text-gray-800 mt-2">
                {
                  milestones.filter(
                    (m) =>
                      m.status &&
                      (m.status.toLowerCase() === "pending" ||
                        m.status.toLowerCase() === "not_started" ||
                        m.status.toLowerCase() === "to_do" ||
                        m.status.toLowerCase() === "todo" ||
                        m.status.toLowerCase() === "upcoming")
                  ).length
                }
              </p>
              <p className="text-xs text-gray-500 mt-1">Awaiting start</p>
            </div>

            {/* In Progress Status */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2">
                <PlayCircle size={18} className="text-blue-600" />
                <h4 className="font-medium text-gray-800">In Progress</h4>
              </div>
              <p className="text-2xl font-bold text-gray-800 mt-2">
                {
                  milestones.filter(
                    (m) =>
                      m.status &&
                      (m.status.toLowerCase() === "on-going" ||
                        m.status.toLowerCase() === "in-progress" ||
                        m.status.toLowerCase() === "in_progress" ||
                        m.status.toLowerCase() === "ongoing" ||
                        m.status.toLowerCase() === "active")
                  ).length
                }
              </p>
              <p className="text-xs text-gray-500 mt-1">Currently active</p>
            </div>

            {/* Completed Status */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-green-600" />
                <h4 className="font-medium text-gray-800">Completed</h4>
              </div>
              <p className="text-2xl font-bold text-gray-800 mt-2">
                {
                  milestones.filter(
                    (m) =>
                      m.status &&
                      (m.status.toLowerCase() === "completed" ||
                        m.status.toLowerCase() === "done" ||
                        m.status.toLowerCase() === "finished" ||
                        m.status.toLowerCase() === "closed")
                  ).length
                }
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Successfully finished
              </p>
            </div>

            {/* Delayed Status */}
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
              <div className="flex items-center gap-2">
                <AlertCircle size={18} className="text-amber-600" />
                <h4 className="font-medium text-gray-800">Delayed</h4>
              </div>
              <p className="text-2xl font-bold text-gray-800 mt-2">
                {milestones.filter((m) => m.isDelayed).length}
              </p>
              <p className="text-xs text-gray-500 mt-1">Past due date</p>
            </div>
          </div>

          {/* Total Summary (Optional) */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target size={18} className="text-gray-600" />
                <span className="font-medium text-gray-700">
                  Total Milestones
                </span>
              </div>
              <span className="text-xl font-bold text-gray-800">
                {milestones.length}
              </span>
            </div>
          </div>
        </div>
      )}
      <MilestonePopup
        projectId={projectId}
        isOpen={isCreatePopupOpen}
        onClose={handlePopupClose}
        onSuccess={handleMilestoneCreated}
      />
    </div>
  );
};

export default MilestonesTab;
