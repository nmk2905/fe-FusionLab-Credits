// src/ProjectDetail/components/OverviewTab.jsx
import React, { useState, useEffect } from "react";
import { Calendar, Users, Target, Clock } from "lucide-react";
import semesterService from "../../../services/apis/semesterApi";

const OverviewTab = ({ projectId, project }) => {
  const [semester, setSemester] = useState(null);
  const [semesterLoading, setSemesterLoading] = useState(false);

  useEffect(() => {
    const fetchSemesterDetails = async () => {
      if (!project?.semesterId) return;
      
      try {
        setSemesterLoading(true);
        const response = await semesterService.getSemesterById(project.semesterId);

        if (response?.rawResponse?.data) {
          setSemester(response.rawResponse.data);
        } else if (response?.data) {
          setSemester(response.data);
        }
      } catch (error) {
        console.error("Error fetching semester details:", error);
        setSemester(null);
      } finally {
        setSemesterLoading(false);
      }
    };

    fetchSemesterDetails();
  }, [project?.semesterId]);

  // Hàm format ngày
  const formatDateOnly = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-EN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  // Lấy start date
  const getStartDate = () => {
    return project?.createdAt ? formatDateOnly(project.createdAt) : "N/A";
  };

  // Lấy end date
  const getEndDate = () => {
    if (semester?.endDate) {
      return formatDateOnly(semester.endDate);
    }
    return project?.endDate ? formatDateOnly(project.endDate) : "N/A";
  };

  return (
    <div className="p-6">
      <div className="space-y-6">
        {/* Project Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Project Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="text-gray-400" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Semester</p>
                  <p className="font-medium">
                    {semesterLoading ? (
                      <span className="text-gray-400">Loading...</span>
                    ) : (
                      semester?.name || semester?.code || "N/A"
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Users className="text-gray-400" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Team Size</p>
                  <p className="font-medium">
                    {project.minMembers || 0} - {project.maxMembers || 0} members
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Target className="text-gray-400" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Total Points</p>
                  <p className="font-medium text-blue-600">
                    {project.totalPoints || 0} points
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="text-gray-400" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Project ID</p>
                  <p className="font-medium text-gray-800">#{projectId}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Timeline</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Semester</p>
              <p className="font-medium">
                {semesterLoading ? (
                  <span className="text-gray-400">Loading...</span>
                ) : (
                  semester?.name || "N/A"
                )}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Start Date</p>
              <p className="font-medium">{getStartDate()}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">End Date</p>
              <p className="font-medium">{getEndDate()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;