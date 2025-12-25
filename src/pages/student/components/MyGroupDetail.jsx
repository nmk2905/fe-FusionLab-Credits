// src/pages/student/components/MyGroupDetail.jsx
import React, { useEffect, useState, useContext } from "react";
import { Users, Calendar, TrendingUp, ArrowLeft, LogOut } from "lucide-react";
import projectService from "../../../services/apis/projectApi";
import projectMemberApi from "../../../services/apis/projectMemberApi";
import { AuthContext } from "../../../contexts/AuthContext";

export default function MyGroupDetail({ projectId, onLeave }) {
  const { user } = useContext(AuthContext);
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const projRes = await projectService.getProjectById(projectId);
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

  if (loading) return <div className="p-8 text-center">Đang tải nhóm của bạn...</div>;
  if (!project) return <div className="p-8 text-center">Không tìm thấy dự án.</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Nhóm của bạn</h1>
        <button
          onClick={onLeave}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          <LogOut size={20} />
          Rời nhóm
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">{project.title}</h2>
          <span className="px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800">
            Đã tham gia
          </span>
        </div>

        <p className="text-gray-700 text-lg mb-8">{project.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="flex items-center gap-4">
            <Users className="text-blue-600" size={24} />
            <div>
              <p className="text-sm text-gray-600">Thành viên</p>
              <p className="font-bold text-xl">
                {members.length} / {project.maxMembers || "?"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <TrendingUp className="text-green-600" size={24} />
            <div>
              <p className="text-sm text-gray-600">Điểm dự án</p>
              <p className="font-bold text-xl">{project.totalPoints || 0}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Calendar className="text-purple-600" size={24} />
            <div>
              <p className="text-sm text-gray-600">Ngày tạo</p>
              <p className="font-bold">
                {new Date(project.createdAt).toLocaleDateString("vi-VN")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6">
          Thành viên nhóm ({members.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {members.map((member) => (
            <div
              key={member.id || member.userId}
              className={`p-4 rounded-lg ${
                member.userId === user?.id
                  ? "bg-blue-50 border border-blue-300"
                  : "bg-gray-50"
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">
                    User ID: {member.userId} ({member.role || "member"})
                  </p>
                  <p className="text-sm text-gray-600">
                    Tham gia: {new Date(member.joinAt || member.createdAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                {member.userId === user?.id && (
                  <span className="text-sm text-blue-600 font-medium">Bạn</span>
                )}
                {member.role === "leader" && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded ml-2">
                    Leader
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}