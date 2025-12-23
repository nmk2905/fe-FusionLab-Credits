import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  Users,
  Target,
  Clock,
  User,
  Mail,
  Phone,
  Building,
  ChevronRight,
  GraduationCap,
} from "lucide-react";
import projectService from "../../../services/apis/projectApi";
import userService from "../../../services/apis/userApi";
import semesterService from "../../../services/apis/semesterApi";

const ProjectDetailModal = ({ projectId, isOpen, onClose }) => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [mentor, setMentor] = useState(null);
  const [mentorLoading, setMentorLoading] = useState(false);
  const [semester, setSemester] = useState(null);
  const [semesterLoading, setSemesterLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (isOpen && projectId) {
      fetchProjectDetails();
    }
    if (isOpen) {
      setActiveTab("overview");
    }
  }, [isOpen, projectId]);

  useEffect(() => {
    if (project?.mentorId) {
      fetchMentorDetails();
    }
    if (project?.semesterId) {
      fetchSemesterDetails();
    }
  }, [project]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      setMentor(null);
      setSemester(null);

      const response = await projectService.getProjectById(projectId);

      if (response?.rawResponse?.data) {
        const projectData = response.rawResponse.data;
        setProject(projectData);

        if (projectData.members) {
          setTeamMembers(projectData.members);
        }
      }
    } catch (error) {
      console.error("Error fetching project details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMentorDetails = async () => {
    try {
      setMentorLoading(true);
      const response = await userService.getCurrentUser(project.mentorId);

      if (response?.rawResponse?.data) {
        setMentor(response.rawResponse.data);
      }
    } catch (error) {
      console.error("Error fetching mentor details:", error);
      setMentor(null);
    } finally {
      setMentorLoading(false);
    }
  };

  const fetchSemesterDetails = async () => {
    try {
      setSemesterLoading(true);
      const response = await semesterService.getSemesterById(
        project.semesterId
      );

      if (response?.rawResponse?.data) {
        setSemester(response.rawResponse.data);
      } else if (response?.data) {
        setSemester(response.data);
      }
    } catch (error) {
      console.error("Error fetching semester details:", error);
      setSemester(null);
    } finally {
      setSemesterLoading(false);
    }
  };

  // Hàm format chỉ lấy ngày tháng năm (không có giờ phút)
  const formatDateOnly = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-EN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Hàm format cho Created At (có thể có thêm thời gian nếu cần)
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-EN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      // hour: "2-digit",
      // minute: "2-digit",
    });
  };

  // Lấy start date từ project.createdAt
  const getStartDate = () => {
    return project?.createdAt ? formatDateOnly(project.createdAt) : "N/A";
  };

  // Lấy end date từ semester.endDate nếu có, nếu không thì từ project.endDate
  const getEndDate = () => {
    if (semester?.endDate) {
      return formatDateOnly(semester.endDate);
    }
    return project?.endDate ? formatDateOnly(project.endDate) : "N/A";
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {loading
                      ? "Loading..."
                      : project?.title || "Project Details"}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Project ID: #{projectId}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200">
                <div className="px-6 flex gap-4">
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`py-3 px-1 font-medium border-b-2 transition-colors ${
                      activeTab === "overview"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab("mentor")}
                    className={`py-3 px-1 font-medium border-b-2 transition-colors ${
                      activeTab === "mentor"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Mentor
                  </button>
                  <button
                    onClick={() => setActiveTab("team")}
                    className={`py-3 px-1 font-medium border-b-2 transition-colors ${
                      activeTab === "team"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Team Members
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-500">
                      Loading project details...
                    </p>
                  </div>
                ) : (
                  <div className="p-6">
                    {activeTab === "overview" && project && (
                      <div className="space-y-6">
                        {/* Basic Info */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-3">
                            Project Information
                          </h3>
                          <p className="text-gray-600 mb-4">
                            {project.description}
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <Calendar className="text-gray-400" size={20} />
                                <div>
                                  <p className="text-sm text-gray-500">
                                    Semester
                                  </p>
                                  <p className="font-medium">
                                    {semester?.name ||
                                      semester?.code ||
                                      `Semester ${project.semesterId}` ||
                                      "N/A"}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <Users className="text-gray-400" size={20} />
                                <div>
                                  <p className="text-sm text-gray-500">
                                    Team Size
                                  </p>
                                  <p className="font-medium">
                                    {project.minMembers || 0} -{" "}
                                    {project.maxMembers || 0} members
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <Target className="text-gray-400" size={20} />
                                <div>
                                  <p className="text-sm text-gray-500">
                                    Total Points
                                  </p>
                                  <p className="font-medium text-blue-600">
                                    {project.totalPoints || 0} points
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <Clock className="text-gray-400" size={20} />
                                <div>
                                  <p className="text-sm text-gray-500">
                                    Status
                                  </p>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                            </div>
                          </div>
                        </div>

                        {/* Dates */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-3">
                            Timeline
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <p className="text-sm text-gray-500 mb-1">
                                Semester name
                              </p>
                              <p className="font-medium">
                                {semester?.name || "N/A"}
                              </p>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <p className="text-sm text-gray-500 mb-1">
                                Start Date
                              </p>
                              <p className="font-medium">{getStartDate()}</p>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <p className="text-sm text-gray-500 mb-1">
                                End Date
                              </p>
                              <p className="font-medium">{getEndDate()}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "mentor" && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                          Project Mentor
                        </h3>
                        {mentorLoading ? (
                          <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="mt-2 text-gray-500">
                              Loading mentor information...
                            </p>
                          </div>
                        ) : mentor ? (
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <GraduationCap
                                  size={32}
                                  className="text-blue-600"
                                />
                              </div>
                              <div className="flex-1">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                  <div>
                                    <h4 className="text-xl font-bold text-gray-800">
                                      {mentor.fullName || "Unknown"}
                                    </h4>
                                    <p className="text-gray-600">
                                      Mentor ID: #{mentor.id}
                                    </p>
                                  </div>
                                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                    Project Mentor
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                      <Mail
                                        className="text-gray-400"
                                        size={18}
                                      />
                                      <div>
                                        <p className="text-sm text-gray-500">
                                          Email
                                        </p>
                                        <p className="font-medium text-gray-800">
                                          {mentor.email || "N/A"}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                      <Phone
                                        className="text-gray-400"
                                        size={18}
                                      />
                                      <div>
                                        <p className="text-sm text-gray-500">
                                          Phone Number
                                        </p>
                                        <p className="font-medium text-gray-800">
                                          {mentor.phoneNumber || "N/A"}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                      <User
                                        className="text-gray-400"
                                        size={18}
                                      />
                                      <div>
                                        <p className="text-sm text-gray-500">
                                          User ID
                                        </p>
                                        <p className="font-medium text-gray-800">
                                          {mentor.id}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                      <Building
                                        className="text-gray-400"
                                        size={18}
                                      />
                                      <div>
                                        <p className="text-sm text-gray-500">
                                          Department
                                        </p>
                                        <p className="font-medium text-gray-800">
                                          {mentor.department || "N/A"}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <GraduationCap
                              size={48}
                              className="mx-auto text-gray-300 mb-3"
                            />
                            <p className="text-gray-500">
                              No mentor assigned to this project
                            </p>
                            {project?.mentorId && (
                              <p className="text-sm text-gray-400 mt-2">
                                Mentor ID: {project.mentorId} (Not found)
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === "team" && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                          Team Members
                        </h3>
                        {teamMembers.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {teamMembers.map((member, index) => (
                              <div
                                key={index}
                                className="bg-gray-50 rounded-lg p-4"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <User size={20} className="text-blue-600" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-800">
                                      {member.name || "Unknown"}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {member.role || "Member"}
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-3 space-y-2">
                                  {member.email && (
                                    <div className="flex items-center gap-2 text-sm">
                                      <Mail
                                        size={14}
                                        className="text-gray-400"
                                      />
                                      <span className="text-gray-600">
                                        {member.email}
                                      </span>
                                    </div>
                                  )}
                                  {member.phone && (
                                    <div className="flex items-center gap-2 text-sm">
                                      <Phone
                                        size={14}
                                        className="text-gray-400"
                                      />
                                      <span className="text-gray-600">
                                        {member.phone}
                                      </span>
                                    </div>
                                  )}
                                  {member.department && (
                                    <div className="flex items-center gap-2 text-sm">
                                      <Building
                                        size={14}
                                        className="text-gray-400"
                                      />
                                      <span className="text-gray-600">
                                        {member.department}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Users
                              size={48}
                              className="mx-auto text-gray-300 mb-3"
                            />
                            <p className="text-gray-500">
                              No team members assigned yet
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Edit Project
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProjectDetailModal;
