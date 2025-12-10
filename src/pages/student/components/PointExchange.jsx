import React from "react";
import { motion } from "framer-motion";
import {
  Users,
  FolderPlus,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
} from "lucide-react";

export default function PointExchange() {
  const stats = [
    {
      title: "Tổng số Account",
      value: "1,234",
      icon: <Users size={24} />,
      color: "bg-blue-500",
      change: "+12%",
    },
    {
      title: "Project đang mở",
      value: "24",
      icon: <FolderPlus size={24} />,
      color: "bg-green-500",
      change: "+3",
    },
    {
      title: "Học kỳ hiện tại",
      value: "HK1 2024",
      icon: <Calendar size={24} />,
      color: "bg-purple-500",
      change: "Đang diễn ra",
    },
    {
      title: "Đăng ký Project",
      value: "156",
      icon: <TrendingUp size={24} />,
      color: "bg-orange-500",
      change: "+45%",
    },
  ];

  const recentActivities = [
    {
      user: "Nguyễn Văn A",
      action: "đã tạo project mới",
      time: "2 giờ trước",
      type: "project",
    },
    {
      user: "Trần Thị B",
      action: "đăng ký project Web Development",
      time: "4 giờ trước",
      type: "registration",
    },
    {
      user: "Lê Văn C",
      action: "cập nhật thông tin tài khoản",
      time: "6 giờ trước",
      type: "account",
    },
    {
      user: "Phạm Thị D",
      action: "tạo học kỳ mới 2024-2025",
      time: "1 ngày trước",
      type: "semester",
    },
  ];

  const upcomingDeadlines = [
    {
      project: "Web Development",
      deadline: "2024-01-15",
      status: "sắp đến hạn",
    },
    { project: "Mobile App", deadline: "2024-01-20", status: "còn 5 ngày" },
    { project: "AI Research", deadline: "2024-01-25", status: "còn 10 ngày" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Chào mừng trở lại, Quản trị viên!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            className="bg-white rounded-xl shadow-lg p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold mt-2">{stat.value}</p>
                <p
                  className={`text-sm mt-1 ${
                    stat.change.includes("+")
                      ? "text-green-600"
                      : "text-blue-600"
                  }`}
                >
                  {stat.change}
                </p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg text-white`}>
                {stat.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Clock className="mr-2" size={20} />
            Hoạt động gần đây
          </h2>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center p-3 hover:bg-gray-50 rounded-lg"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activity.type === "project"
                      ? "bg-blue-100"
                      : activity.type === "registration"
                      ? "bg-green-100"
                      : activity.type === "account"
                      ? "bg-purple-100"
                      : "bg-orange-100"
                  }`}
                >
                  <span
                    className={`font-bold ${
                      activity.type === "project"
                        ? "text-blue-600"
                        : activity.type === "registration"
                        ? "text-green-600"
                        : activity.type === "account"
                        ? "text-purple-600"
                        : "text-orange-600"
                    }`}
                  >
                    {activity.user.charAt(0)}
                  </span>
                </div>
                <div className="ml-4 flex-1">
                  <p className="font-medium">
                    <span className="text-blue-600">{activity.user}</span>
                    <span className="text-gray-600"> {activity.action}</span>
                  </p>
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    activity.type === "project"
                      ? "bg-blue-100 text-blue-800"
                      : activity.type === "registration"
                      ? "bg-green-100 text-green-800"
                      : activity.type === "account"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-orange-100 text-orange-800"
                  }`}
                >
                  {activity.type === "project"
                    ? "Project"
                    : activity.type === "registration"
                    ? "Đăng ký"
                    : activity.type === "account"
                    ? "Account"
                    : "Học kỳ"}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <CheckCircle className="mr-2" size={20} />
            Deadline sắp tới
          </h2>
          <div className="space-y-4">
            {upcomingDeadlines.map((deadline, index) => (
              <motion.div
                key={deadline.project}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
              >
                <div>
                  <h3 className="font-medium text-gray-800">
                    {deadline.project}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Deadline: {deadline.deadline}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      deadline.status.includes("sắp đến hạn")
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {deadline.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="font-medium text-gray-700 mb-4">Thao tác nhanh</h3>
            <div className="grid grid-cols-2 gap-3">
              <a
                href="/admin/accounts"
                className="text-center px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
              >
                Quản lý Account
              </a>
              <a
                href="/admin/create-project"
                className="text-center px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium"
              >
                Tạo Project
              </a>
              <a
                href="/admin/create-semester"
                className="text-center px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors font-medium"
              >
                Tạo Học kỳ
              </a>
              <a
                href="/admin/dashboard"
                className="text-center px-4 py-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors font-medium"
              >
                Xem thống kê
              </a>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
