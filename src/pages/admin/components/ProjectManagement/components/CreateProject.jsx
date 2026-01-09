import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Save,
  Upload,
  Calendar,
  Users,
  BookOpen,
  UserPlus,
  Target,
  UserCheck,
} from "lucide-react";
import projectService from "../../../../../services/apis/projectApi";
import semesterService from "../../../../../services/apis/semesterApi";
import userService from "../../../../../services/apis/userApi";
import { useNotification } from "../../../../../hook/useNotification";

export default function CreateProject() {
  const [projectData, setProjectData] = useState({
    title: "",
    description: "",
    totalPoints: 0,
    semesterId: 0,
    proposerId: 9, // Assuming this comes from logged in user
    mentorId: 0,
    minMembers: 2,
    maxMembers: 6,
  });

  const [semesters, setSemesters] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { showNotification } = useNotification();

  // Fetch current semester and mentors on component mount
  useEffect(() => {
    fetchCurrentSemester();
    fetchMentors();
  }, []);

  const fetchCurrentSemester = async () => {
    try {
      const response = await semesterService.getCurrentSemester();
      console.log("Current semester response:", response);
      if (response.data) {
        setSemesters(response?.rawResponse?.data);
        setProjectData((prev) => ({
          ...prev,
          semesterId: response?.rawResponse?.data?.id,
        }));
      }
    } catch (error) {
      console.error("Error fetching current semester:", error);
    }
  };

  const fetchMentors = async () => {
    try {
      const params = {
        role: "Mentor",
        pageIndex: 1,
        pageSize: 1000,
        sortDir: "desc",
      };
      const response = await userService.getUsers(params);
      console.log("Mentors response:", response);
      if (
        response?.rawResponse?.data &&
        response?.rawResponse?.data?.contends
      ) {
        setMentors(response?.rawResponse?.data?.contends);
      }
    } catch (error) {
      console.error("Error fetching mentors:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Basic validation
    const newErrors = {};
    if (!projectData.title.trim()) newErrors.title = "Title is required";
    if (!projectData.description.trim())
      newErrors.description = "Description is required";
    if (projectData.semesterId === 0)
      newErrors.semesterId = "Please select a semester";
    if (projectData.mentorId === 0)
      newErrors.mentorId = "Please select a mentor";
    if (projectData.minMembers > projectData.maxMembers)
      newErrors.memberRange = "Min members cannot exceed max members";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await projectService.addProject(projectData);
      console.log("Project created successfully:", response);
      showNotification("Project created successfully!", "success");

      // Reset form
      setProjectData({
        title: "",
        description: "",
        totalPoints: 0,
        semesterId: semesters[0]?.id || 0,
        proposerId: 9,
        mentorId: 0,
        minMembers: 50,
        maxMembers: 50,
      });
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Failed to create project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setProjectData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseInt(value) || 0 : value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseInt(value) || 0;
    setProjectData((prev) => ({
      ...prev,
      [name]: numValue,
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6"
    >
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Create New Project</h2>
        <p className="text-gray-600">
          Create a project for student registration
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Project Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <BookOpen className="mr-2" size={20} />
                Project Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={projectData.title}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.title ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter project title"
                    required
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={projectData.description}
                    onChange={handleChange}
                    rows={4}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.description ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Detailed project description..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.description}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Target className="mr-2" size={16} />
                    Total Points
                  </label>
                  <input
                    type="number"
                    name="totalPoints"
                    value={projectData.totalPoints}
                    onChange={handleNumberChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Team Configuration */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Users className="mr-2" size={20} />
                Team Configuration
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <UserCheck className="mr-2" size={16} />
                    Minimum Members
                  </label>
                  <input
                    type="range"
                    name="minMembers"
                    min="2"
                    max="2"
                    value={projectData.minMembers}
                    onChange={handleChange}
                    className="w-full"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-500">2</span>
                    <span className="text-lg font-semibold">
                      {projectData.minMembers}
                    </span>
                    <span className="text-sm text-gray-500">2</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <UserPlus className="mr-2" size={16} />
                    Maximum Members
                  </label>
                  <input
                    type="range"
                    name="maxMembers"
                    min="2"
                    max="6"
                    value={projectData.maxMembers}
                    onChange={handleChange}
                    className="w-full"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-500">2</span>
                    <span className="text-lg font-semibold">
                      {projectData.maxMembers}
                    </span>
                    <span className="text-sm text-gray-500">6</span>
                  </div>
                </div>

                {errors.memberRange && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.memberRange}
                  </p>
                )}

                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">
                    Team Size: {projectData.minMembers} -{" "}
                    {projectData.maxMembers} members
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Semester & Mentor Selection */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Calendar className="mr-2" size={20} />
                Semester & Mentor
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Semester *
                  </label>
                  <select
                    name="semesterId"
                    value={projectData.semesterId}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.semesterId ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                    disabled={semesters.length === 0}
                  >
                    <option value="0">Select semester</option>
                    {semesters.map((semester) => (
                      <option key={semester.id} value={semester.id}>
                        {semester.name || `Semester ${semester.id}`}
                      </option>
                    ))}
                  </select>
                  {semesters.length === 0 ? (
                    <p className="mt-1 text-sm text-gray-500">
                      Loading current semester...
                    </p>
                  ) : errors.semesterId ? (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.semesterId}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mentor *
                  </label>
                  <select
                    name="mentorId"
                    value={projectData.mentorId}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.mentorId ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                    disabled={mentors.length === 0}
                  >
                    <option value="0">Select a mentor</option>
                    {mentors.map((mentor) => (
                      <option key={mentor.id} value={mentor.id}>
                        {mentor.fullName ||
                          mentor.name ||
                          `Mentor ${mentor.id}`}
                      </option>
                    ))}
                  </select>
                  {mentors.length === 0 ? (
                    <p className="mt-1 text-sm text-gray-500">
                      Loading mentors...
                    </p>
                  ) : errors.mentorId ? (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.mentorId}
                    </p>
                  ) : null}
                </div>

                {/* Additional Information */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-md font-medium text-gray-700 mb-3">
                    Project Details
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Semester ID:</span>
                      <span className="font-medium">
                        {projectData.semesterId || "Not selected"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Proposer ID:</span>
                      <span className="font-medium">
                        {projectData.proposerId}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mentor ID:</span>
                      <span className="font-medium">
                        {projectData.mentorId || "Not selected"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Save className="mr-2" size={20} />
                Complete
              </h2>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">Summary</p>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Ready to create</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>• Title: {projectData.title || "Not set"}</p>
                    <p>
                      • Team Size: {projectData.minMembers} -{" "}
                      {projectData.maxMembers}
                    </p>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex-1 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                      loading
                        ? "bg-blue-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    } text-white`}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <Save size={20} />
                        <span>Create Project</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      // Reset form
                      setProjectData({
                        title: "",
                        description: "",
                        totalPoints: 0,
                        semesterId: semesters[0]?.id || 0,
                        proposerId: 1,
                        mentorId: 0,
                        minMembers: 50,
                        maxMembers: 50,
                      });
                      setErrors({});
                    }}
                    className="flex-1 border border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Reset Form
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
