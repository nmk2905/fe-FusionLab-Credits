import React, { useEffect, useState, useContext } from "react";
import { Calendar, Clock, Users, Award, AlertCircle, History as HistoryIcon, UserCheck } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import projectService from "../../../services/apis/projectApi";
import { AuthContext } from "../../../contexts/AuthContext";

export default function ProjectHistory() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const pageIndex = 1;
  const pageSize = 20;

  const activeTab = location.pathname.includes("/history") ? "history" : "my-group";

  useEffect(() => {
    if (!user?.id) return;

    const fetchHistory = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await projectService.getUserProjectHistory(user.id, {
          pageIndex,
          pageSize,
          sortColumn: "Id",
          sortDir: "Desc",
        });

        if (response?.success || response?.data) {
          const items = response.data?.data || response.data || response.items || [];
          setHistory(items);
        } else {
          setError("No history data returned from server");
        }
      } catch (err) {
        console.error("Failed to load project history:", err);
        setError("Could not load your project history. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        {/* Navigation Tabs - same as MyGroupDetail */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => navigate("/student/group-management/my-group")}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === "my-group"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <UserCheck size={20} />
              My Group
            </button>
            <button
              onClick={() => navigate("/student/group-management/history")}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === "history"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <HistoryIcon size={20} />
              Project History
            </button>
          </nav>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <p className="text-gray-600">Loading your project history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => navigate("/student/group-management/my-group")}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === "my-group"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <UserCheck size={20} />
              My Group
            </button>
            <button
              onClick={() => navigate("/student/group-management/history")}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === "history"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <HistoryIcon size={20} />
              Project History
            </button>
          </nav>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-10 text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Something went wrong</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Navigation Tabs - same style as MyGroupDetail */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => navigate("/student/group-management/my-group")}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === "my-group"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <UserCheck size={20} />
            My Group
          </button>
          <button
            onClick={() => navigate("/student/group-management/history")}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === "history"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <HistoryIcon size={20} />
            Project History
          </button>
        </nav>
      </div>

      {history.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Clock size={64} className="text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-700 mb-3">
            No Past Projects Yet
          </h2>
          <p className="text-gray-600 max-w-md mx-auto">
            You haven't participated in any completed or previous projects yet.
            Once you finish a semester or leave a project, it will appear here.
          </p>
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <HistoryIcon size={24} className="text-purple-600" />
            Project Participation History
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900 line-clamp-2 flex-1">
                      {project.title || "Untitled Project"}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        project.status === "Open"
                          ? "bg-green-100 text-green-800"
                          : project.status === "Closed"
                          ? "bg-gray-200 text-gray-700"
                          : project.status === "In Progress"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {project.status || "Unknown"}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-6 line-clamp-3 min-h-[4.5rem]">
                    {project.description || "No description provided."}
                  </p>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Users size={18} className="text-blue-600" />
                      <span>
                        {project.currentMembers || 0} / {project.maxMembers || "?"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Award size={18} className="text-yellow-600" />
                      <span>{project.totalPoints || 0} pts</span>
                    </div>

                    <div className="flex items-center gap-2 col-span-2">
                      <Calendar size={18} className="text-purple-600" />
                      <span>
                        {project.createdAt
                          ? new Date(project.createdAt).toLocaleDateString("vi-VN", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "Unknown date"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center text-sm">
                  <span className="text-gray-600">
                    Semester ID: {project.semesterId || "—"}
                  </span>
                  {project.mentorId && (
                    <span className="text-blue-600 font-medium">
                      Mentor #{project.mentorId}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}