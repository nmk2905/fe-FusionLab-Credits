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

  // ─── Invitations feature ──────────────────────────────────────
  const [showInvitations, setShowInvitations] = useState(false);
  const [invitations, setInvitations] = useState([]);
  const [invitationsLoading, setInvitationsLoading] = useState(false);

  // Determine active tab from URL
  const currentPath = location.pathname;
  const activeTab = currentPath.includes("/my-group")
    ? TABS.MY_GROUP
    : currentPath.includes("/history")
    ? TABS.HISTORY
    : TABS.LIST;

  // ─── Fetch user's received invitations (temporary workaround) ──
  const fetchMyInvitations = async () => {
    if (!user?.id) {
      console.warn("No user.id in AuthContext → cannot fetch invitations");
      return;
    }

    console.log("My current user ID:", user.id);
    console.log("Looking for invitations in project:", 15);

    setInvitationsLoading(true);

    try {
      const res = await projectInvitationService.getInvitationsByProject(15, 1, 50);

      console.log("RAW response:", res);

      // ──────────────────────────────────────────────────────────────
      // Extract invitations - handles real array + array-like object
      // ──────────────────────────────────────────────────────────────
      let rawData = res?.data || res || [];

      // If rawData is array-like object { "0": {}, "1": {}, ... }
      if (!Array.isArray(rawData) && typeof rawData === "object") {
        const keys = Object.keys(rawData);
        if (keys.length > 0 && keys.every((k) => !isNaN(Number(k)))) {
          rawData = Object.values(rawData);
        }
      }

      const invitationList = Array.isArray(rawData)
        ? rawData
        : Object.values(rawData).filter((item) => item && typeof item === "object");

      console.log("Parsed invitation list:", invitationList);
      console.log("Total invitations found:", invitationList.length);

      const myPendingInvites = invitationList.filter((inv) => {
        if (!inv || typeof inv !== "object") return false;

        const isMyInvite = Number(inv.invitedUserId) === Number(user.id);
        const isPending = (inv.status || "").toLowerCase() === "pending";

        console.log(
          `Invitation #${inv.id || inv.inviteCode || "?"}: ` +
            `invitedUserId=${inv.invitedUserId || "?"}, status=${inv.status || "?"}, ` +
            `→ is mine? ${isMyInvite}, is pending? ${isPending}`
        );

        return isMyInvite && isPending;
      });

      console.log("My pending invitations:", myPendingInvites);
      console.log("Count:", myPendingInvites.length);

      setInvitations(myPendingInvites);
    } catch (err) {
      console.error("Failed to fetch invitations:", err);
      if (err?.response) {
        console.error("Status:", err.response.status);
        console.error("Data:", err.response.data);
      }
      setInvitations([]);
    } finally {
      setInvitationsLoading(false);
    }
  };

  // Fetch when modal opens
  useEffect(() => {
    if (showInvitations) {
      fetchMyInvitations();
    }
  }, [showInvitations]);

  // Handle accept / decline
  const handleRespond = async (inviteCode, accept) => {
    try {
      await projectInvitationService.respondToInvitation(inviteCode, accept);

      if (accept) {
        alert("You have successfully joined the project!");
        setShowInvitations(false); // auto-close modal after accept
        await checkUserMembership(); // refresh group status
      } else {
        alert("Invitation declined.");
      }

      // Refresh invitation list
      fetchMyInvitations();
    } catch (err) {
      console.error("Failed to respond to invitation:", err);
      alert("Action failed. Please try again.");
    }
  };

  // ─── Existing membership check ────────────────────────────────
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

      if (hasAny) {
        setUserCurrentProjectId(memberships[0].projectId);
      } else {
        setUserCurrentProjectId(null);
      }
    } catch (err) {
      console.warn("Cannot check user membership:", err);
      setHasJoinedAnyProject(false);
    }
  };

  // Load all projects + check membership
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const allRes = await projectApi.getAllProjects(1000, 1, "desc");
        let projectsData = [];
        if (allRes?.success && allRes?.data) {
          projectsData = Array.isArray(allRes.data)
            ? allRes.data
            : Object.values(allRes.data);
        } else if (Array.isArray(allRes)) {
          projectsData = allRes;
        }
        setAllProjects(projectsData);

        await checkUserMembership();
      } catch (err) {
        console.error("Error loading group data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  // Auto-redirect to /my-group if already joined and on LIST tab
  useEffect(() => {
    if (!loading && hasJoinedAnyProject && activeTab === TABS.LIST) {
      navigate("/student/group-management/my-group", { replace: true });
    }
  }, [loading, hasJoinedAnyProject, activeTab, navigate]);

  // Handle redirect after joining from join page
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

  // Memoized filtered projects
  const availableProjects = useMemo(() => {
    return allProjects.filter(
      (p) =>
        p.status === "Open" &&
        (!p.maxMembers || (p.currentMembers ?? 0) < p.maxMembers)
    );
  }, [allProjects]);

  const filteredProjects = useMemo(() => {
    let list = search
      ? availableProjects.filter((p) =>
          p.title?.toLowerCase().includes(search.toLowerCase())
        )
      : availableProjects;

    switch (sort) {
      case "points":
        return [...list].sort((a, b) => (b.totalPoints ?? 0) - (a.totalPoints ?? 0));
      case "members":
        return [...list].sort((a, b) => (b.maxMembers ?? 0) - (a.maxMembers ?? 0));
      default:
        return [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }, [availableProjects, search, sort]);

  if (loading) {
    return <div className="p-8 text-center">Loading group status...</div>;
  }

  if (hasJoinedAnyProject && activeTab === TABS.LIST) {
    navigate("/student/group-management/my-group", { replace: true });
    return null;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header with title + invitations bell */}
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

        {/* Invitations Button */}
        <button
          onClick={() => setShowInvitations(true)}
          className="relative p-3 text-gray-600 hover:text-blue-600 focus:outline-none transition-colors"
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
            title={
              hasJoinedAnyProject
                ? "You already joined a project. You can only choose one per semester."
                : ""
            }
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 relative ${
              activeTab === TABS.LIST
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500"
            } ${
              hasJoinedAnyProject
                ? "text-gray-400 cursor-not-allowed opacity-70"
                : "hover:text-gray-700"
            }`}
          >
            <List size={20} />
            Project List
            {hasJoinedAnyProject && (
              <span className="ml-2 text-xs text-red-500 font-semibold flex items-center gap-1">
                <Lock size={14} />
                Locked
              </span>
            )}
          </button>

          <button
            onClick={() =>
              hasJoinedAnyProject && navigate("/student/group-management/my-group")
            }
            disabled={!hasJoinedAnyProject}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === TABS.MY_GROUP
                ? "border-blue-600 text-blue-600"
                : hasJoinedAnyProject
                ? "border-transparent text-gray-500 hover:text-gray-700"
                : "text-gray-400 cursor-not-allowed opacity-70"
            }`}
          >
            <UserCheck size={20} />
            My Group
            {!hasJoinedAnyProject && <span className="ml-2 text-xs">(None)</span>}
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

      {/* ─── Project List Tab Content ─────────────────────────────── */}
      {activeTab === TABS.LIST && (
        <>
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
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

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredProjects.length === 0 ? (
              <div className="col-span-full text-center py-16 text-gray-500 text-xl">
                {search
                  ? "No matching projects found."
                  : "No open projects available."}
              </div>
            ) : (
              filteredProjects.map((project) => (
                <motion.div
                  key={project.id}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden"
                >
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                    <p className="text-gray-600 text-sm mb-6">
                      {project.description || "No description available."}
                    </p>

                    <div className="space-y-2 mb-6 text-sm">
                      <div className="flex gap-2">
                        <Users size={16} />
                        {project.currentMembers ?? 0} / {project.maxMembers ?? "?"} members
                      </div>
                      <div className="flex gap-2">
                        <TrendingUp size={16} />
                        {project.totalPoints ?? 0} points
                      </div>
                      <div className="flex gap-2">
                        <Calendar size={16} />
                        {new Date(project.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        navigate(`/student/group-management/${project.id}`)
                      }
                      className="w-full bg-blue-600 text-white py-3 rounded-xl flex justify-center gap-2 hover:bg-blue-700 transition"
                    >
                      <CheckCircle size={18} />
                      View & Join
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </>
      )}

      {/* My Group Tab Content */}
      {activeTab === TABS.MY_GROUP && (
        <div className="text-center py-16">
          <UserCheck size={64} className="mx-auto text-blue-500 mb-6" />
          <h2 className="text-2xl font-bold mb-4">My Current Group</h2>
          <p className="text-gray-600">
            You are currently in a project group.
          </p>
          <button
            onClick={() => navigate("/student/group-management/my-group")}
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          >
            View Group Details
          </button>
        </div>
      )}

      {/* History Tab Content */}
      {activeTab === TABS.HISTORY && (
        <div className="text-center py-16">
          <History size={64} className="mx-auto text-gray-300 mb-6" />
          <h2 className="text-2xl font-bold mb-4">Project History</h2>
          <p className="text-gray-500">
            Your past semester projects will appear here.
          </p>
        </div>
      )}

      {/* ─── Invitations Modal ──────────────────────────────────────── */}
      {showInvitations && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold">Project Invitations</h2>
              <button
                onClick={() => setShowInvitations(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X size={28} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {invitationsLoading ? (
                <div className="text-center py-12 text-gray-500">
                  Loading your invitations...
                </div>
              ) : invitations.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No pending project invitations at the moment.
                </div>
              ) : (
                <div className="space-y-5">
                  {invitations.map((inv) => (
                    <div
                      key={inv.id || inv.inviteCode}
                      className="border rounded-xl p-5 hover:border-blue-300 transition-all bg-gray-50"
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">
                            Project #{inv.projectId}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Invited on {new Date(inv.createdAt).toLocaleDateString()} •{" "}
                            Expires {new Date(inv.expiryAt).toLocaleString()}
                          </p>
                          {inv.message && (
                            <p className="mt-3 text-gray-700 italic border-l-4 border-gray-300 pl-3">
                              "{inv.message}"
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            Code: <strong>{inv.inviteCode}</strong>
                          </p>
                        </div>

                        <div className="flex gap-3 self-start sm:self-center mt-4 sm:mt-0">
                          <button
                            onClick={() => handleRespond(inv.inviteCode, true)}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleRespond(inv.inviteCode, false)}
                            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}