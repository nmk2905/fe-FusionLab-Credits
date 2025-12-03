import React from "react";
import MainLayout from "../../components/layout/MainLayout";
import { Link } from "react-router-dom";
import { 
  Wallet, 
  ArrowRight, 
  TrendingUp, 
  Shield, 
  Zap, 
  BarChart3,
  Users,
  Sparkles
} from "lucide-react"; // You can install lucide-react for nice icons

export default function Home() {
  return (
    <MainLayout>
      {/* Hero Section - Big & Bold */}
      <section className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        
        {/* Background decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse animation-delay-2000"></div>

        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32 lg:py-40 text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight">
            Welcome to <span className="text-orange-200">FusionLab</span><br />
            Credits
          </h1>
          <p className="mt-6 text-xl md:text-2xl lg:text-3xl font-light opacity-90 max-w-3xl mx-auto">
            The smartest way to manage, transfer, and grow your credits — fast, secure, and beautiful.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/credits"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-orange-600 font-bold text-lg rounded-full hover:bg-orange-50 transform hover:scale-105 transition shadow-xl"
            >
              <Wallet className="mr-3 h-6 w-6" />
              Open Dashboard
              <ArrowRight className="ml-3 h-5 w-5" />
            </Link>
            <Link
              to="/transactions"
              className="inline-flex items-center justify-center px-8 py-4 border-4 border-white text-white font-bold text-lg rounded-full hover:bg-white hover:text-orange-600 transition"
            >
              Make a Transfer
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Everything You Need
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Powerful tools designed for real people
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* Card 1 */}
            <Link
              to="/credits"
              className="group bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-orange-100"
            >
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-600 transition">
                <Wallet className="w-9 h-9 text-orange-600 group-hover:text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Track Credits</h3>
              <p className="text-gray-600 leading-relaxed">
                Real-time balance, history, and instant notifications. Never lose sight of your credits.
              </p>
              <span className="mt-4 inline-flex items-center text-orange-600 font-semibold group-hover:text-orange-700">
                Go to dashboard <ArrowRight className="ml-2 h-5 w-5" />
              </span>
            </Link>

            {/* Card 2 */}
            <Link
              to="/transactions"
              className="group bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-orange-100"
            >
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-600 transition">
                <Zap className="w-9 h-9 text-orange-600 group-hover:text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Instant Transfers</h3>
              <p className="text-gray-600 leading-relaxed">
                Send credits to anyone in seconds. Zero fees on internal transfers.
              </p>
              <span className="mt-4 inline-flex items-center text-orange-600 font-semibold group-hover:text-orange-700">
                Transfer now <ArrowRight className="ml-2 h-5 w-5" />
              </span>
            </Link>

            {/* Card 3 */}
            <Link
              to="/analytics"
              className="group bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-orange-100"
            >
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-600 transition">
                <BarChart3 className="w-9 h-9 text-orange-600 group-hover:text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Smart Analytics</h3>
              <p className="text-gray-600 leading-relaxed">
                Beautiful charts and insights to understand your spending patterns.
              </p>
              <span className="mt-4 inline-flex items-center text-orange-600 font-semibold group-hover:text-orange-700">
                View analytics <ArrowRight className="ml-2 h-5 w-5" />
              </span>
            </Link>

            {/* Extra Feature Cards */}
            <div className="group bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-orange-100">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-600 transition">
                <Shield className="w-9 h-9 text-orange-600 group-hover:text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Bank-Grade Security</h3>
              <p className="text-gray-600 leading-relaxed">
                End-to-end encryption and 2FA keep your credits 100% safe.
              </p>
            </div>

            <div className="group bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-orange-100">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-600 transition">
                <Users className="w-9 h-9 text-orange-600 group-hover:text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Team Accounts</h3>
              <p className="text-gray-600 leading-relaxed">
                Share credits with your team, set limits, and track usage together.
              </p>
            </div>

            <div className="group bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-orange-100">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-600 transition">
                <Sparkles className="w-9 h-9 text-orange-600 group-hover:text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Earn Rewards</h3>
              <p className="text-gray-600 leading-relaxed">
                Get bonus credits for referrals, daily logins, and milestones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
            <div>
              <h3 className="text-5xl font-black">50K+</h3>
              <p className="mt-2 text-orange-100 text-lg">Active Users</p>
            </div>
            <div>
              <h3 className="text-5xl font-black">₹12M+</h3>
              <p className="mt-2 text-orange-100 text-lg">Credits Transferred</p>
            </div>
            <div>
              <h3 className="text-5xl font-black">99.99%</h3>
              <p className="mt-2 text-orange-100 text-lg">Uptime</p>
            </div>
            <div>
              <h3 className="text-5xl font-black">24/7</h3>
              <p className="mt-2 text-orange-100 text-lg">Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
            Ready to take control of your credits?
          </h2>
          <p className="mt-6 text-xl text-gray-600">
            Join thousands who already trust FusionLab Credits every day.
          </p>
          <div className="mt-10">
            <Link
              to="/credits"
              className="inline-flex items-center px-10 py-5 bg-orange-600 text-white font-bold text-xl rounded-full hover:bg-orange-700 transform hover:scale-105 transition shadow-2xl"
            >
              Get Started Now
              <TrendingUp className="ml-3 h-7 w-7" />
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}