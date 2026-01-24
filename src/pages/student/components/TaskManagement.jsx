// src/pages/student/components/TaskManagement.jsx
import React, { useContext, useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ClipboardList,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Upload,
  FileUp,
  X,
  RefreshCw,
  Calendar,
  Download,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { AuthContext } from "../../../contexts/AuthContext";
import taskService from "../../../services/apis/taskApi";
import submissionApi from "../../../services/apis/submissionApi";
import { useNavigate } from "react-router-dom";

const STATUS_MAP = {
  pending: "InProgress",
  Pending: "InProgress",
  string: "NotStarted",
  submitted: "Submitted",
  Submitted: "Submitted",
  reviewed: "Reviewed",
  Reviewed: "Reviewed",
  late: "Late",
  Late: "Late",
  Approved: "Reviewed",
  default: "NotStarted",
};

const STATUS_COLORS = {
  NotStarted: "bg-gray-100 text-gray-700 border border-gray-200",
  InProgress: "bg-orange-100 text-orange-700 border border-orange-200",
  Submitted: "bg-purple-100 text-purple-700 border border-purple-200",
  Reviewed: "bg-green-100 text-green-700 border border-green-200",
  Late: "bg-red-100 text-red-700 border border-red-200",
};

const STATUS_ICONS = {
  NotStarted: <AlertCircle size={18} />,
  InProgress: <Clock size={18} />,
  Submitted: <FileUp size={18} />,
  Reviewed: <CheckCircle2 size={18} />,
  Late: <AlertCircle size={18} className="text-red-600" />,
};

const TASKS_PER_PAGE = 2;

export default function TaskManagement() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [projectId, setProjectId] = useState(null);
  const [tasksByMilestone, setTasksByMilestone] = useState({});
  const [submissions, setSubmissions] = useState({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingTaskId, setUploadingTaskId] = useState(null);
  const [uploadStatus, setUploadStatus] = useState({});

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // Helper: extract filename from Cloudinary URL
  const getFileNameFromUrl = (url) => {
    if (!url) return "Download file";
    try {
      const parts = url.split("/");
      let filename = parts[parts.length - 1];
      filename = filename.split("?")[0];
      filename = filename.split("#")[0];
      return filename || "file";
    } catch {
      return "file";
    }
  };

  useEffect(() => {
    const fetchCurrentProject = async () => {
      if (!user?.id) return;
      try {
        setProjectId(15);
        console.log("[PROJECT] Using temporary projectId = 15");
      } catch (err) {
        console.error("[PROJECT] Failed to get current project", err);
        setError("Cannot determine your current project");
      }
    };
    fetchCurrentProject();
  }, [user?.id]);

  useEffect(() => {
    if (!projectId) return;

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const milestoneId = 7;

        const tasksRes = await taskService.getTasksByMilestone(
          milestoneId,
          1,
          50,
          "Asc",
        );

        let tasks = [];
        if (tasksRes?.data && Array.isArray(tasksRes.data)) {
          tasks = tasksRes.data;
        } else if (Array.isArray(tasksRes)) {
          tasks = tasksRes;
        } else if (
          tasksRes?.rawResponse?.data &&
          Array.isArray(tasksRes.rawResponse.data)
        ) {
          tasks = tasksRes.rawResponse.data;
        }

        setTasksByMilestone((prev) => ({
          ...prev,
          [milestoneId]: tasks,
        }));

        if (tasks.length > 0) {
          await loadSubmissionsForTasks(tasks.map((t) => t.id));
        }
      } catch (err) {
        console.error("[TASKS] Loading failed:", err);
        setError("Failed to load tasks.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [projectId]);

  const loadSubmissionsForTasks = async (taskIds) => {
    if (!user?.id || taskIds.length === 0) return;

    try {
      for (const taskId of taskIds) {
        const res = await submissionApi.getSubmissions({
          userId: user.id,
          taskId,
          pageIndex: 1,
          pageSize: 10,
          sortColumn: "SubmittedAt",
          sortDir: "Desc",
        });

        let subs = [];
        if (res?.data && Array.isArray(res.data)) subs = res.data;
        else if (Array.isArray(res)) subs = res;
        else if (res?.rawResponse?.data && Array.isArray(res.rawResponse.data))
          subs = res.rawResponse.data;

        if (subs.length > 0) {
          const sorted = subs.sort(
            (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt),
          );
          setSubmissions((prev) => ({ ...prev, [taskId]: sorted[0] }));
        }
      }
    } catch (err) {
      console.warn("[SUBMISSIONS] Failed to load", err);
    }
  };

  const handleFileChange = (e, taskId) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadingTaskId(taskId);
    }
    e.target.value = "";
  };

  const handleSubmitTask = async (taskId) => {
    if (!selectedFile || uploadingTaskId !== taskId) return;

    setUploadStatus((prev) => ({
      ...prev,
      [taskId]: { loading: true, success: false, message: "" },
    }));

    try {
      const res = await submissionApi.createSubmission({
        taskId,
        userId: user.id,
        file: selectedFile,
      });

      if (res.success || res.status === 201) {
        const newSubmission = res.data || res;
        setSubmissions((prev) => ({ ...prev, [taskId]: newSubmission }));

        setUploadStatus((prev) => ({
          ...prev,
          [taskId]: {
            loading: false,
            success: true,
            message: "Submitted successfully!",
          },
        }));

        setSelectedFile(null);
        setUploadingTaskId(null);
      } else {
        throw new Error(res.message || "Upload failed");
      }
    } catch (err) {
      setUploadStatus((prev) => ({
        ...prev,
        [taskId]: {
          loading: false,
          success: false,
          message: err.message || "Failed to submit",
        },
      }));
    }
  };

  const handleUpdateSubmission = async (taskId) => {
    const submission = submissions[taskId];
    if (!submission?.id || !selectedFile || uploadingTaskId !== taskId) return;

    setUploadStatus((prev) => ({
      ...prev,
      [taskId]: { loading: true, success: false, message: "" },
    }));

    try {
      const formData = new FormData();
      formData.append("File", selectedFile);

      const res = await submissionApi.updateSubmission(
        submission.id,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (res.success || res.status === 200) {
        const updatedSubmission = res.data || res;
        setSubmissions((prev) => ({ ...prev, [taskId]: updatedSubmission }));

        setUploadStatus((prev) => ({
          ...prev,
          [taskId]: {
            loading: false,
            success: true,
            message: "Updated successfully!",
          },
        }));

        setSelectedFile(null);
        setUploadingTaskId(null);
      } else {
        throw new Error(res.message || "Update failed");
      }
    } catch (err) {
      setUploadStatus((prev) => ({
        ...prev,
        [taskId]: {
          loading: false,
          success: false,
          message: err.message || "Failed to update",
        },
      }));
    }
  };

  const handleDeleteSubmission = async (taskId) => {
    const submission = submissions[taskId];
    if (!submission?.id) return;

    if (!window.confirm("Are you sure you want to delete this submission?"))
      return;

    try {
      await submissionApi.deleteSubmission(submission.id);

      setSubmissions((prev) => {
        const copy = { ...prev };
        delete copy[taskId];
        return copy;
      });

      setUploadStatus((prev) => ({
        ...prev,
        [taskId]: {
          loading: false,
          success: true,
          message: "Deleted successfully",
        },
      }));

      setSelectedFile(null);
      setUploadingTaskId(null);
    } catch (err) {
      setUploadStatus((prev) => ({
        ...prev,
        [taskId]: {
          loading: false,
          success: false,
          message: "Failed to delete",
        },
      }));
    }
  };

  const allTasks = useMemo(
    () => Object.values(tasksByMilestone).flat(),
    [tasksByMilestone],
  );

  const totalPages = Math.ceil(allTasks.length / TASKS_PER_PAGE);
  const paginatedTasks = useMemo(() => {
    const startIndex = (currentPage - 1) * TASKS_PER_PAGE;
    return allTasks.slice(startIndex, startIndex + TASKS_PER_PAGE);
  }, [allTasks, currentPage]);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (!projectId) {
    return (
      <div className="p-8 text-center text-gray-600">
        <AlertCircle size={64} className="mx-auto mb-6 text-orange-500" />
        <h2 className="text-2xl font-bold text-gray-800">No active project</h2>
        <p className="mt-3 text-gray-600">
          Please join a project first to see your tasks.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <RefreshCw className="animate-spin h-12 w-12 text-orange-500 mb-4" />
        <p className="text-lg text-gray-700">Loading your tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <AlertCircle size={64} className="mx-auto mb-6 text-red-500" />
        <h2 className="text-2xl font-bold text-gray-800">Oops!</h2>
        <p className="mt-3 text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-4">
          <ClipboardList size={40} className="text-orange-500" />
          My Tasks
        </h1>
        <p className="mt-2 text-gray-600">
          Project #{projectId} • Current milestone
        </p>
      </div>

      {allTasks.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-gray-100">
          <FileText size={80} className="mx-auto mb-6 text-orange-300" />
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            No tasks yet
          </h2>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            Your mentor hasn’t assigned any tasks for this milestone.
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
        >
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-6 text-white">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Calendar size={24} />
              Current Milestone Tasks
            </h2>
          </div>

          <div className="divide-y divide-gray-100">
            {paginatedTasks.map((task) => {
              const mappedStatus = STATUS_MAP[task.status] || "NotStarted";
              const submission = submissions[task.id];
              const status = submission?.status || mappedStatus;
              const isUploading = uploadStatus[task.id]?.loading;
              const hasFileSelected =
                !!selectedFile && uploadingTaskId === task.id;

              // NEW: Check if submission is final / approved
              const isApproved = submission?.status === "Approved";
              const canEdit = !isApproved && !hasFileSelected;

              return (
                <div
                  key={task.id}
                  className="p-8 hover:bg-orange-50/30 transition-colors duration-200"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
                    <div className="flex-1">
                      <div className="flex items-start gap-5">
                        <div
                          className={`p-4 rounded-2xl ${STATUS_COLORS[status]}`}
                        >
                          {STATUS_ICONS[status]}
                        </div>
                        <div>
                          <h3 className="font-bold text-xl text-gray-900 mb-2">
                            {task.label || "Untitled Task"}
                          </h3>
                          <p className="text-gray-600 leading-relaxed line-clamp-3">
                            {task.description || "No description provided."}
                          </p>
                          <div className="flex flex-wrap gap-6 mt-5 text-sm">
                            <div className="flex items-center gap-2 text-gray-700">
                              <Clock size={18} className="text-orange-500" />
                              <span>
                                Due:{" "}
                                {task.dueDate
                                  ? new Date(task.dueDate).toLocaleDateString(
                                      "en-GB",
                                    )
                                  : "No deadline"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-5 min-w-[280px]">
                      <div
                        className={`px-5 py-2 rounded-full text-sm font-semibold border ${STATUS_COLORS[status]} flex items-center gap-2`}
                      >
                        {STATUS_ICONS[status]}
                        {status}
                      </div>

                      {submission ? (
                        <div className="w-full text-sm text-gray-700 text-right space-y-4 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                          <div className="space-y-1">
                            <p>
                              Submitted:{" "}
                              {new Date(
                                submission.submittedAt,
                              ).toLocaleString()}
                            </p>
                            <p>
                              Status:{" "}
                              <strong className="text-orange-600">
                                {submission.status}
                              </strong>
                            </p>
                            {submission.grade !== null && (
                              <p className="font-medium">
                                Grade:{" "}
                                <span className="text-green-600">
                                  {submission.grade}
                                </span>
                              </p>
                            )}
                          </div>

                          {submission.fileUrl && (
                            <div className="mt-2">
                              <a
                                href={submission.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-orange-600 hover:text-orange-700 font-medium flex items-center gap-2 justify-end hover:underline"
                              >
                                <Download size={18} />
                                {getFileNameFromUrl(submission.fileUrl)}
                              </a>
                              <div className="mt-1 text-xs text-gray-500 break-all font-mono">
                                {submission.fileUrl}
                              </div>
                            </div>
                          )}

                          {/* Action buttons */}
                          {!hasFileSelected && (
                            <div className="flex flex-wrap justify-end gap-3 mt-4">
                              {submission.grade !== null && (
                                <button
                                  onClick={() =>
                                    setSelectedSubmission(submission)
                                  }
                                  className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
                                >
                                  <CheckCircle2 size={16} />
                                  View Score
                                </button>
                              )}

                              {canEdit && (
                                <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-xl font-medium transition-colors">
                                  <Upload size={16} />
                                  <span>Re-submit</span>
                                  <input
                                    type="file"
                                    className="hidden"
                                    onChange={(e) =>
                                      handleFileChange(e, task.id)
                                    }
                                  />
                                </label>
                              )}

                              {canEdit && (
                                <button
                                  onClick={() =>
                                    handleDeleteSubmission(task.id)
                                  }
                                  className="inline-flex items-center gap-2 px-5 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl font-medium transition-colors"
                                >
                                  <Trash2 size={16} />
                                  Delete
                                </button>
                              )}
                            </div>
                          )}

                          {/* When user selected new file to re-submit */}
                          {hasFileSelected && (
                            <div className="flex flex-wrap justify-end gap-3 mt-4">
                              <div className="flex items-center gap-3 bg-orange-50 px-4 py-2 rounded-xl">
                                <span className="text-gray-700 truncate max-w-[160px] text-sm">
                                  {selectedFile.name}
                                </span>
                                <button
                                  onClick={() => {
                                    setSelectedFile(null);
                                    setUploadingTaskId(null);
                                  }}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <X size={18} />
                                </button>
                              </div>

                              <button
                                onClick={() => handleUpdateSubmission(task.id)}
                                disabled={isUploading}
                                className={`px-5 py-2 rounded-xl text-white text-sm font-medium flex items-center gap-2 shadow-sm min-w-[110px] justify-center ${
                                  isUploading
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-orange-500 hover:bg-orange-600"
                                }`}
                              >
                                <Edit size={16} />
                                {isUploading ? "Updating..." : "Update"}
                              </button>
                            </div>
                          )}

                          {uploadStatus[task.id]?.message && (
                            <p
                              className={`text-sm mt-2 font-medium text-center ${
                                uploadStatus[task.id]?.success
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {uploadStatus[task.id].message}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="mt-4 text-right space-y-4">
                          {hasFileSelected && (
                            <div className="flex items-center justify-end gap-3 bg-orange-50 p-3 rounded-xl">
                              <span className="text-gray-700 truncate max-w-[200px]">
                                {selectedFile.name}
                              </span>
                              <button
                                onClick={() => {
                                  setSelectedFile(null);
                                  setUploadingTaskId(null);
                                }}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X size={20} />
                              </button>
                            </div>
                          )}

                          <div className="flex justify-end gap-3">
                            <label className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium shadow-md transition-all">
                              <Upload size={20} />
                              <span>Choose file</span>
                              <input
                                type="file"
                                className="hidden"
                                onChange={(e) => handleFileChange(e, task.id)}
                              />
                            </label>

                            {hasFileSelected && (
                              <button
                                onClick={() => handleSubmitTask(task.id)}
                                disabled={isUploading}
                                className={`px-6 py-3 rounded-xl text-white font-medium shadow-md ${
                                  isUploading
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-orange-600 hover:bg-orange-700"
                                }`}
                              >
                                {isUploading ? "Uploading..." : "Submit"}
                              </button>
                            )}
                          </div>

                          {uploadStatus[task.id]?.message && (
                            <p
                              className={`mt-3 text-sm font-medium ${
                                uploadStatus[task.id]?.success
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {uploadStatus[task.id].message}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-6 py-6 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-colors ${
                  currentPage === 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                }`}
              >
                <ChevronLeft size={20} />
                Previous
              </button>

              <span className="text-gray-700 font-medium">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-colors ${
                  currentPage === totalPages
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                }`}
              >
                Next
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Feedback Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
          >
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-5 text-white">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-3">
                  <CheckCircle2 size={24} />
                  Submission Feedback
                </h3>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-white/80 hover:text-white"
                >
                  <X size={28} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between bg-gray-50 p-5 rounded-xl">
                <span className="text-gray-700 font-semibold text-lg">
                  Score / Grade:
                </span>
                <span className="text-3xl font-bold text-green-700">
                  {selectedSubmission.grade}
                </span>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-3 text-lg">
                  Mentor Feedback:
                </h4>
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 min-h-[120px] whitespace-pre-wrap text-gray-800 leading-relaxed">
                  {selectedSubmission.feedback || (
                    <span className="text-gray-400 italic">
                      No feedback provided yet.
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
