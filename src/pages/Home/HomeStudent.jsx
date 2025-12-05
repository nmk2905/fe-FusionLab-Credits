// File: HomeStudent.jsx
import React, { useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import { Link } from "react-router-dom";
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
} from "lucide-react";

export default function HomeStudent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const menuItems = [
    { to: "/student/dashboard", icon: Home, label: "Dashboard" },
    {
      to: "/student/credits",
      icon: CreditCard,
      label: "My Credits",
      active: true,
    },
    { to: "/student/transactions", icon: Send, label: "Transfer Credits" },
    { to: "/student/analytics", icon: PieChart, label: "Analytics" },
    { to: "/student/security", icon: Lock, label: "Security" },
    { to: "/student/team", icon: UserPlus, label: "Team Account" },
    { to: "/student/rewards", icon: Gift, label: "Rewards" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Clean & Modern */}
      <aside
        className={`${
          isSidebarOpen ? "w-64" : "w-20"
        } bg-white shadow-2xl transition-all duration-300 ease-in-out flex flex-col relative border-r border-gray-200`}
      >
        {/* Elegant Toggle Button - Best UX Position */}
        <div className="absolute -right-3 top-24 z-10">
          <button
            onClick={toggleSidebar}
            className="bg-orange-600 text-white p-2 rounded-full shadow-lg hover:bg-orange-700 hover:scale-110 transition-all duration-200 border-4 border-white"
            aria-label="Toggle sidebar"
          >
            {isSidebarOpen ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Logo Area */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="bg-orange-600 p-3 rounded-xl shadow-md">
              <Wallet className="h-8 w-8 text-white" />
            </div>
            {isSidebarOpen && (
              <div className="ml-4 transition-all">
                <h2 className="text-2xl font-bold text-gray-900">FusionLab</h2>
                <p className="text-orange-600 text-sm font-semibold">
                  Student Portal
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.active;
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

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button className="flex items-center w-full px-4 py-3 rounded-xl text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all group relative">
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

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Hero */}
        <section className="bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 text-white py-20">
          <div className="max-w-4xl mx-auto text-center px-6">
            <h1 className="text-5xl md:text-6xl font-black leading-tight">
              Welcome Back,
              <br />
              <span className="text-orange-200">Student</span>
            </h1>
            <p className="mt-6 text-xl md:text-2xl opacity-90">
              Manage your FusionLab Credits easily and securely.
            </p>
            <div className="mt-10">
              <Link
                to="/student/credits"
                className="inline-flex items-center px-8 py-4 bg-white text-orange-600 font-bold text-lg rounded-full hover:bg-orange-50 transform hover:scale-105 transition shadow-2xl"
              >
                <Wallet className="mr-3 h-6 w-6" />
                View My Credits
                <ArrowRight className="ml-3 h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

{/* Features Grid - Clean 4 Cards, Perfectly Aligned */}
<section className="py-20 bg-gray-50">
  <div className="max-w-7xl mx-auto px-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {/* Track Credits */}
      <Link
        to="/student/credits"
        className="group block bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-orange-300 h-full flex flex-col justify-between"
      >
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <Wallet className="w-9 h-9 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Track Credits</h3>
            <p className="mt-2 text-gray-600 text-sm">
              Real-time balance, history, and instant notifications.
            </p>
          </div>
        </div>
        <span className="mt-6 inline-flex items-center text-orange-600 font-semibold text-sm group-hover:gap-3 transition-all">
          View Credits <ArrowRight className="ml-2 h-4 w-4" />
        </span>
      </Link>

      {/* Instant Transfers */}
      <Link
        to="/student/transactions"
        className="group block bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-orange-300 h-full flex flex-col justify-between"
      >
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <Zap className="w-9 h-9 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Instant Transfers</h3>
            <p className="mt-2 text-gray-600 text-sm">
              Send credits to anyone in seconds. Zero fees.
            </p>
          </div>
        </div>
        <span className="mt-6 inline-flex items-center text-orange-600 font-semibold text-sm group-hover:gap-3 transition-all">
          Transfer Now <ArrowRight className="ml-2 h-4 w-4" />
        </span>
      </Link>

      {/* Analytics */}
      <Link
        to="/student/analytics"
        className="group block bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-orange-300 h-full flex flex-col justify-between"
      >
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <BarChart3 className="w-9 h-9 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Smart Analytics</h3>
            <p className="mt-2 text-gray-600 text-sm">
              Beautiful charts and insights into your spending.
            </p>
          </div>
        </div>
        <span className="mt-6 inline-flex items-center text-orange-600 font-semibold text-sm group-hover:gap-3 transition-all">
          View Analytics <ArrowRight className="ml-2 h-4 w-4" />
        </span>
      </Link>

      {/* Security - Non-clickable (or make it link to /security if you want) */}
      <div className="group block bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 h-full flex flex-col justify-between cursor-default">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Shield className="w-9 h-9 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Bank-Grade Security</h3>
            <p className="mt-2 text-gray-600 text-sm">
              End-to-end encryption and 2FA keep your credits 100% safe.
            </p>
          </div>
        </div>
        <div className="mt-6 flex items-center text-green-600 font-semibold text-sm">
          <Lock className="h-4 w-4 mr-1" />
          Always Protected
        </div>
      </div>
    </div>
  </div>
</section>
      </div>
    </div>
  );
}
