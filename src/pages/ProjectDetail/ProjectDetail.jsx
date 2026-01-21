// src/ProjectDetail/ProjectDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ChevronRight, ArrowLeft, Play, X, CheckCircle } from "lucide-react";
import projectService from "../../services/apis/projectApi";
import { useNotification } from "../../hook/useNotification";

// Import các tab components
import OverviewTab from "./components/OverviewTab";
import MilestonesTab from "./components/MilestonesTab/MilestonesTab";
import MentorTab from "./components/MentorTab";
import TeamTab from "./components/TeamTab";

const ProjectDetail = () => {
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";
  const { projectId } = useParams();
  const { showNotification } = useNotification();

  // Lấy role từ localStorage
  const [userRole, setUserRole] = useState(null);

  // Chỉ fetch thông tin cơ bản của project
  useEffect(() => {
    const fetchProjectBasicInfo = async () => {
      try {
        setLoading(true);
        const response = await projectService.getProjectById(projectId);

        if (response?.rawResponse?.data) {
          setProject(response.rawResponse.data);
        } else if (response?.data) {
          setProject(response.data);
        }
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProjectBasicInfo();
    }
  }, [projectId]);

  // Lấy role từ localStorage khi component mount
  useEffect(() => {
    const role = localStorage.getItem("role");
    setUserRole(role);
  }, []);

  // API Start Project
  const handleStartProject = async () => {
    if (!projectId) return;

    try {
      setIsUpdating(true);
      const response = await projectService.startProject(projectId);
      console.log(response);

      if (response.success) {
        // Cập nhật trạng thái project
        setProject((prev) => ({
          ...prev,
          status: "InProcess",
        }));

        showNotification("Project started successfully", "success");
      } else {
        showNotification(response.error, "error");
      }
    } catch (error) {
      console.error("Error starting project:", error);
      showNotification("Failed to start project", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  // API Close Project
  const handleCloseProject = async () => {
    if (!projectId) return;

    try {
      setIsUpdating(true);
      const response = await projectService.closeProject(projectId);

      if (response.success) {
        // Cập nhật trạng thái project
        setProject((prev) => ({
          ...prev,
          status: "Close",
        }));

        showNotification("Project closed successfully", "success");
      } else {
        showNotification(response.error, "error");
      }
    } catch (error) {
      console.error("Error closing project:", error);
      showNotification("Failed to close project", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  // Hàm để xác định class CSS cho từng trạng thái
  const getStatusClasses = (status) => {
    switch (status) {
      case "Open": // Recruiting members
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "InProcess": // Active/started
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "Close": // Closed (e.g., cancelled)
        return "bg-red-100 text-red-800 border border-red-200";
      case "Complete": // Finished
        return "bg-green-100 text-green-800 border border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  // Hàm để hiển thị tên trạng thái thân thiện hơn
  const getDisplayStatus = (status) => {
    switch (status) {
      case "Open":
        return "Recruiting";
      case "InProcess":
        return "In Progress";
      case "Close":
        return "Closed";
      case "Complete":
        return "Completed";
      default:
        return status || "Unknown";
    }
  };

  // Kiểm tra điều kiện hiển thị các button
  const isMentor = userRole === "Mentor";
  const shouldShowStartButton = isMentor && project?.status === "Open";
  const shouldShowCloseButton = isMentor && project?.status === "InProcess";
  const shouldShowMarkComplete = isMentor && project?.status === "InProcess";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-700 mb-2">
            Project Not Found
          </div>
          <p className="text-gray-500 mb-6">
            The project you're looking for doesn't exist or you don't have
            access.
          </p>
          <button
            onClick={() => navigate("/mentor/projects")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab projectId={projectId} project={project} />;
      case "milestones":
        return <MilestonesTab projectId={projectId} />;
      case "mentor":
        return <MentorTab projectId={projectId} />;
      case "team":
        return <TeamTab projectId={projectId} />;
      default:
        return <OverviewTab projectId={projectId} project={project} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="hover:text-blue-600 flex items-center gap-1"
          >
            <ArrowLeft size={16} />
            Projects
          </button>
          <ChevronRight size={16} className="mx-2" />
          <span className="font-medium text-gray-700">{project.title}</span>
        </div>

        {/* Project Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {project.title}
              </h1>
              <p className="text-gray-600 mt-2">{project.description}</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Status Badge */}
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClasses(
                  project.status,
                )}`}
              >
                {getDisplayStatus(project.status)}
              </span>

              {/* Action Buttons */}
              {isMentor && (
                <div className="flex gap-2">
                  {/* Start Project Button - Chỉ hiển thị khi status là Open */}
                  {shouldShowStartButton && (
                    <button
                      onClick={handleStartProject}
                      disabled={isUpdating}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpdating ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Play size={16} />
                      )}
                      Start Project
                    </button>
                  )}

                  {/* Close Project Button - Chỉ hiển thị khi status là InProcess */}
                  {shouldShowCloseButton && (
                    <button
                      onClick={handleCloseProject}
                      disabled={isUpdating}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpdating ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <X size={16} />
                      )}
                      Close Project
                    </button>
                  )}

                  {/* Complete Project Button - Chỉ hiển thị khi status là InProcess */}
                  {shouldShowMarkComplete && (
                    <button
                      onClick={() => {
                        // TODO: Implement API Complete Project nếu có
                        console.log("Complete project clicked");
                        showNotification(
                          "Mark Complete feature coming soon",
                          "info",
                        );
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <CheckCircle size={16} />
                      Mark Complete
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex gap-6">
              <button
                onClick={() =>
                  setSearchParams({ tab: "overview" }, { replace: true })
                }
                className={`py-3 font-medium border-b-2 transition-colors ${
                  activeTab === "overview"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() =>
                  setSearchParams({ tab: "milestones" }, { replace: true })
                }
                className={`py-3 font-medium border-b-2 transition-colors ${
                  activeTab === "milestones"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Milestones
              </button>
              <button
                onClick={() =>
                  setSearchParams({ tab: "mentor" }, { replace: true })
                }
                className={`py-3 font-medium border-b-2 transition-colors ${
                  activeTab === "mentor"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Mentor
              </button>
              <button
                onClick={() =>
                  setSearchParams({ tab: "team" }, { replace: true })
                }
                className={`py-3 font-medium border-b-2 transition-colors ${
                  activeTab === "team"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Team
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
