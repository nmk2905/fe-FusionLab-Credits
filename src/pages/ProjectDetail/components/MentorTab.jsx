// src/ProjectDetail/components/MentorTab.jsx
import React, { useState, useEffect } from "react";
import { GraduationCap, Mail, Phone, User, Building } from "lucide-react";
import userService from "../../../services/apis/userApi";
import projectService from "../../../services/apis/projectApi";

const MentorTab = ({ projectId }) => {
  const [mentor, setMentor] = useState(null);
  const [mentorLoading, setMentorLoading] = useState(false);
  const [project, setProject] = useState(null);

  useEffect(() => {
    const fetchProjectAndMentor = async () => {
      try {
        setMentorLoading(true);

        // 1. Lấy project để có mentorId
        const projectResponse = await projectService.getProjectById(projectId);
        let projectData = null;

        if (projectResponse?.rawResponse?.data) {
          projectData = projectResponse.rawResponse.data;
        } else if (projectResponse?.data) {
          projectData = projectResponse.data;
        }

        setProject(projectData);

        // 2. Nếu có mentorId thì fetch mentor details
        if (projectData?.mentorId) {
          const mentorResponse = await userService.getCurrentUser(
            projectData.mentorId
          );

          let mentorData = null;
          if (mentorResponse?.rawResponse?.data) {
            mentorData = mentorResponse.rawResponse.data;
          } else if (mentorResponse?.data) {
            mentorData = mentorResponse.data;
          } else if (mentorResponse && typeof mentorResponse === "object") {
            mentorData = mentorResponse;
          }

          setMentor(mentorData);
        }
      } catch (error) {
        console.error("Error fetching mentor details:", error);
        setMentor(null);
      } finally {
        setMentorLoading(false);
      }
    };

    fetchProjectAndMentor();
  }, [projectId]);

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Project Mentor
      </h3>
      {mentorLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-500">Loading mentor information...</p>
        </div>
      ) : mentor ? (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <GraduationCap size={32} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <h4 className="text-xl font-bold text-gray-800">
                    {mentor.fullName || "Unknown Mentor"}
                  </h4>
                  <p className="text-gray-600">Mentor ID: #{mentor.id}</p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  Project Mentor
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="text-gray-400" size={18} />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-800">
                        {mentor.email || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="text-gray-400" size={18} />
                    <div>
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="font-medium text-gray-800">
                        {mentor.phoneNumber || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="text-gray-400" size={18} />
                    <div>
                      <p className="text-sm text-gray-500">User ID</p>
                      <p className="font-medium text-gray-800">{mentor.id}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Building className="text-gray-400" size={18} />
                    <div>
                      <p className="text-sm text-gray-500">Department</p>
                      <p className="font-medium text-gray-800">
                        {mentor.department || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <GraduationCap size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No mentor assigned to this project</p>
          {project?.mentorId && (
            <p className="text-sm text-gray-400 mt-2">
              Mentor ID: {project.mentorId} (Not found)
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default MentorTab;
