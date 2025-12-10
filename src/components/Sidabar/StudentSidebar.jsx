// src/components/sidebar/StudentSidebar.jsx
import React, { useContext, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Trophy,
  Group,
  Target,
  Sparkles,
  User,
  LogOut,
} from "lucide-react";
import { AuthContext } from "../../contexts/AuthContext";

const StudentSidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { to: "/student/dashboard", label: "Dashboard", icon: Home },
    { to: "/student/my-points", label: "My Points", icon: Trophy },
    { to: "/student/group-management", label: "Group Management", icon: Group },
    { to: "/student/task-management", label: "Task Management", icon: Target },
    { to: "/student/point-exchange", label: "Point Exchange", icon: Sparkles },
    { to: "/student/account", label: "Account", icon: User },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <aside
      className={`${
        isSidebarOpen ? "w-64" : "w-20"
      } bg-white shadow-2xl transition-all duration-300 ease-in-out flex flex-col relative border-r border-gray-200 h-screen sticky top-0`}
    >
      {/* Toggle Button */}
      <div className="absolute -right-3 top-18 z-10">
        <button
          onClick={toggleSidebar}
          className="bg-orange-600 text-white p-1.5 rounded-full shadow-md 
                     hover:bg-orange-700 hover:scale-105 transition-all duration-200 
                     border-2 border-white"
          aria-label="Toggle sidebar"
        >
          {isSidebarOpen ? (
            <ChevronLeft className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Logo */}
      <div className={`${isSidebarOpen ? "p-6" : "p-4"} border-b border-gray-200`}>
        <div className="flex items-center">
          <div className="bg-orange-600 p-3 rounded-xl shadow-md">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          {isSidebarOpen && (
            <div className="ml-4">
              <h2 className="text-2xl font-bold text-gray-900">FusionLab</h2>
              <p className="text-orange-600 text-sm font-semibold">Team & Tasks</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-x-hidden">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.to ||
              (item.to !== "/student/dashboard" && location.pathname.startsWith(item.to));

            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={`flex items-center px-4 py-3 rounded-xl transition-all group relative ${
                    isActive
                      ? "bg-orange-100 text-orange-600 font-bold shadow-md"
                      : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {isSidebarOpen && <span className="ml-4">{item.label}</span>}

                  {/* Tooltip when collapsed */}
                  {!isSidebarOpen && (
                    <div className="absolute left-full ml-3 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50 shadow-xl">
                      {item.label}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 border-8 border-transparent border-r-gray-900"></div>
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="px-4 pb-3 border-t border-gray-200">
        <button
          onClick={() => navigate("/student/account")}
          className="flex items-center w-full px-4 py-3 rounded-xl text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all group relative"
        >
          <div className="bg-orange-100 p-2 rounded-full">
            <User className="h-5 w-5 text-orange-600" />
          </div>
          {isSidebarOpen && (
            <div className="ml-4 text-left">
              <p className="font-semibold text-gray-900">{user?.fullName || "Student"}</p>
              <p className="text-xs text-gray-500">View Account</p>
            </div>
          )}
          {!isSidebarOpen && (
            <div className="absolute left-full ml-3 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50 shadow-xl">
              {user?.fullName || "Account"}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 border-8 border-transparent border-r-gray-900"></div>
            </div>
          )}
        </button>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 rounded-xl text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all group relative"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {isSidebarOpen && <span className="ml-4 font-medium">Logout</span>}
          {!isSidebarOpen && (
            <div className="absolute left-full ml-3 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50 shadow-xl">
              Logout
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 border-8 border-transparent border-r-gray-900"></div>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};

export default StudentSidebar;