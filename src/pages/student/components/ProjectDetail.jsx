import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Users, Calendar, TrendingUp, ArrowLeft, LogOut } from "lucide-react";
import projectService from "../../../services/apis/projectApi";
import projectMemberService from "../../../services/apis/projectMemberApi";
import { AuthContext } from "../../../contexts/AuthContext";

export default function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [hasJoinedAnyProject, setHasJoinedAnyProject] = useState(false);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState("");

  const currentMember = members.find((m) => m.userId === user?.id);
  const isUserMember = !!currentMember;
  const isFull = project && members.length >= (project.maxMembers || Infinity);

  // Check if user already joined ANY project (using existing API)
  useEffect(() => {
    const checkUserMembership = async () => {
      if (!user?.id) return;

      try {
        const res = await projectMemberService.getProjectMembers({
          userId: user.id,
          pageSize: 10,     // We just need to know if there's at least 1
          pageIndex: 1,
        });

        let userProjects = [];

        if (res?.success && res?.data) {
          userProjects = Array.isArray(res.data)
            ? res.data
            : res.data?.items || Object.values(res.data) || [];
        } else if (Array.isArray(res?.data)) {
          userProjects = res.data;
        }

        setHasJoinedAnyProject(userProjects.length > 0);
      } catch (err) {
        console.error("Cannot check if user already joined any project:", err);
        setHasJoinedAnyProject(false); // fail-safe: allow join attempt
      }
    };

    checkUserMembership();
  }, [user?.id]);

  // Load current project details + members
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const projectRes = await projectService.getProjectById(projectId);
        setProject(projectRes.data || projectRes);

        const membersRes = await projectMemberService.getProjectMembers({
          projectId: Number(projectId),
          pageSize: 50,
        });

        let membersData = [];
        if (membersRes?.success && membersRes?.data) {
          membersData = Array.isArray(membersRes.data)
            ? membersRes.data
            : Object.values(membersRes.data);
        } else if (Array.isArray(membersRes?.data)) {
          membersData = membersRes.data;
        } else if (Array.isArray(membersRes)) {
          membersData = membersRes;
        }

        setMembers(membersData);
      } catch (err) {
        console.error("Error fetching project data:", err);
        setError("Unable to load project information. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (projectId) fetchData();
  }, [projectId]);

  const handleJoinProject = async () => {
    if (!user) {
      alert("Please log in to join the project.");
      return;
    }

    // Prevent joining if already in another project
    if (hasJoinedAnyProject && !isUserMember) {
      alert(
        "You have already joined a project.\n\n" +
        "You can only choose ONE project per semester."
      );
      return;
    }

    if (isUserMember) {
      alert("You are already a member of this project.");
      return;
    }

    if (isFull) {
      alert("The project is already full.");
      return;
    }

    setJoining(true);

    try {
      const joinRes = await projectMemberApi.joinProject({
        role: "User",
        userId: user.id,
        projectId: Number(projectId),
      });

      // Only treat as success when API returns success flag
      if (joinRes?.success) {
        alert("Successfully joined the project as Member!");

        // Refresh member list
        const membersRes = await projectMemberService.getProjectMembers({
          projectId: Number(projectId),
          pageSize: 50,
        });

        let updatedMembers = [];
        if (membersRes?.success && membersRes?.data) {
          updatedMembers = Array.isArray(membersRes.data)
            ? membersRes.data
            : Object.values(membersRes.data);
        } else if (Array.isArray(membersRes?.data)) {
          updatedMembers = membersRes.data;
        }

        setMembers(updatedMembers);
        setHasJoinedAnyProject(true);

        navigate("/student/group-management", { state: { fromJoin: true } });
      } else {
        throw new Error("Join request did not return success");
      }
    } catch (err) {
      console.error("Join project error:", err);

      let message = "Unable to join the project. Please try again.";

      // Try to show better message from backend
      if (err.response?.data?.message) {
        const backendMsg = err.response.data.message.toLowerCase();
        if (
          backendMsg.includes("already") ||
          backendMsg.includes("one project") ||
          backendMsg.includes("only one")
        ) {
          message =
            "You have already joined a project.\n" +
            "You can only choose ONE project per semester.";
        } else {
          message = err.response.data.message;
        }
      }

      alert(message);
    } finally {
      setJoining(false);
    }
  };

  const handleLeaveProject = async () => {
    if (!user) return;

    const confirmLeave = window.confirm(
      "Are you sure you want to leave this project?"
    );
    if (!confirmLeave) return;

    setLeaving(true);
    try {
      await projectMemberApi.leaveProject({
        userId: user.id,
        projectId: Number(projectId),
      });

      alert("You have successfully left the project.");

      setMembers(members.filter((m) => m.userId !== user.id));
      setHasJoinedAnyProject(false);

      navigate("/student/group-management");
    } catch (err) {
      console.error("Leave project error:", err);
      alert("Failed to leave the project. Please try again.");
    } finally {
      setLeaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading project details...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!project) return <div className="p-8 text-center">Project not found.</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-blue-600 hover:underline mb-6"
      >
        <ArrowLeft size={20} />
        Back to list
      </button>

      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                project.status === "Open"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {project.status || "Unknown"}
            </span>
          </div>
        </div>

        <p className="text-gray-700 text-lg mb-8">{project.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="flex items-center gap-4">
            <Users className="text-blue-600" size={24} />
            <div>
              <p className="text-sm text-gray-600">Members</p>
              <p className="font-bold text-xl">
                {members.length} / {project.maxMembers || "?"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <TrendingUp className="text-green-600" size={24} />
            <div>
              <p className="text-sm text-gray-600">Project Points</p>
              <p className="font-bold text-xl">{project.totalPoints || 0}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Calendar className="text-purple-600" size={24} />
            <div>
              <p className="text-sm text-gray-600">Created Date</p>
              <p className="font-bold">
                {new Date(project.createdAt).toLocaleDateString("en-US")}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-6 flex-wrap items-end">
          {/* Join section */}
          {!isUserMember && (
            <>
              {hasJoinedAnyProject ? (
                <div className="px-8 py-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 text-lg font-medium">
                  You have already joined a project.<br />
                  You can only choose <strong>ONE project per semester</strong>.
                </div>
              ) : (
                <button
                  onClick={handleJoinProject}
                  disabled={joining || isFull || !user}
                  className={`px-8 py-4 font-bold text-lg rounded-xl transition ${
                    joining || isFull || !user
                      ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {joining
                    ? "Joining..."
                    : isFull
                    ? "Group is Full"
                    : !user
                    ? "Log in to Join"
                    : "Join This Project"}
                </button>
              )}
            </>
          )}

          {/* Leave button */}
          {isUserMember && (
            <button
              onClick={handleLeaveProject}
              disabled={leaving}
              className={`flex items-center gap-2 px-8 py-4 font-bold text-lg rounded-xl transition ${
                leaving
                  ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
            >
              <LogOut size={20} />
              {leaving ? "Leaving..." : "Leave Project"}
            </button>
          )}

          {/* Already member status */}
          {isUserMember && !leaving && (
            <div className="flex items-center px-8 py-4 text-lg font-medium text-green-700">
              ✓ You are a member of this project (Member)
            </div>
          )}
        </div>
      </div>

      {/* Members List */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6">
          Current Members ({members.length})
        </h2>

        {members.length === 0 ? (
          <p className="text-gray-500">No members have joined yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {members.map((member) => (
              <div
                key={member.id || member.userId}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  member.userId === user?.id
                    ? "bg-blue-50 border border-blue-300"
                    : "bg-gray-50"
                }`}
              >
                <div>
                  <p className="font-medium">
                    User ID: {member.userId} ({member.role || "User"})
                  </p>
                  <p className="text-sm text-gray-600">
                    Joined:{" "}
                    {new Date(member.joinAt || member.createdAt).toLocaleDateString("en-US")}
                  </p>
                </div>
                {member.userId === user?.id && (
                  <span className="text-sm text-blue-600 font-medium">You</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}