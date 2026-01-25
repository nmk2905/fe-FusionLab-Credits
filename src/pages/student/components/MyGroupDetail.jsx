// src/pages/student/components/MyGroupDetail.jsx
import React, { useEffect, useState, useContext, useMemo } from "react";
import {
  Users,
  Calendar,
  TrendingUp,
  LogOut,
  ChevronRight,
  UserCheck,
  History,
  UserPlus,
  X,
  Search,
  CheckCircle,
  CheckSquare,
  ListTodo,
  UserCog,
  ChevronLeft,
  ChevronDown,
} from "lucide-react";
import projectApi from "../../../services/apis/projectApi";
import projectMemberApi from "../../../services/apis/projectMemberApi";
import projectInvitationService from "../../../services/apis/projectInvitationService";
import userService from "../../../services/apis/userApi";
import TaskManagement from "./TaskManagement";
import { AuthContext } from "../../../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

const TABS = {
  MY_GROUP: "my-group",
  HISTORY: "history",
};

const GROUP_TABS = {
  TASKS: "tasks",
  MEMBERS: "members",
};

export default function MyGroupDetail({ projectId: propProjectId }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState(
    propProjectId || null,
  );
  const [activeGroupTab, setActiveGroupTab] = useState(GROUP_TABS.TASKS);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Invite modal states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchUserQuery, setSearchUserQuery] = useState("");
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUserToInvite, setSelectedUserToInvite] = useState(null);
  const [inviteMessage, setInviteMessage] = useState("");
  const [sendingInvite, setSendingInvite] = useState(false);
  const [currentInvitePage, setCurrentInvitePage] = useState(0);
  const INVITE_USERS_PER_PAGE = 12;

  const currentPath = location.pathname;
  const activeTab = currentPath.includes("/my-group")
    ? TABS.MY_GROUP
    : TABS.HISTORY;

  // Paginated users for invite modal
  const currentInviteUsers = useMemo(() => {
    const start = currentInvitePage * INVITE_USERS_PER_PAGE;
    return availableUsers.slice(start, start + INVITE_USERS_PER_PAGE);
  }, [availableUsers, currentInvitePage]);

  // Fetch user's joined projects
  useEffect(() => {
    const fetchUserProjects = async () => {
      if (!user?.id) return;
      setLoadingProjects(true);
      try {
        const myRes = await projectMemberApi.getProjectMembers({
          userId: user.id,
        });
        if (myRes?.success && myRes?.rawResponse?.data?.length > 0) {
          const projectIds = myRes.rawResponse.data.map(
            (item) => item.projectId,
          );
          const projectPromises = projectIds.map((id) =>
            projectApi.getProjectById(id),
          );
          const projectResults = await Promise.all(projectPromises);

          const projectsData = projectResults.map((result, index) => {
            const projectId = projectIds[index];
            const projectData = result?.data || result || {};
            return {
              ...projectData,
              id: projectId,
              memberInfo: myRes.rawResponse.data.find(
                (item) => item.projectId === projectId,
              ),
            };
          });

          setProjects(projectsData);

          let targetProject = propProjectId
            ? projectsData.find((p) => p.id === propProjectId)
            : projectsData[0];

          if (targetProject) {
            setSelectedProject(targetProject);
            setSelectedProjectId(targetProject.id);
          }
        } else {
          setProjects([]);
        }
      } catch (err) {
        console.error("Failed to fetch user's projects:", err);
        setProjects([]);
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchUserProjects();
  }, [user?.id, propProjectId]);

  // Fetch members of selected project
  useEffect(() => {
    if (!selectedProjectId) return;

    const fetchMembers = async () => {
      setLoading(true);
      try {
        const memRes = await projectMemberApi.getProjectMembers({
          projectId: selectedProjectId,
          pageSize: 50,
        });

        const mems =
          memRes?.success && memRes?.data
            ? Array.isArray(memRes.data)
              ? memRes.data
              : Object.values(memRes.data)
            : [];

        setMembers(mems);
      } catch (err) {
        console.error("Error fetching members:", err);
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [selectedProjectId]);

  // Load users when invite modal opens + search changes
  useEffect(() => {
    if (!showInviteModal) return;

    const loadUsers = async () => {
      try {
        const res = await userService.getUsers({
          search: searchUserQuery.trim(),
          pageSize: 50,
          role: "User",
        });

        let users =
          res?.contends ||
          res?.rawResponse?.contends ||
          res?.data?.contends ||
          res?.data ||
          [];

        if (!Array.isArray(users)) {
          console.warn("Users response is not an array:", users);
          users = [];
        }

        const memberUserIds = new Set(members.map((m) => m.userId));
        users = users.filter(
          (u) =>
            u?.id &&
            !memberUserIds.has(u.id) &&
            u.id !== user?.id &&
            u.roles?.some((r) => r.name === "User"),
        );

        setAvailableUsers(users);
        setCurrentInvitePage(0);
      } catch (err) {
        console.error("Failed to load users for invitation:", err);
        setAvailableUsers([]);
      }
    };

    loadUsers();
  }, [showInviteModal, searchUserQuery, members, user?.id]);

  const sendInvitation = async () => {
    if (!selectedUserToInvite) {
      alert("Please select a user to invite.");
      return;
    }

    if (!window.confirm("Send invitation to this user?")) return;

    setSendingInvite(true);
    try {
      await projectInvitationService.sendInvitation({
        projectId: selectedProjectId,
        invitedUserId: selectedUserToInvite,
        message: inviteMessage.trim(),
      });

      alert("Invitation sent successfully!");
      setShowInviteModal(false);
      setSelectedUserToInvite(null);
      setInviteMessage("");
      setSearchUserQuery("");
    } catch (err) {
      console.error("Failed to send invitation:", err);
      alert("Could not send invitation. Please try again.");
    } finally {
      setSendingInvite(false);
    }
  };

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    setSelectedProjectId(project.id);
    setLoading(true);
    setActiveGroupTab(GROUP_TABS.TASKS);
  };

  const handleLeave = async () => {
    if (!window.confirm("Are you sure you want to leave this group?")) return;

    try {
      await projectMemberApi.leaveProject({
        userId: user.id,
        projectId: selectedProjectId,
      });

      alert("You have successfully left the group!");

      const updatedProjects = projects.filter(
        (p) => p.id !== selectedProjectId,
      );
      setProjects(updatedProjects);

      if (updatedProjects.length > 0) {
        setSelectedProject(updatedProjects[0]);
        setSelectedProjectId(updatedProjects[0].id);
      } else {
        navigate("/student/group-management", { replace: true });
      }
    } catch (err) {
      console.error("Leave failed:", err);
      alert("Unable to leave the group. Please try again.");
    }
  };

  if (loadingProjects) {
    return <div className="p-8 text-center">Loading your groups...</div>;
  }

  if (projects.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <h2 className="text-2xl font-bold mb-4">No Active Groups</h2>
          <p className="text-gray-600 mb-6">
            You are not currently a member of any project group.
          </p>
          <button
            onClick={() => navigate("/student/group-management")}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          >
            Browse Available Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-full mx-auto">
      {/* Main Tabs - Horizontal */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => navigate("/student/group-management/my-group")}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === TABS.MY_GROUP
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <UserCheck size={20} />
            My Group
          </button>
          <button
            onClick={() => navigate("/student/group-management/history")}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === TABS.HISTORY
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <History size={20} />
            Project History
          </button>
        </nav>
      </div>

      {/* Horizontal Layout Container */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Collapsible Sidebar */}
        <div
          className={`transition-all duration-300 ${sidebarCollapsed ? "lg:w-16" : "lg:w-96"}`}
        >
          <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
            <div className="flex justify-between items-center mb-4">
              {!sidebarCollapsed && (
                <h2 className="text-xl font-bold">
                  Your Groups ({projects.length})
                </h2>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {sidebarCollapsed ? (
                  <ChevronRight size={20} />
                ) : (
                  <ChevronLeft size={20} />
                )}
              </button>
            </div>

            <div
              className={`space-y-3 max-h-[70vh] overflow-y-auto transition-all ${sidebarCollapsed ? "opacity-0 hidden" : "opacity-100"}`}
            >
              {projects.map((proj) => (
                <button
                  key={proj.id}
                  onClick={() => handleProjectSelect(proj)}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    selectedProjectId === proj.id
                      ? "bg-blue-50 border-blue-300 shadow-sm"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg truncate">
                        {proj.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Role:{" "}
                        <span className="capitalize">
                          {proj.memberInfo?.role || "member"}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Joined:{" "}
                        {new Date(
                          proj.memberInfo?.joinAt || proj.memberInfo?.createdAt,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <ChevronRight
                      size={20}
                      className={
                        selectedProjectId === proj.id
                          ? "text-blue-600"
                          : "text-gray-400"
                      }
                    />
                  </div>
                </button>
              ))}
            </div>

            {sidebarCollapsed && (
              <div className="space-y-2">
                {projects.map((proj) => (
                  <button
                    key={proj.id}
                    onClick={() => handleProjectSelect(proj)}
                    className={`w-full p-3 rounded-lg flex items-center justify-center transition-all ${
                      selectedProjectId === proj.id
                        ? "bg-blue-50 border border-blue-300"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                    title={proj.title}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                      {proj.title?.[0] || "P"}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area - Takes remaining space */}
        <div className="flex-1 min-w-0">
          {selectedProject ? (
            <>
              {/* Header Row */}
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h1 className="text-2xl lg:text-3xl font-bold truncate">
                        {selectedProject.title}
                      </h1>
                      <span className="px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        {selectedProject.memberInfo?.role?.toLowerCase() ===
                        "leader"
                          ? "Leader"
                          : "Member"}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-2 line-clamp-2">
                      {selectedProject.description ||
                        "No description available."}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleLeave}
                      className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium text-sm lg:text-base"
                    >
                      <LogOut size={18} />
                      <span className="hidden sm:inline">Leave Group</span>
                    </button>

                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-medium text-sm lg:text-base"
                    >
                      <UserPlus size={18} />
                      <span className="hidden sm:inline">Invite Members</span>
                    </button>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-3">
                      <Users className="text-blue-600" size={24} />
                      <div>
                        <p className="text-sm text-gray-600">Members</p>
                        <p className="font-bold text-xl">
                          {members.length} / {selectedProject.maxMembers || "?"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="text-green-600" size={24} />
                      <div>
                        <p className="text-sm text-gray-600">Total Points</p>
                        <p className="font-bold text-xl">
                          {selectedProject.totalPoints || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                    <div className="flex items-center gap-3">
                      <Calendar className="text-purple-600" size={24} />
                      <div>
                        <p className="text-sm text-gray-600">Created</p>
                        <p className="font-bold text-lg">
                          {new Date(
                            selectedProject.createdAt,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                    <div className="flex items-center gap-3">
                      <CheckSquare className="text-orange-600" size={24} />
                      <div>
                        <p className="text-sm text-gray-600">Your Role</p>
                        <p className="font-bold text-lg capitalize">
                          {selectedProject.memberInfo?.role || "member"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tab Navigation - Horizontal */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="border-b border-gray-200">
                  <div className="flex overflow-x-auto">
                    <button
                      onClick={() => setActiveGroupTab(GROUP_TABS.TASKS)}
                      className={`flex-1 min-w-[120px] py-4 px-4 text-center font-medium flex items-center justify-center gap-2 transition-colors whitespace-nowrap ${
                        activeGroupTab === GROUP_TABS.TASKS
                          ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                          : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <ListTodo size={20} />
                      Tasks
                    </button>
                    <button
                      onClick={() => setActiveGroupTab(GROUP_TABS.MEMBERS)}
                      className={`flex-1 min-w-[120px] py-4 px-4 text-center font-medium flex items-center justify-center gap-2 transition-colors whitespace-nowrap ${
                        activeGroupTab === GROUP_TABS.MEMBERS
                          ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                          : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Users size={20} />
                      Members
                    </button>
                  </div>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {activeGroupTab === GROUP_TABS.TASKS ? (
                    <div className="min-h-[400px]">
                      <TaskManagement projectId={selectedProjectId} />
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold">Group Members</h3>
                        <div className="text-sm text-gray-600">
                          {members.length} member
                          {members.length !== 1 ? "s" : ""}
                        </div>
                      </div>

                      {loading ? (
                        <div className="text-center py-8">
                          Loading members...
                        </div>
                      ) : members.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">
                          No members found.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {members.map((member) => (
                            <div
                              key={member.id || member.userId}
                              className={`p-4 rounded-xl border ${
                                member.userId === user?.id
                                  ? "bg-gradient-to-r from-blue-50 to-blue-100 border-blue-300"
                                  : "bg-gray-50 border-gray-200 hover:border-blue-300 transition-colors"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                  {member.userName?.[0] ||
                                    member.userId?.[0] ||
                                    "U"}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1 min-w-0">
                                      <p className="font-bold text-lg truncate">
                                        {member.userName ||
                                          `User ${member.userId}`}
                                      </p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className="text-sm text-gray-600 capitalize">
                                          {member.role || "member"}
                                        </span>
                                        {String(
                                          member.role || "",
                                        ).toLowerCase() === "leader" && (
                                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                            Leader
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    {member.userId === user?.id && (
                                      <span className="text-blue-600 font-medium text-sm flex-shrink-0 ml-2">
                                        You
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500 mt-2">
                                    Joined:{" "}
                                    {new Date(
                                      member.joinAt || member.createdAt,
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <p className="text-gray-600 text-lg">
                Select a group from the list to view details
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[94vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b bg-gradient-to-r from-indigo-50 to-blue-50 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Invite to Project
                </h2>
                <p className="text-sm text-gray-600 mt-0.5">
                  {availableUsers.length} available users
                </p>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition"
              >
                <X size={24} className="text-gray-700" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto bg-gray-50">
              <div className="relative mb-5">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  value={searchUserQuery}
                  onChange={(e) => setSearchUserQuery(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                />
              </div>

              {availableUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <Users size={56} className="text-gray-300 mb-3" />
                  <h3 className="text-lg font-medium text-gray-700">
                    {searchUserQuery
                      ? "No matching users"
                      : "No users available"}
                  </h3>
                  <p className="text-xs mt-1.5 text-center max-w-sm">
                    {searchUserQuery
                      ? "Try different keywords."
                      : "Everyone eligible is already in the group."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    {currentInviteUsers.map((u) => (
                      <div
                        key={u.id}
                        onClick={() => setSelectedUserToInvite(u.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-200 flex items-center gap-3.5 text-sm ${
                          selectedUserToInvite === u.id
                            ? "border-blue-500 bg-blue-50 shadow-md"
                            : "border-gray-200 hover:bg-white hover:shadow hover:border-blue-300"
                        }`}
                      >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                          {u.fullName?.[0] ||
                            u.name?.[0] ||
                            u.email?.[0] ||
                            "?"}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {u.fullName ||
                              u.name ||
                              u.userName ||
                              `User ${u.id}`}
                          </p>
                          {u.email && (
                            <p className="text-xs text-gray-600 truncate mt-0.5">
                              {u.email}
                            </p>
                          )}
                        </div>

                        {selectedUserToInvite === u.id && (
                          <CheckCircle
                            size={20}
                            className="text-blue-600 flex-shrink-0"
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  {availableUsers.length > INVITE_USERS_PER_PAGE && (
                    <div className="flex justify-center items-center gap-5 mt-4">
                      <button
                        onClick={() =>
                          setCurrentInvitePage((prev) => Math.max(0, prev - 1))
                        }
                        disabled={currentInvitePage === 0}
                        className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 transition"
                      >
                        Previous
                      </button>

                      <span className="text-xs text-gray-600">
                        Page {currentInvitePage + 1}
                      </span>

                      <button
                        onClick={() => setCurrentInvitePage((prev) => prev + 1)}
                        disabled={
                          (currentInvitePage + 1) * INVITE_USERS_PER_PAGE >=
                          availableUsers.length
                        }
                        className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 transition"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="p-5 border-t bg-gray-50">
              <textarea
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                placeholder="Optional message..."
                className="w-full p-2.5 border border-gray-300 rounded-lg mb-4 min-h-[70px] text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                onClick={sendInvitation}
                disabled={sendingInvite || !selectedUserToInvite}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-medium flex items-center justify-center gap-2 text-sm"
              >
                {sendingInvite ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sending...
                  </>
                ) : (
                  "Send Invitation"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
2