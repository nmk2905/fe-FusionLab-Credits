// src/pages/student/components/MyGroupDetail.jsx
import React, { useEffect, useState, useContext } from "react";
import {
  Users,
  Calendar,
  TrendingUp,
  ArrowLeft,
  LogOut,
  ChevronRight,
} from "lucide-react";
import projectApi from "../../../services/apis/projectApi";
import projectMemberApi from "../../../services/apis/projectMemberApi";
import { AuthContext } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function MyGroupDetail({ projectId: propProjectId }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]); // Thay đổi: mảng projects thay vì 1 project
  const [selectedProject, setSelectedProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState(
    propProjectId || null
  );
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Fetch all projects that user has joined
  useEffect(() => {
    const fetchUserProjects = async () => {
      try {
        setLoadingProjects(true);
        const myRes = await projectMemberApi.getProjectMembers({
          userId: user.id,
        });
        console.log("User's project members response:", myRes);

        if (myRes?.success && myRes?.rawResponse.data?.length > 0) {
          // Lấy tất cả projectId từ response
          const projectIds = myRes.rawResponse.data.map((item) => {
            console.log("Item:", item); // Debug thêm
            return item.projectId; // item.projectId có tồn tại
          });
          console.log("User projectIds:", projectIds);

          // Fetch thông tin chi tiết cho từng project
          const projectPromises = projectIds.map((projectId) =>
            projectApi.getProjectById(projectId)
          );

          const projectResults = await Promise.all(projectPromises);
          console.log("projectResults:", projectResults); // Debug

          // Xử lý kết quả
          const projectsData = projectResults.map((result, index) => {
            const projectId = projectIds[index];
            console.log(`Project ${projectId} result:`, result); // Debug

            // Kiểm tra cấu trúc response của projectApi.getProjectById
            const projectData = result?.data || result || {};

            return {
              ...projectData,
              id: projectId,
              memberInfo: myRes.rawResponse.data.find(
                (item) => item.projectId === projectId
              ),
            };
          });
          console.log("abc: ", projectsData);

          setProjects(projectsData);

          // Nếu có propProjectId, chọn project đó
          if (propProjectId) {
            const foundProject = projectsData.find(
              (p) => p.id === propProjectId
            );
            if (foundProject) {
              setSelectedProject(foundProject);
              setSelectedProjectId(propProjectId);
            } else if (projectsData.length > 0) {
              // Nếu không tìm thấy project từ propProjectId, chọn project đầu tiên
              setSelectedProject(projectsData[0]);
              setSelectedProjectId(projectsData[0].id);
            }
          } else if (projectsData.length > 0) {
            // Nếu không có propProjectId, chọn project đầu tiên
            setSelectedProject(projectsData[0]);
            setSelectedProjectId(projectsData[0].id);
          }
        } else {
          setProjects([]);
        }
      } catch (err) {
        console.error("Failed to fetch user's projects", err);
        setProjects([]);
      } finally {
        setLoadingProjects(false);
      }
    };

    if (user?.id) {
      fetchUserProjects();
    }
  }, [user, propProjectId]);

  // Fetch members for selected project
  useEffect(() => {
    if (!selectedProjectId) return;

    const fetchMembers = async () => {
      try {
        const memRes = await projectMemberApi.getProjectMembers({
          projectId: selectedProjectId,
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
        console.error("Error fetching members:", err);
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [selectedProjectId]);

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    setSelectedProjectId(project.id);
    setLoading(true); // Reset loading để fetch members mới
  };

  const handleLeave = async () => {
    if (!window.confirm("Are you sure you want to leave this group?")) return;

    try {
      await projectMemberApi.leaveProject({
        userId: user.id,
        projectId: selectedProjectId,
      });
      alert("You have successfully left the group!");

      // Cập nhật danh sách projects sau khi rời nhóm
      const updatedProjects = projects.filter(
        (p) => p.id !== selectedProjectId
      );
      setProjects(updatedProjects);

      if (updatedProjects.length > 0) {
        // Chọn project khác nếu còn
        setSelectedProject(updatedProjects[0]);
        setSelectedProjectId(updatedProjects[0].id);
      } else {
        // Nếu không còn project nào
        setSelectedProject(null);
        setSelectedProjectId(null);
      }
    } catch (err) {
      alert("Unable to leave the group. Please try again.");
    }
  };

  if (loadingProjects) {
    return <div className="p-8 text-center">Loading your projects...</div>;
  }

  if (projects.length === 0) {
    return (
      <div className="p-8 text-center">
        <button
          onClick={() => navigate("/student/group-management")}
          className="flex items-center gap-2 text-blue-600 hover:underline mb-6"
        >
          <ArrowLeft size={20} />
          Back to Group Management
        </button>
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <h2 className="text-2xl font-bold mb-4">No Groups Found</h2>
          <p className="text-gray-600 mb-6">
            You are not a member of any project group yet.
          </p>
          <button
            onClick={() => navigate("/student/group-management")}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          >
            Browse Available Groups
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <button
        onClick={() => navigate("/student/group-management")}
        className="flex items-center gap-2 text-blue-600 hover:underline mb-6"
      >
        <ArrowLeft size={20} />
        Back to Group Management
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar - List of projects */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">
              Your Projects ({projects.length})
            </h2>
            <div className="space-y-3">
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
                          proj.memberInfo?.joinAt || proj.memberInfo?.createdAt
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
          </div>
        </div>

        {/* Main content - Selected project details */}
        <div className="lg:col-span-2">
          {selectedProject ? (
            <>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-3xl font-bold">
                    {selectedProject.title}
                  </h1>
                  <span className="px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 mt-2 inline-block">
                    {selectedProject.memberInfo?.role === "leader"
                      ? "Leader"
                      : "Member"}
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
                <h2 className="text-2xl font-bold mb-4">Project Details</h2>
                <p className="text-gray-700 text-lg mb-8">
                  {selectedProject.description || "No description available."}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="flex items-center gap-4">
                    <Users className="text-blue-600" size={28} />
                    <div>
                      <p className="text-sm text-gray-600">Members</p>
                      <p className="font-bold text-2xl">
                        {members.length} / {selectedProject.maxMembers || "?"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <TrendingUp className="text-green-600" size={28} />
                    <div>
                      <p className="text-sm text-gray-600">Total Points</p>
                      <p className="font-bold text-2xl">
                        {selectedProject.totalPoints || 0}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Calendar className="text-purple-600" size={28} />
                    <div>
                      <p className="text-sm text-gray-600">Created</p>
                      <p className="font-bold text-xl">
                        {new Date(
                          selectedProject.createdAt
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-6">
                  Group Members ({members.length})
                </h2>
                {loading ? (
                  <div className="text-center py-8">Loading members...</div>
                ) : (
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
                              Joined:{" "}
                              {new Date(
                                member.joinAt || member.createdAt
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          {member.userId === user?.id && (
                            <span className="text-blue-600 font-medium">
                              You
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <p className="text-gray-600">Select a project to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
