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
  const [myProjectId, setMyProjectId] = useState(null);
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

  // Auto switch after joining (from ProjectDetail)
  useEffect(() => {
    if (location.state?.fromJoin && user?.id) {
      const refetchMyProject = async () => {
        try {
          setLoading(true);
          // Use existing getProjectMembers with userId filter
          const myRes = await projectMemberApi.getProjectMembers({
            userId: user.id,
            pageSize: 50, // Get enough to be safe
          });

          let memberships = [];
          if (myRes?.success && myRes?.data) {
            memberships = Array.isArray(myRes.data)
              ? myRes.data
              : Object.values(myRes.data);
          } else if (Array.isArray(myRes)) {
            memberships = myRes;
          }

          if (memberships.length > 0) {
            setMyProjectId(memberships[0].projectId);
            navigate("/student/group-management/my-group", { replace: true });
          }
        } catch (err) {
          console.error("Failed to refetch my project after join", err);
        } finally {
          setLoading(false);
          // Clear navigation state
          navigate(location.pathname, { replace: true, state: {} });
        }
      };

      refetchMyProject();
    }
  }, [location.state?.fromJoin, user, navigate]);

  // Fetch all projects + detect user's current project
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch all projects
        const allRes = await projectApi.getAllProjects(1000, 1, "desc");
        let projectsData = [];
        if (allRes?.success && allRes?.data) {
          projectsData = Object.values(allRes.data);
        } else if (Array.isArray(allRes?.data)) {
          projectsData = allRes.data;
        } else if (Array.isArray(allRes)) {
          projectsData = allRes;
        }
        setAllProjects(projectsData);

        // Find user's current project using getProjectMembers with userId filter
        try {
          const myRes = await projectMemberApi.getProjectMembers({
            userId: user.id,
            pageSize: 50,
          });

          let memberships = [];
          if (myRes?.success && myRes?.data) {
            memberships = Array.isArray(myRes.data)
              ? myRes.data
              : Object.values(myRes.data);
          } else if (Array.isArray(myRes)) {
            memberships = myRes;
          }

          if (memberships.length > 0) {
            setMyProjectId(memberships[0].projectId);
          } else {
            setMyProjectId(null);
          }
        } catch (err) {
          console.warn("Could not fetch user membership:", err);
          setMyProjectId(null);
        }
      } catch (err) {
        console.error("Error loading group data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Rest of your code remains exactly the same...
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
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => !myProjectId && navigate("/student/group-management")}
            disabled={!!myProjectId}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === TABS.LIST
                ? "border-blue-600 text-blue-600"
                : myProjectId
                ? "border-transparent text-gray-400 cursor-not-allowed"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <List size={20} />
            Project List
            {myProjectId && <span className="ml-2 text-xs">(Locked)</span>}
          </button>

          <button
            onClick={() => navigate("/student/group-management/my-group")}
            disabled={!myProjectId}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === TABS.MY_GROUP
                ? "border-blue-600 text-blue-600"
                : myProjectId
                ? "border-transparent text-gray-500 hover:text-gray-700"
                : "border-transparent text-gray-400 cursor-not-allowed"
            }`}
          >
            <UserCheck size={20} />
            My Group
            {!myProjectId && <span className="ml-2 text-xs">(None)</span>}
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

      {/* LIST TAB CONTENT */}
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
                className="w-full pl-10 pr-4 py-3 border rounded-lg"
              />
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-5 py-3 border rounded-lg"
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
                      className="w-full bg-blue-600 text-white py-3 rounded-xl flex justify-center gap-2"
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