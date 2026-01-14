import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Thêm useNavigate
import {
  CalendarIcon,
  PlusIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline"; // Thêm ArrowLeftIcon
import TaskList from "./TaskManagement/TaskList";
import milestoneService from "../../../../services/apis/milestoneApi";

const MilestoneDetail = () => {
  const { milestoneId } = useParams();
  const navigate = useNavigate(); // Khởi tạo navigate
  const [milestone, setMilestone] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("detail");

  useEffect(() => {
    const fetchMilestone = async () => {
      try {
        setLoading(true);
        const response = await milestoneService.getMilestoneById(milestoneId);
        setMilestone(response.data);
        setError(null);
      } catch (err) {
        setError("Không thể tải dữ liệu milestone. Vui lòng thử lại sau.");
        console.error("Error fetching milestone:", err);
      } finally {
        setLoading(false);
      }
    };

    if (milestoneId) {
      fetchMilestone();
    }
  }, [milestoneId]);

  // Hàm xử lý quay lại
  const handleBack = () => {
    navigate(-1); // Quay lại trang trước đó
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-EN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getMilestoneStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu milestone...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <svg
            className="h-6 w-6 text-red-600 mr-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-medium text-red-800">Lỗi</h3>
        </div>
        <p className="mt-2 text-red-700">{error}</p>
        <div className="mt-4 flex space-x-3">
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!milestone) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          Không tìm thấy milestone
        </h3>
        <p className="mt-1 text-gray-500">
          Milestone với ID {milestoneId} không tồn tại.
        </p>
        <button
          onClick={handleBack}
          className="mt-6 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center mx-auto"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header với nút Back */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-4"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            <span>Back</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {milestone.title}
            </h1>
            <div className="mt-2 flex items-center space-x-4">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getMilestoneStatusColor(
                  milestone.status
                )}`}
              >
                {milestone.status}
              </span>
              <span className="text-gray-500">
                Project ID: {milestone.projectId}
              </span>
              {milestone.isDelayed && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  Delayed
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("detail")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "detail"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Milestone Details
            </div>
          </button>
          <button
            onClick={() => setActiveTab("task")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "task"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
              Task Management
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        {activeTab === "detail" ? (
          /* Milestone Detail Tab - Redesigned */
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            {/* Header với gradient */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    Milestone Details
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Complete information about this milestone
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-medium ${getMilestoneStatusColor(
                      milestone.status
                    )}`}
                  >
                    {milestone.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Content với layout card */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Basic Info */}
                <div className="space-y-4">
                  {/* Title Card */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Title
                    </h4>
                    <p className="text-lg font-medium text-gray-900">
                      {milestone.title}
                    </p>
                  </div>

                  {/* Description Card */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Description
                    </h4>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {milestone.description || "No description provided"}
                    </p>
                  </div>

                  {/* Weight & Progress Card */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Weight & Progress
                    </h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="px-4 py-2 bg-white border border-blue-200 text-blue-700 rounded-lg font-medium">
                          {milestone.weight * 100}%
                        </span>
                      </div>
                      {/* Thêm progress bar nếu có dữ liệu */}
                      {milestone.progress !== undefined && (
                        <div className="w-2/3">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>{milestone.progress}%</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full transition-all duration-300"
                              style={{ width: `${milestone.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Dates & Metadata */}
                <div className="space-y-4">
                  {/* Timeline Card */}
                  <div className="border border-gray-200 rounded-xl p-4">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                      Time line
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                            <CalendarIcon className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Start Date</p>
                            <p className="font-medium">
                              {formatDate(milestone.startDate)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                            <CalendarIcon className="w-4 h-4 text-indigo-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Due Date</p>
                            <p className="font-medium">
                              {formatDate(milestone.dueDate)}
                            </p>
                          </div>
                        </div>
                        {milestone.isDelayed && (
                          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                            Delayed
                          </span>
                        )}
                      </div>

                      {milestone.originalDueDate && (
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                            <CalendarIcon className="w-4 h-4 text-amber-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Original Due Date
                            </p>
                            <p className="font-medium">
                              {formatDate(milestone.originalDueDate)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Metadata Card */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                      Meta data
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Created At
                        </span>
                        <span className="font-medium">
                          {formatDate(milestone.createdAt)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Milestone ID
                        </span>
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {milestone.id}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Delay Status
                        </span>
                        {milestone.isDelayed ? (
                          <span className="flex items-center">
                            <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                            <span className="text-red-700 font-medium">
                              Delayed
                            </span>
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                            <span className="text-green-700 font-medium">
                              On Track
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Task Management Tab - Redesigned */
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            {/* Task List Section */}
            <div className="p-6">
              <TaskList milestoneId={milestoneId} milestone={milestone} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MilestoneDetail;
