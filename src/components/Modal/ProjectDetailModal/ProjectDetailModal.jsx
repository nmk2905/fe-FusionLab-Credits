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
  UserPlus,
  Shield,
  Search,
  Filter,
  MoreVertical,
} from "lucide-react";
import projectService from "../../../services/apis/projectApi";
import userService from "../../../services/apis/userApi";
import semesterService from "../../../services/apis/semesterApi";
import projectMemberApi from "../../../services/apis/projectMemberApi";

const ProjectDetailModal = ({ projectId, isOpen, onClose }) => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [mentor, setMentor] = useState(null);
  const [mentorLoading, setMentorLoading] = useState(false);
  const [semester, setSemester] = useState(null);
  const [semesterLoading, setSemesterLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [teamMembersLoading, setTeamMembersLoading] = useState(false);
  const [teamMemberDetails, setTeamMemberDetails] = useState([]);

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
    if (project?.id) {
      fetchProjectMembersWithDetails();
    }
  }, [project]);

  // Hàm lấy danh sách thành viên với thông tin chi tiết từ userService
  const fetchProjectMembersWithDetails = async () => {
    try {
      setTeamMembersLoading(true);
      setTeamMemberDetails([]);

      // 1. Lấy danh sách project members từ projectMemberApi
      const membersResponse = await projectMemberApi.getProjectMembers({
        projectId: project.id,
      });

      console.log(membersResponse);

      // Xử lý response để lấy danh sách userIds
      let projectMembers = [];
      let userIds = [];

      if (membersResponse?.rawResponse?.data) {
        projectMembers = membersResponse.rawResponse.data;
        userIds = projectMembers.map((member) => member.userId);
      } else if (membersResponse?.data) {
        projectMembers = membersResponse.data;
        userIds = projectMembers.map((member) => member.userId);
      } else if (Array.isArray(membersResponse)) {
        projectMembers = membersResponse;
        userIds = projectMembers.map((member) => member.userId);
      }

      if (userIds.length === 0) {
        setTeamMemberDetails([]);
        setTeamMembersLoading(false);
        return;
      }

      // 2. Lấy thông tin chi tiết của tất cả user bằng một API call
      // Giả sử userService có phương thức getUsersByIds hoặc tương tự
      const usersResponse = await userService.getUsersByIds(userIds);

      // Hoặc nếu không có API lấy nhiều user, thì dùng Promise.all
      // const userPromises = userIds.map(userId =>
      //   userService.getCurrentUser(userId)
      // );
      // const usersData = await Promise.all(userPromises);

      let usersData = [];

      // Xử lý response từ userService
      if (usersResponse?.rawResponse?.data) {
        // Nếu API trả về mảng user
        usersData = Array.isArray(usersResponse.rawResponse.data)
          ? usersResponse.rawResponse.data
          : [usersResponse.rawResponse.data];
      } else if (usersResponse?.data) {
        usersData = Array.isArray(usersResponse.data)
          ? usersResponse.data
          : [usersResponse.data];
      } else if (Array.isArray(usersResponse)) {
        usersData = usersResponse;
      }

      // 3. Kết hợp thông tin từ projectMembers và usersData
      const memberDetails = projectMembers.map((projectMember) => {
        // Tìm user tương ứng
        const userDetail = usersData.find(
          (user) => user.id === projectMember.userId
        );

        // Tạo object kết hợp
        return {
          projectMemberId: projectMember.id,
          userId: projectMember.userId,
          roleInProject: projectMember.role || "Member",
          joinAt: projectMember.joinAt || projectMember.createdAt,
          // Thông tin từ user
          fullName: userDetail?.fullName || "Unknown",
          email: userDetail?.email || "No email",
          phoneNumber: userDetail?.phoneNumber || "No phone",
          studentId: userDetail?.studentId || userDetail?.code || "N/A",
          department: userDetail?.department || "Not specified",
          avatar: userDetail?.avatar,
          userRole: userDetail?.role || "Student",
          isActive: userDetail?.isActive !== false,
        };
      });

      setTeamMemberDetails(memberDetails);
      setTeamMembers(memberDetails); // Giữ để tương thích với code cũ
    } catch (error) {
      console.error("Error fetching project members with details:", error);
      // Fallback: thử cách khác nếu API getUsersByIds không tồn tại
      await fetchMembersWithIndividualRequests();
    } finally {
      setTeamMembersLoading(false);
    }
  };

  // Fallback method: lấy từng user một bằng individual requests
  const fetchMembersWithIndividualRequests = async () => {
    try {
      const membersResponse = await projectMemberApi.getProjectMembers({
        projectId: project.id,
      });

      let projectMembers = [];

      if (membersResponse?.rawResponse?.data) {
        projectMembers = membersResponse.rawResponse.data;
      } else if (membersResponse?.data) {
        projectMembers = membersResponse.data;
      } else if (Array.isArray(membersResponse)) {
        projectMembers = membersResponse;
      }

      if (projectMembers.length === 0) {
        setTeamMemberDetails([]);
        return;
      }

      // Lấy thông tin từng user riêng lẻ
      const memberDetailsPromises = projectMembers.map(
        async (projectMember) => {
          try {
            const userResponse = await userService.getCurrentUser(
              projectMember.userId
            );

            let userDetail = null;
            if (userResponse?.rawResponse?.data) {
              userDetail = userResponse.rawResponse.data;
            } else if (userResponse?.data) {
              userDetail = userResponse.data;
            } else if (userResponse && typeof userResponse === "object") {
              userDetail = userResponse;
            }

            return {
              projectMemberId: projectMember.id,
              userId: projectMember.userId,
              roleInProject: projectMember.role || "Member",
              joinAt: projectMember.joinAt || projectMember.createdAt,
              fullName: userDetail?.fullName || "Unknown",
              email: userDetail?.email || "No email",
              phoneNumber: userDetail?.phoneNumber || "No phone",
              studentId: userDetail?.studentId || userDetail?.code || "N/A",
              department: userDetail?.department || "Not specified",
              avatar: userDetail?.avatar,
              userRole: userDetail?.role || "Student",
              isActive: userDetail?.isActive !== false,
            };
          } catch (error) {
            console.error(
              `Error fetching user ${projectMember.userId}:`,
              error
            );
            return {
              projectMemberId: projectMember.id,
              userId: projectMember.userId,
              roleInProject: projectMember.role || "Member",
              joinAt: projectMember.joinAt || projectMember.createdAt,
              fullName: "Error loading user",
              email: "N/A",
              phoneNumber: "N/A",
              studentId: "N/A",
              department: "Error",
              isActive: false,
            };
          }
        }
      );

      const memberDetails = await Promise.all(memberDetailsPromises);
      setTeamMemberDetails(memberDetails);
      setTeamMembers(memberDetails);
    } catch (error) {
      console.error("Error in fallback method:", error);
      setTeamMemberDetails([]);
    }
  };

  // Hàm lấy thông tin project chi tiết
  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      setMentor(null);
      setSemester(null);
      setTeamMemberDetails([]);

      const response = await projectService.getProjectById(projectId);

      if (response?.rawResponse?.data) {
        const projectData = response.rawResponse.data;
        setProject(projectData);
      } else if (response?.data) {
        setProject(response.data);
      }
    } catch (error) {
      console.error("Error fetching project details:", error);
    } finally {
      setLoading(false);
    }
  };

  // Hàm lấy thông tin mentor
  const fetchMentorDetails = async () => {
    try {
      setMentorLoading(true);
      const response = await userService.getCurrentUser(project.mentorId);

      let mentorData = null;
      if (response?.rawResponse?.data) {
        mentorData = response.rawResponse.data;
      } else if (response?.data) {
        mentorData = response.data;
      } else if (response && typeof response === "object") {
        mentorData = response;
      }

      setMentor(mentorData);
    } catch (error) {
      console.error("Error fetching mentor details:", error);
      setMentor(null);
    } finally {
      setMentorLoading(false);
    }
  };

  // Hàm lấy thông tin semester
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

  // Hàm format ngày
  const formatDateOnly = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-EN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  // Lấy start date
  const getStartDate = () => {
    return project?.createdAt ? formatDateOnly(project.createdAt) : "N/A";
  };

  // Lấy end date
  const getEndDate = () => {
    if (semester?.endDate) {
      return formatDateOnly(semester.endDate);
    }
    return project?.endDate ? formatDateOnly(project.endDate) : "N/A";
  };

  // Render role badge với màu sắc
  const renderRoleBadge = (role) => {
    const roleConfig = {
      Leader: {
        color: "bg-purple-100 text-purple-800",
        icon: <Shield size={12} />,
      },
      "Co-Leader": {
        color: "bg-indigo-100 text-indigo-800",
        icon: <Shield size={12} />,
      },
      Developer: { color: "bg-blue-100 text-blue-800", icon: null },
      Designer: { color: "bg-pink-100 text-pink-800", icon: null },
      Tester: { color: "bg-yellow-100 text-yellow-800", icon: null },
      Member: { color: "bg-gray-100 text-gray-800", icon: null },
    };

    const config = roleConfig[role] || roleConfig["Member"];

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.icon}
        {role}
      </span>
    );
  };

  // Render user role badge
  const renderUserRoleBadge = (userRole) => {
    const roleConfig = {
      Admin: { color: "bg-red-100 text-red-800" },
      Lecturer: { color: "bg-green-100 text-green-800" },
      Student: { color: "bg-blue-100 text-blue-800" },
      Mentor: { color: "bg-purple-100 text-purple-800" },
    };

    const config = roleConfig[userRole] || {
      color: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {userRole}
      </span>
    );
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
              className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
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
                    Team Members ({teamMemberDetails.length})
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
                        {/* Project Information */}
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

                        {/* Timeline */}
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
                                      {mentor.fullName || "Unknown Mentor"}
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
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold text-gray-800">
                            Team Members ({teamMemberDetails.length})
                          </h3>
                          <button
                            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            onClick={() => {
                              // Logic để thêm thành viên mới
                              console.log("Add new member clicked");
                            }}
                          >
                            <UserPlus size={16} />
                            Add Member
                          </button>
                        </div>

                        {teamMembersLoading ? (
                          <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="mt-2 text-gray-500">
                              Loading team members...
                            </p>
                          </div>
                        ) : teamMemberDetails.length > 0 ? (
                          <div className="space-y-3">
                            {teamMemberDetails.map((member, index) => (
                              <motion.div
                                key={member.userId || index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                                className={`bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all duration-200 hover:border-gray-300 ${
                                  !member.isActive ? "opacity-75" : ""
                                }`}
                              >
                                <div className="flex items-start gap-4">
                                  {/* Avatar với status indicator */}
                                  <div className="relative flex-shrink-0">
                                    <div className="relative">
                                      {member.avatar ? (
                                        <img
                                          src={member.avatar}
                                          alt={member.fullName}
                                          className="w-14 h-14 rounded-xl object-cover border-2 border-white shadow-sm"
                                        />
                                      ) : (
                                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                                          <span className="text-white font-bold text-lg">
                                            {member.fullName?.charAt(0) || "?"}
                                          </span>
                                        </div>
                                      )}
                                      {member.isActive && (
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Member Info */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                                      <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                          <h4 className="font-bold text-gray-900 text-lg">
                                            {member.fullName}
                                          </h4>
                                          {!member.isActive && (
                                            <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                              Inactive
                                            </span>
                                          )}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3 text-sm">
                                          <span className="text-gray-500 font-mono">
                                            ID: {member.userId}
                                          </span>
                                          <span className="text-gray-300">
                                            •
                                          </span>
                                          <span className="text-gray-600">
                                            Joined{" "}
                                            {formatDateOnly(member.joinAt)}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Role badges và actions */}
                                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                        <div className="flex flex-wrap gap-2">
                                          {renderRoleBadge(
                                            member.roleInProject
                                          )}
                                          {renderUserRoleBadge(member.userRole)}
                                        </div>

                                        {/* Action menu */}
                                        <div className="relative">
                                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                            <MoreVertical
                                              size={20}
                                              className="text-gray-400"
                                            />
                                          </button>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Contact Info và các chi tiết khác */}
                                    <div className="mt-4 pt-4 border-t border-gray-100 min-w-0">
                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {/* Email */}
                                        <div className="flex items-start gap-3">
                                          <div className="p-2 bg-blue-50 rounded-lg">
                                            <Mail
                                              size={16}
                                              className="text-blue-600"
                                            />
                                          </div>
                                          <div className="min-w-0 flex-1">
                                            <p className="text-xs text-gray-500 mb-1">
                                              Email
                                            </p>
                                            <a
                                              href={`mailto:${member.email}`}
                                              className="text-gray-800 hover:text-blue-600 hover:underline transition-colors font-medium truncate block"
                                            >
                                              {member.email}
                                            </a>
                                          </div>
                                        </div>

                                        {/* Phone */}
                                        {/* <div className="flex items-start gap-3">
                                          <div className="p-2 bg-green-50 rounded-lg">
                                            <Phone
                                              size={16}
                                              className="text-green-600"
                                            />
                                          </div>
                                          <div>
                                            <p className="text-xs text-gray-500 mb-1">
                                              Phone
                                            </p>
                                            <span className="text-gray-800 font-medium">
                                              {member.phoneNumber ||
                                                "Not provided"}
                                            </span>
                                          </div>
                                        </div> */}

                                        {/* Join Date */}
                                        <div className="flex items-start gap-3">
                                          <div className="p-2 bg-purple-50 rounded-lg">
                                            <Calendar
                                              size={16}
                                              className="text-purple-600"
                                            />
                                          </div>
                                          <div>
                                            <p className="text-xs text-gray-500 mb-1">
                                              Joined Date
                                            </p>
                                            <span className="text-gray-800 font-medium">
                                              {new Date(
                                                member.joinAt
                                              ).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                              })}
                                            </span>
                                          </div>
                                        </div>

                                        {/* Status */}
                                        <div className="flex items-start gap-3">
                                          <div className="p-2 bg-gray-50 rounded-lg">
                                            <User
                                              size={16}
                                              className="text-gray-600"
                                            />
                                          </div>
                                          <div>
                                            <p className="text-xs text-gray-500 mb-1">
                                              Status
                                            </p>
                                            <span
                                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                member.isActive
                                                  ? "bg-green-100 text-green-800"
                                                  : "bg-gray-100 text-gray-800"
                                              }`}
                                            >
                                              {member.isActive
                                                ? "Active"
                                                : "Inactive"}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12 bg-gray-50 rounded-xl">
                            <Users
                              size={64}
                              className="mx-auto text-gray-300 mb-4"
                            />
                            <p className="text-gray-500 text-lg mb-2">
                              No team members yet
                            </p>
                            <p className="text-gray-400 mb-6">
                              Add members to start working on this project
                            </p>
                            <button
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                              onClick={() => {
                                console.log("Add first member clicked");
                              }}
                            >
                              <UserPlus size={18} />
                              Add First Member
                            </button>
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
