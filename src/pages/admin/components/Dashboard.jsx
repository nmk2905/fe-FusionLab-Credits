import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  FolderPlus,
  Clock,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import dashboardService from "../../../services/apis/dashboardApi";
import semesterService from "../../../services/apis/semesterApi";

const COLORS = ["#6366f1", "#3b82f6", "#eab308", "#22c55e", "#a855f7"];

export default function Dashboard() {
  const [semesters, setSemesters] = useState([]);
  const [currentSemester, setCurrentSemester] = useState(null);
  const [stats, setStats] = useState({
    projectStats: { total: 0, open: 0, inProcess: 0, close: 0, complete: 0 },
    userStats: { totalUsers: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);

  const FALLBACK_SEMESTER_ID = 9;

  const fetchSemesters = async () => {
    try {
      const response = await semesterService.getCurrentSemester(10, 1, "");
      console.log("[SEMESTER] Full response:", response);

      let payload = response?.data ?? null;

      if (
        payload &&
        typeof payload === "object" &&
        payload.success === true &&
        "data" in payload
      ) {
        payload = payload.data;
        console.log("[DEBUG] Payload after unwrapping success/data:", payload);
      }

      let fetchedSemesters = [];

      if (
        payload &&
        typeof payload === "object" &&
        "length" in payload &&
        typeof payload.length === "number" &&
        payload.length > 0
      ) {
        fetchedSemesters = Array.from(payload);
        console.log("[DEBUG] Detected array-like structure, length:", fetchedSemesters.length);
      }

      if (fetchedSemesters.length === 0 && payload && typeof payload === "object") {
        fetchedSemesters = Object.values(payload).filter(
          (value) => typeof value === "object" && "id" in value
        );
        console.log("[DEBUG] Detected numeric-key object, extracted length:", fetchedSemesters.length);
      }

      if (fetchedSemesters.length === 0 && payload && typeof payload === "object") {
        const possibleArray =
          payload.data ||
          payload.items ||
          payload.content ||
          payload.semesters ||
          payload.list ||
          payload.results ||
          payload;

        if (
          possibleArray &&
          typeof possibleArray === "object" &&
          "length" in possibleArray &&
          typeof possibleArray.length === "number" &&
          possibleArray.length > 0
        ) {
          fetchedSemesters = Array.from(possibleArray);
        } else if (payload.id) {
          fetchedSemesters = [payload];
        }
      }

      console.log("[SEMESTER] Final semesters array:", fetchedSemesters);

      if (fetchedSemesters.length === 0) {
        throw new Error("No valid semesters found after all parsing attempts");
      }

      setSemesters(fetchedSemesters);

      const preferred = fetchedSemesters.find(
        (s) =>
          s.status?.toLowerCase() === "active" ||
          s.isActive === true ||
          s.isCurrent === true
      );

      const newest = [...fetchedSemesters].sort((a, b) => b.id - a.id)[0];

      const selected = preferred || newest;

      console.log("[SEMESTER] Selected semester:", selected);

      setCurrentSemester(selected);
      setUsingFallback(false);
    } catch (err) {
      console.error("[SEMESTER] Failed:", err.message);
      setSemesters([]);
      setCurrentSemester(null);
    }
  };

  const loadDashboardData = async (semesterId) => {
    if (!semesterId) {
      setLoading(false);
      setError("Không có học kỳ để tải dữ liệu");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const overview = await dashboardService.getDashboardOverview(semesterId);
      console.log("[DASHBOARD] Raw overview:", overview);

      // Unwrap if wrapped
      let projectStats = overview?.projectStats || {};
      if (projectStats.success === true && "data" in projectStats) {
        projectStats = projectStats.data;
      }

      let userStats = overview?.userStats || {};
      if (userStats.success === true && "data" in userStats) {
        userStats = userStats.data;
      }

      setStats({
        projectStats: {
          total: projectStats.total ?? 0,
          open: projectStats.open ?? 0,
          inProcess: projectStats.inProcess ?? 0,
          close: projectStats.close ?? 0,
          complete: projectStats.complete ?? 0,
        },
        userStats: {
          totalUsers: userStats.totalMembers ?? userStats.totalUsers ?? 0, // Handle totalMembers from log
        },
      });
    } catch (err) {
      console.error("[DASHBOARD] Failed:", err);
      setError(`Không tải được dữ liệu cho học kỳ ${semesterId}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSemesters();
  }, []);

  useEffect(() => {
    if (currentSemester?.id) {
      loadDashboardData(currentSemester.id);
      setUsingFallback(false);
    } else {
      const timer = setTimeout(() => {
        console.log(`[FALLBACK] Using semester ${FALLBACK_SEMESTER_ID}`);
        setUsingFallback(true);
        loadDashboardData(FALLBACK_SEMESTER_ID);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [currentSemester]);

  const handleSemesterChange = (e) => {
    const selectedId = parseInt(e.target.value, 10);
    const selectedSemester = semesters.find((s) => s.id === selectedId);
    setCurrentSemester(selectedSemester);
  };

  const StatCard = ({ icon: Icon, title, value, color = "blue", delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium tracking-wide">{title}</p>
          {loading ? (
            <div className="h-10 w-20 bg-gray-200 rounded mt-2 animate-pulse" />
          ) : (
            <p className="text-3xl font-bold mt-1 text-gray-900">{value ?? 0}</p>
          )}
        </div>
        <div className={`p-4 rounded-xl bg-${color}-50 text-${color}-600`}>
          <Icon size={32} strokeWidth={1.8} />
        </div>
      </div>
    </motion.div>
  );

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-gray-700">Số lượng: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  const barChartData = [
    { name: "Mở", value: stats.projectStats.open, color: COLORS[0] },
    { name: "Đang thực hiện", value: stats.projectStats.inProcess, color: COLORS[1] },
    { name: "Đóng", value: stats.projectStats.close, color: COLORS[2] },
    { name: "Hoàn thành", value: stats.projectStats.complete, color: COLORS[3] },
  ];

  const pieChartData = barChartData.filter((item) => item.value > 0);

  return (
    <div className="min-h-screen bg-gray-50/70 px-5 py-8 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Dashboard</h1>
              {semesters.length > 0 ? (
                <select
                  value={currentSemester?.id || ''}
                  onChange={handleSemesterChange}
                  className="mt-2 p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Chọn học kỳ</option>
                  {semesters.map((sem) => (
                    <option key={sem.id} value={sem.id}>
                      {sem.name || sem.keywordTheme} ({sem.status})
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-gray-600 mt-2 text-lg">
                  {usingFallback
                    ? `Dữ liệu mẫu (Học kỳ ID: ${FALLBACK_SEMESTER_ID})`
                    : currentSemester
                    ? `Học kỳ: ${currentSemester.name || currentSemester.keywordTheme || "N/A"} (${
                        currentSemester.status || "N/A"
                      })`
                    : "Đang xác định học kỳ..."}
                </p>
              )}
            </div>

            {(error || usingFallback) && (
              <button
                onClick={() => {
                  setError(null);
                  setUsingFallback(false);
                  fetchSemesters();
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition"
              >
                <RefreshCw size={18} /> Thử lại
              </button>
            )}
          </div>

          {error && !loading && (
            <div className="mt-5 p-5 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
              <AlertCircle size={24} />
              <span>{error}</span>
            </div>
          )}

          {usingFallback && !error && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-sm">
              Đang hiển thị dữ liệu học kỳ mẫu (ID {FALLBACK_SEMESTER_ID}) vì chưa xác định được học kỳ đang hoạt động.
            </div>
          )}
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-10">
          <StatCard icon={FolderPlus} title="Tổng dự án" value={stats.projectStats.total} color="indigo" delay={0.1} />
          <StatCard icon={Clock} title="Dự án mở" value={stats.projectStats.open} color="blue" delay={0.2} />
          <StatCard icon={TrendingUp} title="Đang thực hiện" value={stats.projectStats.inProcess} color="amber" delay={0.3} />
          <StatCard icon={CheckCircle} title="Hoàn thành" value={stats.projectStats.complete} color="green" delay={0.4} />
          <StatCard icon={Users} title="Tổng người dùng" value={stats.userStats.totalUsers} color="purple" delay={0.5} />
        </div>

        {/* Charts */}
        {!loading && stats.projectStats.total > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Bar Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-5 text-gray-800">Phân bố trạng thái dự án</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tick={{ fill: "#6b7280" }} />
                    <YAxis axisLine={false} tick={{ fill: "#6b7280" }} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(99, 102, 241, 0.08)" }} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={60}>
                      {barChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-5 text-gray-800">Tỷ lệ trạng thái dự án</h3>
              <div className="h-80 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, "Dự án"]} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}

        {loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm h-96 animate-pulse" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}