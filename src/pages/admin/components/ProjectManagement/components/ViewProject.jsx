// src/pages/admin/components/ProjectManagement/components/ViewProject.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Users,
  Calendar,
  Target,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  Clock,
} from "lucide-react";
import projectService from "../../../../../services/apis/projectApi";
import semesterService from "../../../../../services/apis/semesterApi";
import { useNotification } from "../../../../../hook/useNotification";
import { useNavigate } from "react-router-dom";

export default function ViewProject() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [semesterNames, setSemesterNames] = useState({});
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { showNotification } = useNotification();

  // Thêm state cho modal
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const pageSize = 10;

  useEffect(() => {
    fetchProjects();
  }, [currentPage]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectService.getAllProjects(1000, 1, "desc");
      console.log("Projects response:", response.rawResponse.data);

      if (response?.rawResponse?.data) {
        const projectsData = response.rawResponse.data;
        setProjects(projectsData);
        setTotalPages(response.rawResponse.data.totalPages || 1);

        const semesterIds = [
          ...new Set(
            projectsData.map((project) => project.semesterId).filter((id) => id)
          ),
        ];

        await fetchSemesterNames(semesterIds);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSemesterNames = async (semesterIds) => {
    if (!semesterIds || semesterIds.length === 0) return;

    const namesMap = {};

    try {
      for (const semesterId of semesterIds) {
        try {
          const semesterResponse = await semesterService.getSemesterById(
            semesterId
          );
          setSemesters(semesterResponse.rawResponse.data);
          if (semesterResponse?.rawResponse?.data?.name) {
            namesMap[semesterId] = semesterResponse.rawResponse.data.name;
          } else {
            namesMap[semesterId] = `Semester ${semesterId}`;
          }
        } catch (error) {
          console.error(`Error fetching semester ${semesterId}:`, error);
          namesMap[semesterId] = `Semester ${semesterId}`;
        }
      }

      setSemesterNames(namesMap);
    } catch (error) {
      console.error("Error fetching semester names:", error);
    }
  };

  const getSemesterName = (semesterId) => {
    if (!semesterId) return "N/A";
    return semesterNames[semesterId] || `Semester ${semesterId}`;
  };

  const formatDateOnly = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting date:", error, dateString);
      return "N/A";
    }
  };

  // Xem project detail
  const handleViewProject = (projectId) => {
    navigate(`/admin/projectDetail/${projectId}`);
  };

  // Hàm đóng modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProjectId(null);
  };

  const filteredProjects = projects.filter(
    (project) =>
      project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (projectId) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await projectService.deleteProject(projectId);
        showNotification("Project deleted successfully!", "success");
        fetchProjects();
      } catch (error) {
        console.error("Error deleting project:", error);
        alert("Failed to delete project.");
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-6"
      >
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">View Projects</h2>
          <p className="text-gray-600">
            Browse and manage all projects in the system
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search projects by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Filter size={20} />
            Filter
          </button>
        </div>

        {/* Projects Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-500">Loading projects...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No projects found.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Project
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Semester
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Team Size
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Points
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProjects.map((project) => (
                      <tr key={project.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              #{project.id || "Untitled"}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {project.title || "Untitled"}
                            </p>
                            <p className="text-sm text-gray-500 truncate max-w-xs">
                              {project.description || "No description"}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-gray-400" />
                            <span className="text-gray-700">
                              {getSemesterName(project.semesterId)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Clock size={14} className="text-gray-400" />
                              <span className="text-sm text-gray-600">
                                Start: {formatDateOnly(semesters.startDate)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock size={14} className="text-gray-400" />
                              <span className="text-sm text-gray-600">
                                End: {formatDateOnly(semesters.endDate)}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Users size={16} className="text-gray-400" />
                            <span className="text-gray-700">
                              {project.minMembers || 0} -{" "}
                              {project.maxMembers || 0}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Target size={16} className="text-gray-400" />
                            <span className="font-medium text-blue-600">
                              {project.totalPoints || 0}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {formatDate(project.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewProject(project.id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                              title="Edit"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(project.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing{" "}
                  <span className="font-medium">{filteredProjects.length}</span>{" "}
                  projects
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg font-medium">
                    {currentPage}
                  </span>
                  <button
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    disabled={currentPage >= totalPages}
                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Stats Cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Total Projects</p>
                <p className="text-2xl font-bold text-blue-800">
                  {projects.length}
                </p>
              </div>
              <FolderKanban className="text-blue-400" size={24} />
            </div>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Open Projects</p>
                <p className="text-2xl font-bold text-green-800">
                  {projects.filter((p) => p.status === "Open").length}
                </p>
              </div>
              <UserCheck className="text-green-400" size={24} />
            </div>
          </div>
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">Total Points</p>
                <p className="text-2xl font-bold text-purple-800">
                  {projects.reduce((sum, p) => sum + (p.totalPoints || 0), 0)}
                </p>
              </div>
              <Target className="text-purple-400" size={24} />
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
