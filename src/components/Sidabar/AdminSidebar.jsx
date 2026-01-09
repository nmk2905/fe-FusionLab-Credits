// src/components/Sidabar/AdminSidebar.jsx
import React, { useContext, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Home,
  Users,
  FolderKanban,
  Calendar,
  Settings,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  UserCog,
  CalendarPlus,
} from "lucide-react";
import { AuthContext } from "../../contexts/AuthContext";

const AdminSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { logout, user } = useContext(AuthContext);

  const menuItems = [
    {
      title: "Dashboard",
      icon: <Home size={20} />,
      path: "/admin/dashboard",
    },
    {
      title: "Account Management", // Quản lý Account
      icon: <UserCog size={20} />,
      path: "/admin/accounts",
    },
    {
      title: "Project Management", // Tạo Project
      icon: <FolderKanban size={20} />,
      path: "/admin/project-management",
    },
    {
      title: "Create Semester", // Tạo Học kỳ
      icon: <CalendarPlus size={20} />,
      path: "/admin/create-semester",
    }
  ];

  const sidebarVariants = {
    collapsed: { width: 80 },
    expanded: { width: 240 },
  };

  const native = useNavigate();

  const handleLogout = () => {
    // Handle logout
    logout();
    console.log("Logging out...");
    native("/");
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-md"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Desktop Sidebar */}
      <motion.aside
        className="hidden lg:flex flex-col bg-gradient-to-b from-blue-900 to-blue-800 text-white h-screen sticky top-0 shadow-xl"
        initial={false}
        animate={isCollapsed ? "collapsed" : "expanded"}
        variants={sidebarVariants}
        transition={{ duration: 0.3 }}
      >
        {/* Logo */}
        <div className="p-6 border-b border-blue-700">
          <Link to="/admin/dashboard" className="flex items-center space-x-3">
            <div className="bg-white p-2 rounded-lg">
              <BarChart3 className="text-blue-600" size={24} />
            </div>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="whitespace-nowrap overflow-hidden"
              >
                <h1 className="text-xl font-bold truncate">
                  Management System
                </h1>
                <p className="text-sm text-blue-200 truncate">Admin Panel</p>
              </motion.div>
            )}
          </Link>
        </div>

        {/* Toggle Button */}
        <button
          className="absolute -right-3 top-20 bg-blue-600 text-white p-1 rounded-full border-2 border-white hover:bg-blue-700 transition-colors"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 p-3 rounded-lg transition-all hover:bg-blue-700 ${
                  isActive ? "bg-blue-600 shadow-md" : "hover:bg-blue-700/50"
                }`
              }
            >
              <div className="flex-shrink-0">{item.icon}</div>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="font-medium whitespace-nowrap"
                >
                  {item.title}
                </motion.span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-blue-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="font-bold">AD</span>
            </div>
            {!isCollapsed && (
              <div>
                <p className="font-medium">{user?.fullName || "admin@university.edu.vn"}</p>{" "}
                {/* Quản trị viên */}
                <p className="text-sm text-blue-200">
                  {user?.email || "admin@university.edu.vn"}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-red-600/20 text-red-200 hover:text-red-100 transition-colors"
          >
            <LogOut size={20} />
            {!isCollapsed && <span>Logout</span>} {/* Đăng xuất */}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMobileOpen(false)}
          />

          {/* Sidebar */}
          <motion.aside
            className="absolute left-0 top-0 h-full w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white shadow-xl"
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6 border-b border-blue-700">
              <Link
                to="/admin/dashboard"
                className="flex items-center space-x-3"
              >
                <div className="bg-white p-2 rounded-lg">
                  <BarChart3 className="text-blue-600" size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Management System</h1>{" "}
                  {/* Hệ thống Quản lý */}
                  <p className="text-sm text-blue-200">Admin Panel</p>
                </div>
              </Link>
            </div>

            <nav className="p-4 space-y-2">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 p-3 rounded-lg transition-all ${
                      isActive ? "bg-blue-600 shadow-md" : "hover:bg-blue-700"
                    }`
                  }
                  onClick={() => setIsMobileOpen(false)}
                >
                  {item.icon}
                  <span className="font-medium">{item.title}</span>
                </NavLink>
              ))}
            </nav>

            <div className="p-4 border-t border-blue-700 mt-auto">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-red-600/20 text-red-200 hover:text-red-100 transition-colors"
              >
                <LogOut size={20} />
                <span>Logout</span> {/* Đăng xuất */}
              </button>
            </div>
          </motion.aside>
        </div>
      )}
    </>
  );
};

export default AdminSidebar;
