import React, { useState } from "react";
import authService from "../../services/apis/authApi";
import { useNotification } from "../../hook/useNotification";
import { Link } from "react-router-dom";
import { decodeToken } from "../../utils/tokenUtils";
import {
  Key, // ← Correct: PascalCase!
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  ArrowRight,
} from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { showNotification } = useNotification();

  const validateForm = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = "Please enter a valid email address";
      }
    }
    if (!password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAuthSuccess = (token, role) => {
    localStorage.setItem("accessToken", token);
    localStorage.setItem("role", role);
    //showNotification(MESSAGES.AUTH.LOGIN_SUCCESS);
    showNotification("Login successful", "success");

    const redirectPaths = {
      Admin: "/admin/dashboard",
      Staff: "/staff",
      User: "/student/dashboard",
      Mentor: "/mentor/view-projects",
      Finance: "/finance",
    };

    setTimeout(() => {
      window.location.href = redirectPaths[role] || redirectPaths.default;
    }, 500);
  };

  const validateToken = (token) => {
    const tokenInfo = decodeToken(token);
    if (!tokenInfo) {
      showNotification("Token không hợp lệ");
      return null;
    }

    const currentTime = Date.now() / 1000;
    if (tokenInfo.exp < currentTime) {
      showNotification("Token đã hết hạn");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      return null;
    }

    return tokenInfo;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showNotification("Please fix the errors in the form", "error");
      return;
    }
    setLoading(true);
    const loginData = { username: email, password };

    try {
      const result = await authService.login(loginData);
      if (result.success) {
        showNotification(result.message || "Login successful!", "success");

        const tokenInfo = validateToken(result.data.accessToken);
        if (!tokenInfo) return;

        handleAuthSuccess(result.data.accessToken, tokenInfo.role);
      } else {
        let errorMsg =
          result.error || "Login failed. Please check your credentials.";
        if (result.status === 401) {
          errorMsg = "Invalid email or password";
          setErrors({
            email: "Invalid credentials",
            password: "Invalid credentials",
          });
        } else if (result.status === 400 && result.data?.errors) {
          const serverErrors = {};
          Object.keys(result.data.errors).forEach((key) => {
            serverErrors[key] = result.data.errors[key].join(", ");
          });
          setErrors(serverErrors);
          errorMsg = "Please check the form for errors";
        } else if (result.status === 429) {
          errorMsg = "Too many attempts. Please wait a moment.";
          showNotification(errorMsg, "warning");
        }
        showNotification(errorMsg, "error");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      showNotification(
        "An unexpected error occurred. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field === "email") setEmail(value);
    if (field === "password") setPassword(value);
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex items-center justify-center px-4 py-12">
      {/* NEW Futuristic Animated SVG Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg
          className="w-full h-full"
          viewBox="0 0 1200 1200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="8" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fb923c" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#c2410c" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* Subtle animated grid */}
          <g opacity="0.15">
            {[...Array(20)].map((_, i) => (
              <line
                key={`h${i}`}
                x1="0"
                y1={i * 60}
                x2="1200"
                y2={i * 60}
                stroke="#ea580c"
                strokeWidth="1"
              >
                <animate
                  attributeName="stroke-opacity"
                  values="0.05;0.2;0.05"
                  dur={`${12 + (i % 5)}s`}
                  repeatCount="indefinite"
                />
              </line>
            ))}
            {[...Array(20)].map((_, i) => (
              <line
                key={`v${i}`}
                x1={i * 60}
                y1="0"
                x2={i * 60}
                y2="1200"
                stroke="#ea580c"
                strokeWidth="1"
              >
                <animate
                  attributeName="stroke-opacity"
                  values="0.05;0.15;0.05"
                  dur={`${15 + (i % 7)}s`}
                  repeatCount="indefinite"
                />
              </line>
            ))}
          </g>

          {/* Rotating Hexagons */}
          {[
            { cx: 200, cy: 300, delay: 0 },
            { cx: 800, cy: 200, delay: 3 },
            { cx: 1000, cy: 700, delay: 6 },
            { cx: 400, cy: 800, delay: 9 },
            { cx: 1100, cy: 400, delay: 12 },
            { cx: 150, cy: 600, delay: 15 },
          ].map((node, i) => (
            <g key={`hex${i}`}>
              <path
                d="M0,-30 L26,-15 L26,15 L0,30 L-26,15 L-26,-15 Z"
                transform={`translate(${node.cx}, ${node.cy}) scale(2)`}
                fill="none"
                stroke="url(#grad1)"
                strokeWidth="2"
                opacity="0.6"
                filter="url(#glow)"
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from={`0 ${node.cx} ${node.cy}`}
                  to={`360 ${node.cx} ${node.cy}`}
                  dur={`${20 + i * 5}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.3;0.8;0.3"
                  dur={`${10 + i * 3}s`}
                  repeatCount="indefinite"
                  begin={`${node.delay}s`}
                />
              </path>
            </g>
          ))}

          {/* Pulsating energy orbs */}
          {[
            { cx: 600, cy: 600, r: 120, delay: 0 },
            { cx: 300, cy: 200, r: 80, delay: 5 },
            { cx: 900, cy: 800, r: 100, delay: 10 },
          ].map((orb, i) => (
            <circle
              key={`orb${i}`}
              cx={orb.cx}
              cy={orb.cy}
              r={orb.r}
              fill="#ea580c"
              opacity="0.1"
              filter="url(#glow)"
            >
              <animate
                attributeName="r"
                values={`${orb.r};${orb.r * 1.4};${orb.r}`}
                dur={`${25 + i * 10}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.05;0.15;0.05"
                dur={`${20 + i * 8}s`}
                repeatCount="indefinite"
                begin={`${orb.delay}s`}
              />
            </circle>
          ))}
        </svg>
      </div>

      {/* Login Card & Content */}
      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <div
              className="bg-orange-600 p-6 rounded-3xl shadow-2xl shadow-orange-600/60 
                            transform hover:scale-110 transition-all duration-300"
            >
              <Key className="h-14 w-14 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <h1 className="text-4xl font-black text-gray-900">FusionLab</h1>
          <p className="mt-2 text-xl text-orange-600 font-semibold">
            Student Portal
          </p>
          <p className="mt-4 text-gray-600">
            Sign in to manage your credits and projects journey.
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-gray-200">
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lab Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-gray-900 placeholder-gray-500 ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="developer@university.edu"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Access Code
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className={`w-full pl-12 pr-12 py-3 bg-gray-50 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-gray-900 placeholder-gray-500 ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all ${
                    remember
                      ? "bg-orange-600 border-orange-600"
                      : "border-gray-400"
                  }`}
                >
                  {remember && (
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <span className="ml-3 text-sm text-gray-600">
                  Remember this device
                </span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-orange-600 hover:text-orange-700"
              >
                Forgot code?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-bold text-lg rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-orange-600/30 hover:shadow-xl hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 mr-3"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l3-3-3-3v4a12 12 0 100 24v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                    />
                  </svg>
                  Connecting...
                </>
              ) : (
                <>
                  <LogIn className="mr-3 h-5 w-5" />
                  Launch Session
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              New to the Lab?{" "}
              <Link
                to="/register"
                className="font-bold text-orange-600 hover:text-orange-700"
              >
                Join the Adventure
                <ArrowRight className="inline ml-1 h-4 w-4" />
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Fusion Game Lab • SE Innovation Lab • Semester System</p>
          <p className="mt-1">
            Earn credits, build games, level up your career
          </p>
        </div>
      </div>
    </div>
  );
}
