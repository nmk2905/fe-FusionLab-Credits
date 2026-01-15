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
} from "lucide-react";
import projectApi from "../../../services/apis/projectApi";
import projectMemberApi from "../../../services/apis/projectMemberApi";
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

  // Determine active tab from URL
  const currentPath = location.pathname;
  const activeTab = currentPath.includes("/my-group")
    ? TABS.MY_GROUP
    : currentPath.includes("/history")
    ? TABS.HISTORY
    : TABS.LIST;

  // Function to check if user has joined any project
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
        // Fetch all projects
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

        // Check user membership
        await checkUserMembership();
      } catch (err) {
        console.error("Error loading group data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  // Auto-redirect to /my-group if user has already joined a project
  // and is trying to view the LIST tab
  useEffect(() => {
    if (!loading && hasJoinedAnyProject && activeTab === TABS.LIST) {
      navigate("/student/group-management/my-group", { replace: true });
    }
  }, [loading, hasJoinedAnyProject, activeTab, navigate]);

  // Handle auto-redirect after just joining a project (from join page)
  useEffect(() => {
    if (location.state?.fromJoin) {
      checkUserMembership().then(() => {
        if (hasJoinedAnyProject) {
          navigate("/student/group-management/my-group", { replace: true });
        }
        // Clear navigation state to prevent repeated redirect
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

  // Early return + redirect (extra safety layer)
  if (hasJoinedAnyProject && activeTab === TABS.LIST) {
    navigate("/student/group-management/my-group", { replace: true });
    return null;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {/* Project List Tab */}
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

          {/* My Group Tab */}
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

          {/* History Tab */}
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

      {/* Project List Tab Content */}
      {activeTab === TABS.LIST && (
        <>
          <h1 className="text-3xl font-bold mb-2">Choose Your Project</h1>
          <p className="text-gray-600 mb-8">
            You can only join one project per semester.
          </p>

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
    </div>
  );
}