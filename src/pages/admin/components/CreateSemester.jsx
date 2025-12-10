import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  BookOpen,
  Users,
  Plus,
  Trash2,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import semesterService from "../../../services/apis/semesterApi";
import { useNotification } from "../../../hook/useNotification";

export default function CreateSemester() {
  const [semesterData, setSemesterData] = useState({
    name: "",
    academicYear: "",
    startDate: "",
    endDate: "",
    registrationStart: "",
    registrationEnd: "",
  });

  const [existingSemesters, setExistingSemesters] = useState([]);
  const { showNotification } = useNotification();
  console.log(existingSemesters);
  
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [minStartDate, setMinStartDate] = useState("");

  // Fetch existing semesters when component mounts
  useEffect(() => {
    fetchExistingSemesters();
  }, []);

  const fetchExistingSemesters = async () => {
    try {
      setIsLoading(true);
      const response = await semesterService.getCurrentSemester();
      const semesters = response?.rawResponse?.data || [];

      console.log("Fetched semesters:", semesters);

      setExistingSemesters(semesters);

      // Find the minimum start date (the day after the latest semester's end date)
      const latestEndDate = findLatestEndDate(semesters);
      if (latestEndDate) {
        // Add 1 day to avoid overlap
        const nextDay = new Date(latestEndDate);
        nextDay.setDate(nextDay.getDate() + 1);
        setMinStartDate(nextDay.toISOString().split("T")[0]);
      }
    } catch (error) {
      console.error("Error fetching semesters:", error);
      setErrorMessage("Cannot load existing semester information");
    } finally {
      setIsLoading(false);
    }
  };

  const findLatestEndDate = (semesters) => {
    // Handle case where semesters might be null, undefined, or not an array
    if (!Array.isArray(semesters) || semesters.length === 0) {
      return null;
    }

    try {
      // Find the semester with the latest end date
      const sorted = [...semesters].sort(
        (a, b) => new Date(b.endDate) - new Date(a.endDate)
      );

      return sorted[0]?.endDate || null;
    } catch (error) {
      console.error("Error in findLatestEndDate:", error);
      return null;
    }
  };

  const checkDateOverlap = (newStartDate, newEndDate) => {
    if (!Array.isArray(existingSemesters) || existingSemesters.length === 0) {
      return false;
    }

    const newStart = new Date(newStartDate);
    const newEnd = new Date(newEndDate);

    // Check if there's any semester with overlapping dates
    return existingSemesters.some((semester) => {
      const existingStart = new Date(semester.startDate);
      const existingEnd = new Date(semester.endDate);

      // Check for overlap
      return (
        (newStart >= existingStart && newStart <= existingEnd) ||
        (newEnd >= existingStart && newEnd <= existingEnd) ||
        (newStart <= existingStart && newEnd >= existingEnd)
      );
    });
  };

  const getAvailableDateRange = () => {
    if (!Array.isArray(existingSemesters) || existingSemesters.length === 0) {
      return {
        minStart: "",
        message: "You can create a new semester at any time",
      };
    }

    const latestEndDate = findLatestEndDate(existingSemesters);
    if (!latestEndDate) {
      return { minStart: "", message: "" };
    }

    const nextAvailableDate = new Date(latestEndDate);
    nextAvailableDate.setDate(nextAvailableDate.getDate() + 1);

    return {
      minStart: nextAvailableDate.toISOString().split("T")[0],
      message: `Earliest start date: ${nextAvailableDate.toLocaleDateString(
        "en-US"
      )}`,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if dates are filled
    if (!semesterData.startDate || !semesterData.endDate) {
      setErrorMessage("Please fill in all required dates");
      return;
    }

    // Check start and end dates
    const startDate = new Date(semesterData.startDate);
    const endDate = new Date(semesterData.endDate);

    if (startDate >= endDate) {
      setErrorMessage("Start date must be before end date");
      return;
    }

    // Check overlap with existing semesters
    if (checkDateOverlap(semesterData.startDate, semesterData.endDate)) {
      setErrorMessage("This time period overlaps with an existing semester");
      return;
    }

    // Check registration dates if provided
    if (semesterData.registrationStart && semesterData.registrationEnd) {
      const regStart = new Date(semesterData.registrationStart);
      const regEnd = new Date(semesterData.registrationEnd);
      if (regStart >= regEnd) {
        setErrorMessage("Registration period is invalid");
        return;
      }
    }

    try {
      setIsLoading(true);
      setErrorMessage("");

      // Prepare data to send to API
      const dataToSend = {
        name: semesterData.name,
        keywordTheme: semesterData.academicYear,
        startDate: new Date(semesterData.startDate).toISOString(),
        endDate: new Date(semesterData.endDate).toISOString(),
        status: "active",
      };

      // Call API to create semester
      await semesterService.addSemester(dataToSend);

      showNotification("Semester created successfully!", "success");

      // Reset form
      setSemesterData({
        name: "",
        academicYear: "",
        startDate: "",
        endDate: "",
        registrationStart: "",
        registrationEnd: "",
      });

      // Refresh semester list
      await fetchExistingSemesters();
    } catch (error) {
      console.error("Error creating semester:", error);
      setErrorMessage(
        error.response?.data?.message ||
          "An error occurred while creating the semester"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSemesterData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error message when user changes date
    if (name === "startDate" || name === "endDate") {
      setErrorMessage("");
    }
  };

  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;

    // Check if start date is earlier than minimum allowed date
    const dateRange = getAvailableDateRange();
    if (dateRange.minStart && newStartDate < dateRange.minStart) {
      setErrorMessage(
        `Start date must be after ${new Date(
          dateRange.minStart
        ).toLocaleDateString("en-US")}`
      );
    } else {
      setErrorMessage("");
    }

    setSemesterData((prev) => ({
      ...prev,
      startDate: newStartDate,
    }));
  };

  const getSemesterStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
      return {
        text: "Upcoming",
        color: "bg-yellow-100 text-yellow-800",
      };
    } else if (now >= start && now <= end) {
      return {
        text: "Ongoing",
        color: "bg-green-100 text-green-800",
      };
    } else {
      return {
        text: "Completed",
        color: "bg-gray-100 text-gray-800",
      };
    }
  };

  const dateRange = getAvailableDateRange();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Create New Semester
        </h1>
        <p className="text-gray-600">
          Create a new semester and view existing ones
        </p>
      </div>

      {/* Display existing semester information */}
      {existingSemesters.length > 0 && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
            <AlertCircle className="mr-2" size={20} />
            Existing Semester Information
          </h3>
          <p className="text-blue-700 mb-2">
            There are {existingSemesters.length} semesters in the system.
            {dateRange.message && ` ${dateRange.message}`}
          </p>
        </div>
      )}

      {/* Display loading state */}
      {isLoading && existingSemesters.length === 0 && (
        <div className="mb-6 bg-gray-50 border border-gray-200 rounded-xl p-4">
          <p className="text-gray-700">Loading semester information...</p>
        </div>
      )}

      {/* Display error message */}
      {errorMessage && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-700 flex items-center">
            <AlertCircle className="mr-2" size={20} />
            {errorMessage}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Semester Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Calendar className="mr-2" size={20} />
              Semester Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Semester Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={semesterData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Semester 1 Academic Year 2023-2024"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Academic Year *
                </label>
                <input
                  type="text"
                  name="academicYear"
                  value={semesterData.academicYear}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 2023-2024"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Clock className="mr-2" size={20} />
              Semester Timeline
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={semesterData.startDate}
                    onChange={handleStartDateChange}
                    min={dateRange.minStart}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={isLoading}
                  />
                  {dateRange.minStart && (
                    <p className="text-xs text-gray-500 mt-1">
                      Earliest date:{" "}
                      {new Date(dateRange.minStart).toLocaleDateString("en-US")}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={semesterData.endDate}
                    onChange={handleChange}
                    min={semesterData.startDate || undefined}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              
            </div>
          </div>
        </div>

        {/* Existing Semesters List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <BookOpen className="mr-2" size={20} />
            Current Semesters in System
          </h2>

          {/* Existing Semesters Table */}
          {existingSemesters.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Semester Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Academic Year
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Start Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      End Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Duration
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {existingSemesters.map((semester, index) => {
                    const status = getSemesterStatus(
                      semester.startDate,
                      semester.endDate
                    );
                    const startDate = new Date(semester.startDate);
                    const endDate = new Date(semester.endDate);
                    const durationDays = Math.ceil(
                      (endDate - startDate) / (1000 * 60 * 60 * 24)
                    );

                    return (
                      <tr key={semester.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {semester.id}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <div className="font-medium">{semester.name}</div>
                          {semester.keywordTheme && (
                            <div className="text-xs text-gray-500 mt-1">
                              Theme: {semester.keywordTheme}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {semester.keywordTheme || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {startDate.toLocaleDateString("en-US")}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {endDate.toLocaleDateString("en-US")}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-3 py-1 ${status.color} rounded-full text-xs font-medium`}
                          >
                            {status.text}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {durationDays} days
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-lg font-medium mb-2">No semesters found</p>
              <p className="text-sm">
                Create your first semester using the form above.
              </p>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Create Semester</h3>
              <p className="text-gray-600">Confirm creation of new semester</p>
            </div>
            <div className="space-x-4">
              <button
                type="button"
                onClick={() => {
                  setSemesterData({
                    name: "",
                    academicYear: "",
                    startDate: "",
                    endDate: "",
                    registrationStart: "",
                    registrationEnd: "",
                  });
                  setErrorMessage("");
                }}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                disabled={isLoading}
              >
                Clear Form
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Create Semester"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
