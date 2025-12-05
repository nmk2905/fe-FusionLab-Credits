import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../services/apis/authApi";
import { useNotification } from "../../hook/useNotification";
import {
  Key,
  Mail,
  Lock,
  User,
  IdCard,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    studentCode: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Please enter a valid university email";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.studentCode.trim())
      newErrors.studentCode = "Student code is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showNotification("Please fix the errors in the form", "error");
      return;
    }

    setLoading(true);
    const registerData = {
      username: formData.email,
      password: formData.password,
      fullName: formData.fullName,
      studentCode: formData.studentCode,
    };

    try {
      const result = await authService.register(registerData);
      if (result.success) {
        showNotification(
          "Welcome to FusionLab! Your lab access is ready!",
          "success"
        );
        setTimeout(() => navigate("/login"), 1500);
      } else {
        const msg =
          result.status === 400 &&
          result.data?.message?.includes("already exists")
            ? "This email is already registered"
            : result.error || "Registration failed";
        showNotification(msg, "error");
        if (msg.includes("already registered"))
          setErrors({ email: "Email already in use" });
      }
    } catch (err) {
      showNotification("Network error. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex items-center justify-center px-4 py-12">
      {/* SAME FUTURISTIC SVG BACKGROUND AS LOGIN */}
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

      {/* MAIN CARD - SAME STYLE AS LOGIN */}
      <div className="max-w-2xl w-full relative z-10">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <div className="bg-orange-600 p-6 rounded-3xl shadow-2xl shadow-orange-600/60 transform hover:scale-110 transition-all duration-300">
              <Key className="h-14 w-14 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <h1 className="text-5xl font-black text-gray-900">FusionLab</h1>
          <p className="mt-2 text-2xl text-orange-600 font-bold">
            Join the Lab
          </p>
          <p className="mt-4 text-gray-600 max-w-md mx-auto">
            Register to start building games, earning credits, and leveling up
            your career
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-gray-200">
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all ${
                      errors.fullName ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Alex Chen"
                  />
                </div>
                {errors.fullName && (
                  <p className="mt-2 text-sm text-red-600">{errors.fullName}</p>
                )}
              </div>

              {/* Student Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student Code
                </label>
                <div className="relative">
                  <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input
                    name="studentCode"
                    type="text"
                    value={formData.studentCode}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all ${
                      errors.studentCode ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="SE123456"
                  />
                </div>
                {errors.studentCode && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.studentCode}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lab Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="you@university.edu"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access Code
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-12 py-3 bg-gray-50 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all ${
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

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Code
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-12 py-3 bg-gray-50 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all ${
                      errors.confirmPassword
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-bold text-lg rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-orange-600/30 hover:shadow-xl hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>Creating Your Lab Profile...</>
              ) : (
                <>
                  Join the Lab
                  <ArrowRight className="ml-3 h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Already in the lab?{" "}
              <Link
                to="/"
                className="font-bold text-orange-600 hover:text-orange-700"
              >
                Return to Login <ArrowRight className="inline ml-1 h-4 w-4" />
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Fusion Game Lab • SE Innovation Lab • Semester System</p>
          <p className="mt-1">
            Earn credits • Build games • Level up your future
          </p>
        </div>
      </div>
    </div>
  );
}
