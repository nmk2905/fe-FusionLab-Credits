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

const COMMENTABLE_STATUSES = ["Approved", "Rejected", "Denied", "Reviewed"];
const FINAL_STATUSES = ["Approved", "Reviewed"]; // These prevent further submissions

const TASKS_PER_PAGE = 2;

export default function TaskManagement({ projectId }) {
  const { user } = useContext(AuthContext);

  const [tasksByMilestone, setTasksByMilestone] = useState({});
  const [submissions, setSubmissions] = useState({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingTaskId, setUploadingTaskId] = useState(null);
  const [uploadStatus, setUploadStatus] = useState({});

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

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
    if (!projectId) return;

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const tasksRes = await taskService.getTasksByMilestone({
          projectId: projectId,
          assigneeId: user?.id,
        });
        console.log(tasksRes);

        let tasks = [];
        if (tasksRes.rawResponse.data) {
          tasks = tasksRes.rawResponse.data;
        }
        if (tasks.length > 0) {
          await loadSubmissionsForTasks(tasks.map((t) => t.id));
        }
        setTasksByMilestone(tasksRes.rawResponse.data);
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
              const hasFileSelected = !!selectedFile && uploadingTaskId === task.id;

              const isCommentable = submission && COMMENTABLE_STATUSES.includes(submission.status);
              const canResubmit = !submission || !FINAL_STATUSES.includes(submission.status);

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
                      {/* Status badge + View Comment button on the same line */}
                      <div className="flex flex-wrap items-center justify-end gap-3 sm:gap-4">
                        <div
                          className={`px-5 py-2 rounded-full text-sm font-semibold border ${STATUS_COLORS[status]} flex items-center gap-2`}
                        >
                          {STATUS_ICONS[status]}
                          {status}
                        </div>

                        {isCommentable && (
                          <button
                            onClick={() => setSelectedSubmission(submission)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-medium transition-colors"
                          >
                            <FileText size={18} />
                            View Comment
                          </button>
                        )}
                      </div>

                      {submission ? (
                        <div className="w-full text-sm text-gray-700 text-right space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                          <p>
                            Submitted:{" "}
                            {new Date(submission.submittedAt).toLocaleString()}
                          </p>

                          {submission.grade !== null && (
                            <p className="font-medium">
                              Grade:{" "}
                              <span className="text-green-600">
                                {submission.grade}
                              </span>
                            </p>
                          )}

                          {submission.fileUrl && (
                            <div className="mt-3">
                              <a
                                href={submission.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-orange-600 hover:text-orange-700 font-medium flex items-center gap-2 justify-end hover:underline"
                              >
                                <Download size={18} />
                                {getFileNameFromUrl(submission.fileUrl)}
                              </a>
                              <div className="mt-2 text-xs text-gray-500 break-all font-mono">
                                {submission.fileUrl}
                              </div>
                            </div>
                          )}

                          {/* Show upload/re-submit/delete only if can resubmit */}
                          {canResubmit && (
                            <div className="flex flex-col gap-3 mt-5">
                              {hasFileSelected ? (
                                <div className="flex items-center justify-end gap-4">
                                  <span className="text-gray-700 truncate max-w-[200px] text-sm">
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
                                  <button
                                    onClick={() => handleUpdateSubmission(task.id)}
                                    disabled={isUploading}
                                    className={`px-6 py-2.5 rounded-xl text-white text-sm font-medium flex items-center gap-2 shadow-md ${
                                      isUploading
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-orange-500 hover:bg-orange-600"
                                    }`}
                                  >
                                    <Edit size={18} />
                                    {isUploading ? "Updating..." : "Update"}
                                  </button>
                                </div>
                              ) : (
                                <div className="flex flex-wrap justify-end gap-4">
                                  <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-xl font-medium transition-colors">
                                    <Upload size={18} />
                                    <span>Re-submit</span>
                                    <input
                                      type="file"
                                      className="hidden"
                                      onChange={(e) =>
                                        handleFileChange(e, task.id)
                                      }
                                    />
                                  </label>

                                  <button
                                    onClick={() =>
                                      handleDeleteSubmission(task.id)
                                    }
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl font-medium transition-colors"
                                  >
                                    <Trash2 size={18} />
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {uploadStatus[task.id]?.message && (
                            <p
                              className={`text-sm mt-3 font-medium ${
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
                        <div className="mt-4 text-right">
                          {hasFileSelected && (
                            <div className="mb-4 flex items-center justify-end gap-3 bg-orange-50 p-3 rounded-xl">
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
                              className={`ml-4 px-6 py-3 rounded-xl text-white font-medium shadow-md ${
                                isUploading
                                  ? "bg-gray-400 cursor-not-allowed"
                                  : "bg-orange-600 hover:bg-orange-700"
                              }`}
                            >
                              {isUploading ? "Uploading..." : "Submit"}
                            </button>
                          )}

                          {uploadStatus[task.id]?.message && (
                            <p
                              className={`mt-4 text-sm font-medium ${
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

          {/* Pagination Controls */}
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
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
          >
            <div className="bg-blue-600 px-6 py-4 text-white flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-3">
                <FileText size={20} />
                Feedback & Score
              </h3>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-white hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-medium text-gray-800 mb-1">Status</h4>
                <p className="text-gray-700">{selectedSubmission.status}</p>
              </div>

              {selectedSubmission.grade !== null && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">Grade / Score</h4>
                  <p className="text-2xl font-bold text-green-600">
                    {selectedSubmission.grade}
                  </p>
                </div>
              )}

              <div>
                <h4 className="font-medium text-gray-800 mb-1">Mentor Comment</h4>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 min-h-[100px] whitespace-pre-wrap">
                  {selectedSubmission.feedback?.trim() ? (
                    <p className="text-gray-800">{selectedSubmission.feedback}</p>
                  ) : (
                    <p className="text-gray-500 italic">No comment provided.</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-medium"
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