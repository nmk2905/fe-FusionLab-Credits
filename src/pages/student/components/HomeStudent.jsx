// File: HomeStudent.jsx
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Target,
  Trophy,
  Sparkles,
  Shield,
  Lock,
} from "lucide-react";
import { AuthContext } from "./../../../contexts/AuthContext";
import Loading from "../../../components/Loading/Loading";
// DO NOT import StudentSidebar here anymore!

export default function HomeStudent() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h1 className="text-5xl md:text-6xl font-black leading-tight">
            Welcome Back,
            <br />
            <span className="text-orange-200">{user?.fullName || "Student"}</span>
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

      {/* Features Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Task Management */}
            <Link
              to="/student/task-management"
              className="group block bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-orange-300 h-full flex flex-col justify-between"
            >
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Target className="w-9 h-9 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Task Management</h3>
                  <p className="mt-2 text-gray-600 text-sm">
                    View, complete, and track all your team tasks.
                  </p>
                </div>
              </div>
              <span className="mt-6 inline-flex items-center text-orange-600 font-semibold text-sm group-hover:gap-3 transition-all">
                Open Tasks <ArrowRight className="ml-2 h-4 w-4" />
              </span>
            </Link>

            {/* My Points */}
            <Link
              to="/student/my-points"
              className="group block bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-orange-300 h-full flex flex-col justify-between"
            >
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Trophy className="w-9 h-9 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">My Points</h3>
                  <p className="mt-2 text-gray-600 text-sm">
                    Check your earned points and ranking.
                  </p>
                </div>
              </div>
              <span className="mt-6 inline-flex items-center text-orange-600 font-semibold text-sm group-hover:gap-3 transition-all">
                View Points <ArrowRight className="ml-2 h-4 w-4" />
              </span>
            </Link>

            {/* Point Exchange */}
            <Link
              to="/student/point-exchange"
              className="group block bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-orange-300 h-full flex flex-col justify-between"
            >
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-9 h-9 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Point Exchange</h3>
                  <p className="mt-2 text-gray-600 text-sm">
                    Trade points with teammates instantly.
                  </p>
                </div>
              </div>
              <span className="mt-6 inline-flex items-center text-orange-600 font-semibold text-sm group-hover:gap-3 transition-all">
                Exchange Now <ArrowRight className="ml-2 h-4 w-4" />
              </span>
            </Link>

            {/* Fair & Secure */}
            <div className="group block bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 h-full flex flex-col justify-between cursor-default">
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-9 h-9 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Fair & Secure</h3>
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
    </>
  );
}