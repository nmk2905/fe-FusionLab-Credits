// src/pages/Mentor/components/ManageProject/ViewProject.jsx
import React, { useContext, useState, useEffect } from "react";
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
import projectApi from "../../../../services/apis/projectApi";
import semesterService from "../../../../services/apis/semesterApi";
import { useNotification } from "../../../../hook/useNotification";
import { AuthContext } from "../../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function ViewProject() {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [semesterNames, setSemesterNames] = useState({});
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [noDataMessage, setNoDataMessage] = useState("");
  const { showNotification } = useNotification();
  const pageSize = 10;
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      fetchProjects();
    }
  }, [currentPage, user?.id]);

  const fetchProjects = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setNoDataMessage(""); // Reset message

      // Gọi API với mentorId từ user.id
      const response = await projectApi.getProjectByMentorId(user.id, 100, 1, "Desc");

      // Cấu trúc response có thể khác, bạn cần kiểm tra cấu trúc thực tế
      let projectsData = [];

      // Kiểm tra nếu response?.rawResponse?.data là mảng không có dữ liệu
      if (response?.rawResponse?.data) {
        if (
          Array.isArray(response.rawResponse.data) &&
          response.rawResponse.data.length === 0
        ) {
          setNoDataMessage("No projects found for this mentor.");
          setProjects([]);
        } else {
          projectsData = response.rawResponse.data;
        }
      } else if (response?.data) {
        if (Array.isArray(response.data) && response.data.length === 0) {
          setNoDataMessage("No projects found for this mentor.");
          setProjects([]);
        } else {
          projectsData = response.data;
        }
      } else if (Array.isArray(response)) {
        if (response.length === 0) {
          setNoDataMessage("No projects found for this mentor.");
          setProjects([]);
        } else {
          projectsData = response;
        }
      } else {
        // Nếu response không có dạng nào trên
        setNoDataMessage("No projects found for this mentor.");
        setProjects([]);
      }

      // Nếu có dữ liệu thì tiếp tục xử lý
      if (projectsData.length > 0) {
        setProjects(projectsData);
        setTotalPages(Math.ceil(projectsData.length / pageSize) || 1);

        // Lấy semesterIds từ projects
        const semesterIds = [
          ...new Set(
            projectsData.map((project) => project.semesterId).filter((id) => id)
          ),
        ];

        await fetchSemesterNames(semesterIds);
      } else if (!noDataMessage) {
        // Nếu projectsData là mảng rỗng và chưa có message
        setNoDataMessage("No projects found for this mentor.");
      }
    } catch (error) {
      console.error("Error fetching projects for mentor:", error);
      showNotification("Failed to load projects", "error");
      setNoDataMessage("Failed to load projects. Please try again.");
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

          // Lưu tất cả semesters để sử dụng cho startDate/endDate
          if (semesterResponse?.rawResponse?.data) {
            setSemesters((prev) => [
              ...prev,
              semesterResponse.rawResponse.data,
            ]);
            namesMap[semesterId] = semesterResponse.rawResponse.data.name;
          } else if (semesterResponse?.data) {
            setSemesters((prev) => [...prev, semesterResponse.data]);
            namesMap[semesterId] = semesterResponse.data.name;
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

  const getSemesterDates = (semesterId) => {
    const semester = semesters.find((s) => s.id === semesterId);
    if (!semester) return { startDate: null, endDate: null };
    return {
      startDate: semester.startDate,
      endDate: semester.endDate,
    };
  };

  // Hàm format date chỉ lấy ngày tháng năm
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

  const filteredProjects = projects.filter(
    (project) =>
      project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleDelete = async (projectId) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await projectApi.deleteProject(projectId);
        showNotification("Project deleted successfully!", "success");
        fetchProjects();
      } catch (error) {
        console.error("Error deleting project:", error);
        showNotification("Failed to delete project", "error");
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

  // Hàm hiển thị trạng thái không có dữ liệu
  const renderNoData = () => {
    return (
      <div className="p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
          <FolderKanban className="text-blue-400" size={32} />
        </div>
        <p className="text-gray-500 text-lg font-medium mb-2">
          {noDataMessage || "No projects found."}
        </p>
        <p className="text-gray-400 text-sm">
          You don't have any projects assigned yet.
        </p>
      </div>
    );
  };

  const handleViewProject = (projectId) => {
    navigate(`/mentor/projectDetail/${projectId}`);
  };

  // Hàm đóng modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProjectId(null);
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
          <h2 className="text-2xl font-bold text-gray-800">My Projects </h2>
          <p className="text-gray-600">
            Manage and view all projects assigned to you as mentor
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
                disabled={projects.length === 0}
              />
            </div>
          </div>
          <button
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={projects.length === 0}
          >
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
          ) : projects.length === 0 || noDataMessage ? (
            renderNoData()
          ) : filteredProjects.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">
                No projects match your search criteria.
              </p>
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
                        Status
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
                    {paginatedProjects.map((project) => {
                      const semesterDates = getSemesterDates(
                        project.semesterId
                      );
                      return (
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
                                  Start:{" "}
                                  {formatDateOnly(semesterDates.startDate)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock size={14} className="text-gray-400" />
                                <span className="text-sm text-gray-600">
                                  End: {formatDateOnly(semesterDates.endDate)}
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
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                project.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : project.status === "completed"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {project.status || "draft"}
                            </span>
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
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing{" "}
                  <span className="font-medium">
                    {Math.min(paginatedProjects.length, pageSize)}
                  </span>{" "}
                  of{" "}
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

        {/* Stats Cards - Chỉ hiển thị khi có dữ liệu */}
        {projects.length > 0 && (
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
        )}
      </motion.div>
    </>
  );
}
