// src/pages/student/components/GroupManagement.jsx
import React, { useEffect, useMemo, useState, useContext } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Calendar,
  TrendingUp,
  CheckCircle,
  Search,
  History,
  List,
  UserCheck,
  Lock,
  Bell,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import projectApi from "../../../services/apis/projectApi";
import projectMemberApi from "../../../services/apis/projectMemberApi";
import projectInvitationService from "../../../services/apis/projectInvitationService";
import { AuthContext } from "../../../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

const TABS = {
  LIST: "list",
  MY_GROUP: "my-group",
  HISTORY: "history",
};

export default function GroupManagement() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [allProjects, setAllProjects] = useState([]);
  const [hasJoinedAnyProject, setHasJoinedAnyProject] = useState(false);
  const [userCurrentProjectId, setUserCurrentProjectId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");

  // Invitations states
  const [showInvitations, setShowInvitations] = useState(false);
  const [invitations, setInvitations] = useState([]);
  const [invitationsLoading, setInvitationsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const ITEMS_PER_PAGE = 7;

  // Semester collapse state — first semester expanded by default
  const [expandedSemesters, setExpandedSemesters] = useState(new Set());

  const toggleSemester = (semesterId) => {
    setExpandedSemesters((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(semesterId)) {
        newSet.delete(semesterId);
      } else {
        newSet.add(semesterId);
      }
      return newSet;
    });
  };

  // Determine active tab
  const currentPath = location.pathname;
  const activeTab = currentPath.includes("/my-group")
    ? TABS.MY_GROUP
    : currentPath.includes("/history")
      ? TABS.HISTORY
      : TABS.LIST;

  // ─── Fetch pending invitations from ALL open projects ──
  const fetchMyInvitations = async () => {
    if (!user?.id) return;

    setInvitationsLoading(true);

    try {
      const projectsRes = await projectApi.getAllProjects(1000, 1, "desc");
      let projects = [];
      if (projectsRes?.data) {
        projects = Array.isArray(projectsRes.data)
          ? projectsRes.data
          : Object.values(projectsRes.data);
      }
      const openProjects = projects.filter((p) => p.status === "Open");

      const allInvites = [];

      for (const proj of openProjects) {
        try {
          const invRes = await projectInvitationService.getInvitationsByProject(
            proj.id,
            1,
            50,
          );
          let rawData = invRes?.data || invRes || [];
          if (!Array.isArray(rawData) && typeof rawData === "object") {
            rawData = Object.values(rawData);
          }
          const list = Array.isArray(rawData) ? rawData : [];
          allInvites.push(...list);
        } catch (err) {
          console.warn(`Failed to fetch invites for project ${proj.id}`, err);
        }
      }

      const myPendingInvites = allInvites.filter((inv) => {
        if (!inv || typeof inv !== "object") return false;
        const isMyInvite = Number(inv.invitedUserId) === Number(user.id);
        const isPending = (inv.status || "").toLowerCase() === "pending";
        return isMyInvite && isPending;
      });

      const uniqueInvites = myPendingInvites.filter(
        (v, i, a) =>
          a.findIndex(
            (t) =>
              (t.id && t.id === v.id) ||
              (t.inviteCode && t.inviteCode === v.inviteCode),
          ) === i,
      );

      setInvitations(uniqueInvites);
      setCurrentPage(0);
    } catch (err) {
      console.error("Failed to fetch invitations:", err);
      setInvitations([]);
    } finally {
      setInvitationsLoading(false);
    }
  };

  useEffect(() => {
    if (showInvitations) fetchMyInvitations();
  }, [showInvitations]);

  const currentInvitations = useMemo(() => {
    const start = currentPage * ITEMS_PER_PAGE;
    return invitations.slice(start, start + ITEMS_PER_PAGE);
  }, [invitations, currentPage]);

  const handleRespond = async (inviteCode, accept) => {
    try {
      await projectInvitationService.respondToInvitation(inviteCode, accept);
      if (accept) {
        alert("You have successfully joined the project!");
        setShowInvitations(false);
        await checkUserMembership();
      } else {
        alert("Invitation declined.");
      }
      fetchMyInvitations();
    } catch (err) {
      console.error("Failed to respond:", err);
      alert("Action failed. Please try again.");
    }
  };

  const checkUserMembership = async () => {
    if (!user?.id) return;
    try {
      const res = await projectMemberApi.getProjectMembers({
        userId: user.id,
        pageSize: 10,
      });
      let memberships = [];
      if (res?.success && res?.data) {
        memberships = Array.isArray(res.data)
          ? res.data
          : res.data?.items || Object.values(res.data) || [];
      } else if (Array.isArray(res)) {
        memberships = res;
      }
      const hasAny = memberships.length > 0;
      setHasJoinedAnyProject(hasAny);
      setUserCurrentProjectId(hasAny ? memberships[0].projectId : null);
    } catch (err) {
      console.warn("Cannot check membership:", err);
      setHasJoinedAnyProject(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const allRes = await projectApi.getAllProjects(1000, 1, "desc");
        let projectsData = allRes?.data
          ? Array.isArray(allRes.data)
            ? allRes.data
            : Object.values(allRes.data)
          : Array.isArray(allRes)
            ? allRes
            : [];
        setAllProjects(projectsData);
        await checkUserMembership();
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.id]);

  useEffect(() => {
    if (!loading && hasJoinedAnyProject && activeTab === TABS.LIST) {
      navigate("/student/group-management/my-group", { replace: true });
    }
  }, [loading, hasJoinedAnyProject, activeTab, navigate]);

  useEffect(() => {
    if (location.state?.fromJoin) {
      checkUserMembership().then(() => {
        if (hasJoinedAnyProject) {
          navigate("/student/group-management/my-group", { replace: true });
        }
        navigate(location.pathname, { replace: true, state: {} });
      });
    }
  }, [location.state?.fromJoin, navigate, hasJoinedAnyProject]);

  // ─── Group & sort semesters ascending (1 → 2 → 3 → ...) ───
  const projectsBySemester = useMemo(() => {
    const grouped = {};

    allProjects.forEach((p) => {
      const sem = p.semesterId || "Unknown";
      if (!grouped[sem]) grouped[sem] = [];
      grouped[sem].push(p);
    });

    // Sort semester keys ascending
    const sortedSemesters = Object.keys(grouped)
      .map(Number)
      .filter((n) => !isNaN(n))
      .sort((a, b) => a - b);

    // Non-numeric at the end
    const nonNumeric = Object.keys(grouped).filter((k) => isNaN(Number(k)));

    return {
      grouped,
      sortedSemesters: [...sortedSemesters, ...nonNumeric],
    };
  }, [allProjects]);

  // Filter + sort projects inside each semester
  const filteredProjectsBySemester = useMemo(() => {
    const { grouped, sortedSemesters } = projectsBySemester;
    const result = {};

    sortedSemesters.forEach((semId) => {
      let projects = grouped[semId] || [];

      // Only open & not full
      projects = projects.filter(
        (p) =>
          p.status === "Open" &&
          (!p.maxMembers || (p.currentMembers ?? 0) < p.maxMembers),
      );

      // Search
      if (search) {
        projects = projects.filter((p) =>
          p.title?.toLowerCase().includes(search.toLowerCase()),
        );
      }

      // Sort
      switch (sort) {
        case "points":
          projects = [...projects].sort(
            (a, b) => (b.totalPoints ?? 0) - (a.totalPoints ?? 0),
          );
          break;
        case "members":
          projects = [...projects].sort(
            (a, b) => (b.maxMembers ?? 0) - (a.maxMembers ?? 0),
          );
          break;
        default:
          projects = [...projects].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
          );
      }

      if (projects.length > 0) {
        result[semId] = projects;
      }
    });

    return result;
  }, [projectsBySemester, search, sort]);

  // Auto-expand first semester when projects are loaded
  useEffect(() => {
    if (!loading && Object.keys(filteredProjectsBySemester).length > 0) {
      const firstSem = Object.keys(filteredProjectsBySemester)[0];
      setExpandedSemesters(new Set([Number(firstSem)]));
    }
  }, [loading, filteredProjectsBySemester]);

  if (loading)
    return <div className="p-8 text-center">Loading group status...</div>;

  if (hasJoinedAnyProject && activeTab === TABS.LIST) {
    navigate("/student/group-management/my-group", { replace: true });
    return null;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            {activeTab === TABS.LIST && "Choose Your Project"}
            {activeTab === TABS.MY_GROUP && "My Group"}
            {activeTab === TABS.HISTORY && "Project History"}
          </h1>
          {activeTab === TABS.LIST && (
            <p className="text-gray-600 mt-1">
              You can only join one project per semester.
            </p>
          )}
        </div>

        <button
          onClick={() => setShowInvitations(true)}
          className="relative p-3 text-gray-600 hover:text-blue-600 transition-colors"
          title="Project Invitations"
        >
          <Bell size={26} />
          {invitations.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white">
              {invitations.length}
            </span>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() =>
              !hasJoinedAnyProject && navigate("/student/group-management")
            }
            disabled={hasJoinedAnyProject}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === TABS.LIST
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            } ${hasJoinedAnyProject ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <List size={20} />
            Project List
            {hasJoinedAnyProject && (
              <span className="ml-2 text-xs text-red-500 font-semibold flex items-center gap-1">
                <Lock size={14} /> Locked
              </span>
            )}
          </button>

          <button
            onClick={() =>
              hasJoinedAnyProject &&
              navigate("/student/group-management/my-group")
            }
            disabled={!hasJoinedAnyProject}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === TABS.MY_GROUP
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            } ${!hasJoinedAnyProject ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <UserCheck size={20} />
            My Group
            {!hasJoinedAnyProject && (
              <span className="ml-2 text-xs">(None)</span>
            )}
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

      {/* Project List – grouped by semester */}
      {activeTab === TABS.LIST && (
        <>
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-3.5 text-gray-400"
                size={20}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects..."
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-5 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest</option>
              <option value="points">Highest Points</option>
              <option value="members">Max Members</option>
            </select>
          </div>

          <div className="space-y-10">
            {Object.keys(filteredProjectsBySemester).length === 0 ? (
              <div className="text-center py-20 text-gray-500 text-xl">
                {search
                  ? "No matching projects found."
                  : "No open projects available at this time."}
              </div>
            ) : (
              Object.entries(filteredProjectsBySemester).map(
                ([semesterId, projects]) => (
                  <div
                    key={semesterId}
                    className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleSemester(Number(semesterId))}
                      className="w-full px-6 py-5 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-bold text-gray-800">
                          Semester {semesterId}
                        </h2>
                        <span className="text-sm font-medium px-3 py-1 bg-white rounded-full shadow-sm text-indigo-700">
                          {projects.length} project
                          {projects.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      {expandedSemesters.has(Number(semesterId)) ? (
                        <ChevronUp size={28} className="text-gray-600" />
                      ) : (
                        <ChevronDown size={28} className="text-gray-600" />
                      )}
                    </button>

                    {expandedSemesters.has(Number(semesterId)) && (
                      <div className="p-6 pt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                          {projects.map((project) => (
                            <motion.div
                              key={project.id}
                              whileHover={{ y: -6, scale: 1.02 }}
                              className="bg-gray-50 rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:border-blue-300 transition-all"
                            >
                              <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                                  {project.title}
                                </h3>
                                <p className="text-gray-600 text-sm mb-5 line-clamp-3">
                                  {project.description ||
                                    "No description provided."}
                                </p>

                                <div className="space-y-2.5 text-sm text-gray-700 mb-6">
                                  <div className="flex items-center gap-2">
                                    <Users
                                      size={16}
                                      className="text-blue-600"
                                    />
                                    <span>
                                      {project.currentMembers ?? 0} /{" "}
                                      {project.maxMembers ?? "?"} members
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <TrendingUp
                                      size={16}
                                      className="text-blue-600"
                                    />
                                    <span>
                                      {project.totalPoints ?? 0} points
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Calendar
                                      size={16}
                                      className="text-blue-600"
                                    />
                                    <span>
                                      {new Date(
                                        project.createdAt,
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>

                                <button
                                  onClick={() =>
                                    navigate(
                                      `/student/group-management/${project.id}`,
                                    )
                                  }
                                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition shadow-sm"
                                >
                                  <CheckCircle size={18} />
                                  View & Join
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ),
              )
            )}
          </div>
        </>
      )}

      {/* My Group */}
      {activeTab === TABS.MY_GROUP && (
        <div className="text-center py-20">
          <UserCheck
            size={72}
            className="mx-auto text-blue-500 mb-6 opacity-90"
          />
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            My Current Group
          </h2>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            You are currently participating in a project group.
          </p>
          <button
            onClick={() => navigate("/student/group-management/my-group")}
            className="mt-8 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-md transition"
          >
            View Group Details
          </button>
        </div>
      )}

      {/* History */}
      {activeTab === TABS.HISTORY && (
        <div className="text-center py-20">
          <History
            size={72}
            className="mx-auto text-gray-400 mb-6 opacity-80"
          />
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Project History
          </h2>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            Your completed or previous semester projects will be shown here.
          </p>
        </div>
      )}

      {/* Invitations Modal */}
      {showInvitations && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Project Invitations
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  You have {invitations.length} pending invitation
                  {invitations.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={() => setShowInvitations(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={28} className="text-gray-700" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
              {invitationsLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                  <p>Loading your invitations...</p>
                </div>
              ) : invitations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                  <Bell size={64} className="text-gray-300 mb-6" />
                  <h3 className="text-xl font-medium text-gray-700">
                    No pending invitations
                  </h3>
                  <p className="text-sm mt-2 text-center max-w-md">
                    You'll see invitations here when someone invites you to join
                    a project.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-6 flex justify-between items-center text-sm text-gray-600">
                    <p>
                      Showing{" "}
                      {Math.min(
                        currentPage * ITEMS_PER_PAGE + 1,
                        invitations.length,
                      )}
                      –
                      {Math.min(
                        (currentPage + 1) * ITEMS_PER_PAGE,
                        invitations.length,
                      )}{" "}
                      of {invitations.length}
                    </p>
                  </div>

                  <div className="space-y-5">
                    {currentInvitations.map((inv) => (
                      <div
                        key={inv.id || inv.inviteCode}
                        className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all"
                      >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-5">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-bold text-lg text-gray-800">
                                Project #{inv.projectId}
                              </h3>
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-300">
                                Pending
                              </span>
                            </div>

                            <p className="text-sm text-gray-600">
                              Invited on{" "}
                              {new Date(inv.createdAt).toLocaleDateString()} •
                              Expires{" "}
                              <span
                                className={
                                  new Date(inv.expiryAt) < new Date()
                                    ? "text-red-600 font-medium"
                                    : ""
                                }
                              >
                                {new Date(inv.expiryAt).toLocaleString()}
                              </span>
                            </p>

                            {inv.message && (
                              <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-400 rounded text-gray-700 italic">
                                "{inv.message}"
                              </div>
                            )}

                            <p className="text-xs text-gray-500 mt-3">
                              Code:{" "}
                              <span className="font-mono font-medium">
                                {inv.inviteCode}
                              </span>
                            </p>
                          </div>

                          <div className="flex flex-row sm:flex-col gap-3 mt-4 sm:mt-0">
                            <button
                              onClick={() =>
                                handleRespond(inv.inviteCode, true)
                              }
                              className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium shadow-sm flex items-center justify-center gap-2 min-w-[120px]"
                            >
                              <CheckCircle size={18} />
                              Accept
                            </button>
                            <button
                              onClick={() =>
                                handleRespond(inv.inviteCode, false)
                              }
                              className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium shadow-sm flex items-center justify-center gap-2 min-w-[120px]"
                            >
                              <X size={18} />
                              Decline
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {invitations.length > ITEMS_PER_PAGE && (
                    <div className="mt-8 flex justify-center gap-4">
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.max(0, p - 1))
                        }
                        disabled={currentPage === 0}
                        className="px-6 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage((p) => p + 1)}
                        disabled={
                          (currentPage + 1) * ITEMS_PER_PAGE >=
                          invitations.length
                        }
                        className="px-6 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
