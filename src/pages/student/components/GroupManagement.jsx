import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Calendar,
  TrendingUp,
  CheckCircle,
  Search,
} from "lucide-react";
import projectApi from "../../../services/apis/projectApi"; // Adjust path if needed

export default function GroupManagement() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);

        const response = await projectApi.getAllProjects(1000, 1, "desc");

        console.log("API Response:", response);

        // === FIX CHÍNH: Xử lý đúng cấu trúc response của bạn ===
        let projectsData = [];

        if (response?.success && response?.data) {
          // data là object {0: {...}, 1: {...}} → chuyển thành array
          projectsData = Object.values(response.data);
        } else if (Array.isArray(response?.data)) {
          projectsData = response.data;
        } else if (Array.isArray(response)) {
          projectsData = response;
        }

        setProjects(projectsData);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError("Không thể tải danh sách dự án. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    const list = Array.isArray(projects) ? projects : [];

    // Tìm kiếm theo title
    let filtered = search.trim()
      ? list.filter((project) =>
          project.title?.toLowerCase().includes(search.toLowerCase())
        )
      : list;

    // Sắp xếp
    switch (sort) {
      case "points":
        return [...filtered].sort((a, b) => (b.totalPoints ?? 0) - (a.totalPoints ?? 0));
      case "members":
        return [...filtered].sort((a, b) => (b.maxMembers ?? 0) - (a.maxMembers ?? 0));
      default: // newest
        return [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }, [projects, search, sort]);

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p className="text-lg font-medium">Đang tải danh sách dự án...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        <p className="text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Choose Your Project</h1>
        <p className="text-gray-600">
          Select a project you want to join this semester
        </p>
      </div>

      {/* Search & Sort */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm dự án theo tên..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-5 py-3 border border-gray-300 rounded-lg bg-white font-medium"
        >
          <option value="newest">Mới nhất</option>
          <option value="points">Điểm cao nhất</option>
          <option value="members">Số thành viên tối đa</option>
        </select>
      </div>

      {/* Project List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <p className="text-xl text-gray-500">
              {search ? "Không tìm thấy dự án nào phù hợp với từ khóa." : "Hiện tại chưa có dự án nào."}
            </p>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <motion.div
              key={project.id}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
            >
              <div className="p-6">
                {/* Title & Status */}
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-900 line-clamp-2">
                    {project.title || "Không có tiêu đề"}
                  </h3>
                  <span
                    className={`ml-3 px-3 py-1 text-xs font-semibold rounded-full ${
                      project.status === "Open"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {project.status || "Unknown"}
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-6 line-clamp-3">
                  {project.description || "Chưa có mô tả cho dự án này."}
                </p>

                {/* Info Rows */}
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
                      {project.createdAt
                        ? new Date(project.createdAt).toLocaleDateString("vi-VN")
                        : "Không rõ"}
                    </span>
                  </div>
                </div>

                {/* Select Button */}
                <button className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 active:bg-blue-800 transition flex items-center justify-center gap-2">
                  <CheckCircle size={20} />
                  Chọn Dự Án Này
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}