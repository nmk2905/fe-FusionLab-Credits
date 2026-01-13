// src/ProjectDetail/components/TeamTab.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Calendar,
  User,
  UserPlus,
  MoreVertical,
  Shield,
} from "lucide-react";
import projectMemberApi from "../../../services/apis/projectMemberApi";
import userService from "../../../services/apis/userApi";

const TeamTab = ({ projectId }) => {
  const [teamMemberDetails, setTeamMemberDetails] = useState([]);
  const [teamMembersLoading, setTeamMembersLoading] = useState(false);
  const role = localStorage.getItem("role");

  useEffect(() => {
    const fetchProjectMembersWithDetails = async () => {
      try {
        setTeamMembersLoading(true);
        setTeamMemberDetails([]);

        // 1. Lấy danh sách project members
        const membersResponse = await projectMemberApi.getProjectMembers({
          projectId: projectId,
        });

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

        // 2. Lấy thông tin chi tiết của users
        const usersResponse = await userService.getUsersByIds(userIds);
        let usersData = [];

        if (usersResponse?.rawResponse?.data) {
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

        // 3. Kết hợp thông tin
        const memberDetails = projectMembers.map((projectMember) => {
          const userDetail = usersData.find(
            (user) => user.id === projectMember.userId
          );

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
        });

        setTeamMemberDetails(memberDetails);
      } catch (error) {
        console.error("Error fetching project members with details:", error);
      } finally {
        setTeamMembersLoading(false);
      }
    };

    if (projectId) {
      fetchProjectMembersWithDetails();
    }
  }, [projectId]);

  // Render role badge
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

  const handleAddMember = () => {
    console.log("Add new member clicked");
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800">
          Team Members ({teamMemberDetails.length})
        </h3>
        {role === "Mentor" && (
          <button
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={handleAddMember}
          >
            <UserPlus size={18} />
            Add Member
          </button>
        )}
      </div>

      {teamMembersLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-500">Loading team members...</p>
        </div>
      ) : teamMemberDetails.length > 0 ? (
        <div className="space-y-4">
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
                        <span className="text-gray-300">•</span>
                        <span className="text-gray-600">
                          Joined {formatDateOnly(member.joinAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <div className="flex flex-wrap gap-2">
                        {renderRoleBadge(member.roleInProject)}
                        {renderUserRoleBadge(member.userRole)}
                      </div>

                      <div className="relative">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreVertical size={20} className="text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 min-w-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <Mail size={16} className="text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-500 mb-1">Email</p>
                          <a
                            href={`mailto:${member.email}`}
                            className="text-gray-800 hover:text-blue-600 hover:underline transition-colors font-medium truncate block"
                          >
                            {member.email}
                          </a>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-purple-50 rounded-lg">
                          <Calendar size={16} className="text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Joined Date
                          </p>
                          <span className="text-gray-800 font-medium">
                            {new Date(member.joinAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-50 rounded-lg">
                          <User size={16} className="text-gray-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Status</p>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              member.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {member.isActive ? "Active" : "Inactive"}
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
          <User size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg mb-2">No team members yet</p>
          <p className="text-gray-400 mb-6">
            Add members to start working on this project
          </p>
          {role === "Mentor" && (
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              onClick={handleAddMember}
            >
              <UserPlus size={18} />
              Add First Member
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TeamTab;
