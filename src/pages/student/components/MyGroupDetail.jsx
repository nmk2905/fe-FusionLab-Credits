// src/pages/student/components/MyGroupDetail.jsx
import React, { useEffect, useState, useContext } from "react";
import { Users, Calendar, TrendingUp, ArrowLeft, LogOut } from "lucide-react";
import projectApi from "../../../services/apis/projectApi";
import projectMemberApi from "../../../services/apis/projectMemberApi";
import { AuthContext } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function MyGroupDetail({ projectId: propProjectId }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectId, setProjectId] = useState(propProjectId || null);

  // Fetch user's current project if no projectId passed (for /my-group route)
  useEffect(() => {
    if (projectId) return;

    const fetchMyProjectId = async () => {
      try {
        const myRes = await projectMemberApi.getMyProjects(user.id);
        if (myRes?.success && myRes?.data?.length > 0) {
          setProjectId(myRes.data[0].projectId);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to fetch my project", err);
        setLoading(false);
      }
    };

    if (user?.id) fetchMyProjectId();
  }, [user, projectId]);

  // Fetch project and members when projectId is known
  useEffect(() => {
    if (!projectId) return;

    const fetch = async () => {
      try {
        setLoading(true);
        const projRes = await projectApi.getProjectById(projectId);
        setProject(projRes.data || projRes);

        const memRes = await projectMemberApi.getProjectMembers({
          projectId,
          pageSize: 50,
        });

        let mems = [];
        if (memRes?.success && memRes?.data) {
          mems = Array.isArray(memRes.data)
            ? memRes.data
            : Object.values(memRes.data);
        } else if (Array.isArray(memRes)) {
          mems = memRes;
        }
        setMembers(mems);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [projectId]);

  const handleLeave = async () => {
    if (!window.confirm("Are you sure you want to leave this group?")) return;

    try {
      await projectMemberApi.leaveProject({
        userId: user.id,
        projectId,
      });
      alert("You have successfully left the group!");
      navigate("/student/group-management"); // Back to list
    } catch (err) {
      alert("Unable to leave the group. Please try again.");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading your group...</div>;
  if (!project) return <div className="p-8 text-center">You are not in any group or project not found.</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <button
        onClick={() => navigate("/student/group-management")}
        className="flex items-center gap-2 text-blue-600 hover:underline mb-6"
      >
        <ArrowLeft size={20} />
        Back to Group Management
      </button>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Group</h1>
          <span className="px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 mt-2 inline-block">
            Joined
          </span>
        </div>
        <button
          onClick={handleLeave}
          className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium"
        >
          <LogOut size={20} />
          Leave Group
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold mb-4">{project.title}</h2>
        <p className="text-gray-700 text-lg mb-8">
          {project.description || "No description available."}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-center gap-4">
            <Users className="text-blue-600" size={28} />
            <div>
              <p className="text-sm text-gray-600">Members</p>
              <p className="font-bold text-2xl">
                {members.length} / {project.maxMembers || "?"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <TrendingUp className="text-green-600" size={28} />
            <div>
              <p className="text-sm text-gray-600">Total Points</p>
              <p className="font-bold text-2xl">{project.totalPoints || 0}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Calendar className="text-purple-600" size={28} />
            <div>
              <p className="text-sm text-gray-600">Created</p>
              <p className="font-bold text-xl">
                {new Date(project.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6">
          Group Members ({members.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {members.map((member) => (
            <div
              key={member.id || member.userId}
              className={`p-5 rounded-lg border ${
                member.userId === user?.id
                  ? "bg-blue-50 border-blue-300"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-lg">
                    User ID: {member.userId}
                  </p>
                  <p className="text-sm text-gray-600 capitalize">
                    Role: {member.role || "member"}
                    {member.role === "leader" && (
                      <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        Leader
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Joined: {new Date(member.joinAt || member.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {member.userId === user?.id && (
                  <span className="text-blue-600 font-medium">You</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}