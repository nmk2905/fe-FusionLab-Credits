// src/ProjectDetail/ProjectDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronRight, ArrowLeft } from "lucide-react";
import projectService from "../../services/apis/projectApi";

// Import các tab components
import OverviewTab from "./components/OverviewTab";
import MilestonesTab from "./components/MilestonesTab/MilestonesTab";
import MentorTab from "./components/MentorTab";
import TeamTab from "./components/TeamTab";

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

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
            <div className="flex gap-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  project.status === "Open"
                    ? "bg-green-100 text-green-800"
                    : project.status === "Closed"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {project.status || "Unknown"}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-3 font-medium border-b-2 transition-colors ${
                  activeTab === "overview"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("milestones")}
                className={`py-3 font-medium border-b-2 transition-colors ${
                  activeTab === "milestones"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Milestones
              </button>
              <button
                onClick={() => setActiveTab("mentor")}
                className={`py-3 font-medium border-b-2 transition-colors ${
                  activeTab === "mentor"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Mentor
              </button>
              <button
                onClick={() => setActiveTab("team")}
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
