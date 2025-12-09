// File: HomeStudent.jsx
import React, { useContext, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Wallet,
  ArrowRight,
  Zap,
  BarChart3,
  Shield,
  Users,
  Sparkles,
  TrendingUp,
  Home,
  CreditCard,
  Send,
  PieChart,
  Lock,
  UserPlus,
  Gift,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  Target, // Great for tasks
  Trophy, // For points/rewards
  Group, // Alternative to Users
} from "lucide-react";
import { AuthContext } from "../../../contexts/AuthContext";
import Loading from "../../../components/Loading/Loading";

export default function HomeStudent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const { user, loading, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation(); // Critical for active state

  // Updated Menu Items for Task & Team Points System
  const menuItems = [
    { to: "/student", icon: Home, label: "Dashboard" },
    { to: "/student/my-points", icon: Trophy, label: "My Points" },
    { to: "/student/group-management", icon: Group, label: "Group Management" },
    { to: "/student/task-management", icon: Target, label: "Task Management" },
    { to: "/student/point-exchange", icon: Sparkles, label: "Point Exchange" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="flex">
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
          <div
            className={`${
              isSidebarOpen ? "p-6" : "p-4"
            } border-b border-gray-200`}
          >
            <div className="flex items-center">
              <div className="bg-orange-600 p-3 rounded-xl shadow-md">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              {isSidebarOpen && (
                <div className="ml-4 transition-all">
                  <h2 className="text-2xl font-bold text-gray-900">
                    FusionLab
                  </h2>
                  <p className="text-orange-600 text-sm font-semibold">
                    Team & Tasks
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto overflow-x-hidden">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  location.pathname === item.to ||
                  (item.to !== "/student/dashboard" &&
                    location.pathname.startsWith(item.to));

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
                      {isSidebarOpen && (
                        <span className="ml-4">{item.label}</span>
                      )}
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

          {/* User Profile Section */}
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
                  <p className="font-semibold text-gray-900">
                    {user?.fullName || "Student"}
                  </p>
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
              {isSidebarOpen && (
                <span className="ml-4 font-medium">Logout</span>
              )}
              {!isSidebarOpen && (
                <div className="absolute left-full ml-3 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50 shadow-xl">
                  Logout
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 border-8 border-transparent border-r-gray-900"></div>
                </div>
              )}
            </button>
          </div>
        </aside>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Hero Section - Updated for Tasks & Points */}
        <section className="bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 text-white py-20">
          <div className="max-w-4xl mx-auto text-center px-6">
            <h1 className="text-5xl md:text-6xl font-black leading-tight">
              Welcome Back,
              <br />
              <span className="text-orange-200">
                {user?.fullName || "Student"}
              </span>
            </h1>
            <p className="mt-6 text-xl md:text-2xl opacity-90">
              Complete tasks, earn points, and dominate with your team!
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/student/task-management"
                className="inline-flex items-center px-8 py-4 bg-white text-orange-600 font-bold text-lg rounded-full hover:bg-orange-50 transform hover:scale-105 transition shadow-2xl"
              >
                <Target className="mr-3 h-6 w-6" />
                View Tasks
                <ArrowRight className="ml-3 h-5 w-5" />
              </Link>
              <Link
                to="/student/my-points"
                className="inline-flex items-center px-8 py-4 bg-orange-800 bg-opacity-50 backdrop-blur text-white font-bold text-lg rounded-full hover:bg-opacity-70 transform hover:scale-105 transition shadow-2xl border border-orange-300"
              >
                <Trophy className="mr-3 h-6 w-6" />
                My Points: {user?.points || "0"}
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid - Updated */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <Link
                to="/student/task-management"
                className="group block bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-orange-300 h-full flex flex-col justify-between"
              >
                <div className="flex items-start gap-5">
                  <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Target className="w-9 h-9 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Task Management
                    </h3>
                    <p className="mt-2 text-gray-600 text-sm">
                      View, complete, and track all your team tasks.
                    </p>
                  </div>
                </div>
                <span className="mt-6 inline-flex items-center text-orange-600 font-semibold text-sm group-hover:gap-3 transition-all">
                  Open Tasks <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              </Link>

              <Link
                to="/student/my-points"
                className="group block bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-orange-300 h-full flex flex-col justify-between"
              >
                <div className="flex items-start gap-5">
                  <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Trophy className="w-9 h-9 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      My Points
                    </h3>
                    <p className="mt-2 text-gray-600 text-sm">
                      Check your earned points and ranking.
                    </p>
                  </div>
                </div>
                <span className="mt-6 inline-flex items-center text-orange-600 font-semibold text-sm group-hover:gap-3 transition-all">
                  View Points <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              </Link>

              <Link
                to="/student/point-exchange"
                className="group block bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-orange-300 h-full flex flex-col justify-between"
              >
                <div className="flex items-start gap-5">
                  <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-9 h-9 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Point Exchange
                    </h3>
                    <p className="mt-2 text-gray-600 text-sm">
                      Trade points with teammates instantly.
                    </p>
                  </div>
                </div>
                <span className="mt-6 inline-flex items-center text-orange-600 font-semibold text-sm group-hover:gap-3 transition-all">
                  Exchange Now <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              </Link>

              <div className="group block bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 h-full flex flex-col justify-between cursor-default">
                <div className="flex items-start gap-5">
                  <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Shield className="w-9 h-9 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Fair & Secure
                    </h3>
                    <p className="mt-2 text-gray-600 text-sm">
                      All tasks and points are verified and transparent.
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex items-center text-green-600 font-semibold text-sm">
                  <Lock className="h-4 w-4 mr-1" />
                  Trusted System
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
