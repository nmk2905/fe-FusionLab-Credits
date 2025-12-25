// src/pages/student/components/GroupManagement.jsx
import React, { useEffect, useMemo, useState, useContext } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Calendar,
  TrendingUp,
  CheckCircle,
  Search,
  LogOut,
  History,
  List,
  UserCheck,
} from "lucide-react";
import projectApi from "../../../services/apis/projectApi";
import projectMemberApi from "../../../services/apis/projectMemberApi";
import { AuthContext } from "../../../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import MyGroupDetail from "./MyGroupDetail";

const TABS = {
  LIST: "list",
  MY_GROUP: "my-group",
  HISTORY: "history",
};

export default function GroupManagement() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState(TABS.LIST);
  const [allProjects, setAllProjects] = useState([]);
  const [myProjectId, setMyProjectId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");

  // Auto-switch to "My Group" after joining (from ProjectDetail)
  useEffect(() => {
    if (location.state?.fromJoin && myProjectId) {
      setActiveTab(TABS.MY_GROUP);
      // Clear state to avoid looping
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, myProjectId, navigate]);

  // Fetch data on mount or when user changes
  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // 1. Fetch all projects
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

        // 2. Check if user already joined a project
        try {
          const myRes = await projectMemberApi.getMyProjects(user.id);
          if (myRes?.success && myRes?.data && myRes.data.length > 0) {
            const projectId = myRes.data[0].projectId;
            setMyProjectId(projectId);

            // IMPORTANT: Auto open "My Group" tab if user already has a group
            setActiveTab(TABS.MY_GROUP);
          } else {
            // No group → default to list
            setActiveTab(TABS.LIST);
          }
        } catch (err) {
          console.log("User has no joined project");
          setActiveTab(TABS.LIST);
        }
      } catch (err) {
        console.error("Error loading group data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleLeaveGroup = async () => {
    if (!window.confirm("Bạn có chắc muốn rời nhóm này không?")) return;

    try {
      await projectMemberApi.leaveProject(user.id, myProjectId);
      setMyProjectId(null);
      setActiveTab(TABS.LIST);
      alert("Đã rời nhóm thành công!");
    } catch (err) {
      alert("Không thể rời nhóm. Vui lòng thử lại.");
    }
  };

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
        return [...list].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
    }
  }, [availableProjects, search, sort]);

  if (loading) {
    return <div className="p-8 text-center">Đang tải...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab(TABS.LIST)}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === TABS.LIST
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <List size={20} />
            Danh sách dự án
          </button>

          {/* "Nhóm của tôi" tab - always clickable */}
          <button
            onClick={() => setActiveTab(TABS.MY_GROUP)}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === TABS.MY_GROUP
                ? "border-blue-600 text-blue-600"
                : myProjectId
                ? "border-transparent text-gray-700 hover:text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <UserCheck size={20} />
            Nhóm của tôi
          </button>

          <button
            onClick={() => setActiveTab(TABS.HISTORY)}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === TABS.HISTORY
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <History size={20} />
            Lịch sử dự án
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === TABS.LIST && (
        <div>
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Chọn Dự Án Của Bạn</h1>
            <p className="text-gray-600">
              Mỗi học kỳ bạn chỉ được tham gia một dự án.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm dự án..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-5 py-3 border border-gray-300 rounded-lg bg-white"
            >
              <option value="newest">Mới nhất</option>
              <option value="points">Điểm cao nhất</option>
              <option value="members">Số thành viên tối đa</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredProjects.length === 0 ? (
              <div className="col-span-full text-center py-16 text-xl text-gray-500">
                {search
                  ? "Không tìm thấy dự án phù hợp."
                  : "Hiện chưa có dự án nào mở để tham gia."}
              </div>
            ) : (
              filteredProjects.map((project) => (
                <motion.div
                  key={project.id}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold line-clamp-2">
                        {project.title}
                      </h3>
                      <span className="ml-3 px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Open
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-6 line-clamp-3">
                      {project.description || "Chưa có mô tả."}
                    </p>

                    <div className="space-y-3 mb-8">
                      <div className="flex items-center gap-3 text-gray-700">
                        <Users size={18} />
                        <span className="text-sm">
                          {project.currentMembers ?? 0} / {project.maxMembers ?? "?"} thành viên
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <TrendingUp size={18} />
                        <span className="text-sm font-medium">
                          {project.totalPoints ?? 0} điểm
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <Calendar size={18} />
                        <span className="text-sm">
                          {new Date(project.createdAt).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        navigate(`/student/group-management/${project.id}`)
                      }
                      className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={20} />
                      Xem chi tiết & tham gia
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      )}

      {/* My Group Tab - Show detail if joined */}
      {activeTab === TABS.MY_GROUP && myProjectId && (
        <MyGroupDetail projectId={myProjectId} onLeave={handleLeaveGroup} />
      )}

      {/* My Group Tab - Empty state if not joined */}
      {activeTab === TABS.MY_GROUP && !myProjectId && (
        <div className="text-center py-16">
          <UserCheck size={80} className="mx-auto text-gray-300 mb-6" />
          <h2 className="text-2xl font-bold mb-4">Bạn chưa có nhóm</h2>
          <p className="text-xl text-gray-500 mb-8">
            Bạn chưa tham gia bất kỳ dự án nào trong học kỳ này.
          </p>
          <button
            onClick={() => setActiveTab(TABS.LIST)}
            className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition"
          >
            Chọn dự án ngay
          </button>
        </div>
      )}

      {/* History Tab */}
      {activeTab === TABS.HISTORY && (
        <div className="text-center py-16">
          <History size={64} className="mx-auto text-gray-300 mb-6" />
          <h2 className="text-2xl font-bold mb-4">Lịch sử dự án</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Tính năng này sẽ hiển thị các dự án bạn đã tham gia trong các học kỳ trước.
            <br />
            Hiện tại chưa có dữ liệu lịch sử.
          </p>
        </div>
      )}
    </div>
  );
}