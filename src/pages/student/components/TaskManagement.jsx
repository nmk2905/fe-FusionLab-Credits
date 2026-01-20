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
  Award,
  Download,
  Trash2,
  Edit,
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
  NotStarted: "bg-gray-100 text-gray-700",
  InProgress: "bg-blue-100 text-blue-700",
  Submitted: "bg-purple-100 text-purple-700",
  Reviewed: "bg-green-100 text-green-700",
  Late: "bg-red-100 text-red-700",
};

const STATUS_ICONS = {
  NotStarted: <AlertCircle size={16} />,
  InProgress: <Clock size={16} />,
  Submitted: <FileUp size={16} />,
  Reviewed: <CheckCircle2 size={16} />,
  Late: <AlertCircle size={16} className="text-red-600" />,
};

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

  // Get current project (temporary hardcoded)
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

  // Load tasks + submissions
  useEffect(() => {
    if (!projectId) return;

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const milestoneId = 7; // has tasks

        console.log(`[TASKS] Loading tasks for milestoneId = ${milestoneId}`);

        const tasksRes = await taskService.getTasksByMilestone(
          milestoneId,
          1,
          50,
          "Asc"
        );

        console.log("[TASKS] Raw API response:", tasksRes);

        let tasks = [];

        if (tasksRes?.data && Array.isArray(tasksRes.data)) {
          tasks = tasksRes.data;
        } else if (Array.isArray(tasksRes)) {
          tasks = tasksRes;
        } else if (tasksRes?.rawResponse?.data && Array.isArray(tasksRes.rawResponse.data)) {
          tasks = tasksRes.rawResponse.data;
        }

        console.log(`[TASKS] Extracted ${tasks.length} tasks`);

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

    console.log(`[SUBMISSIONS] Checking ${taskIds.length} task(s)`);

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

        console.log(`[SUBMISSION] Response for task ${taskId}:`, res);

        let subs = [];
        if (res?.data && Array.isArray(res.data)) {
          subs = res.data;
        } else if (Array.isArray(res)) {
          subs = res;
        } else if (res?.rawResponse?.data && Array.isArray(res.rawResponse.data)) {
          subs = res.rawResponse.data;
        }

        if (subs.length > 0) {
          const sorted = subs.sort((a, b) =>
            new Date(b.submittedAt) - new Date(a.submittedAt)
          );
          const latest = sorted[0];

          console.log(
            `[SUBMISSION] Latest for task ${taskId}: ` +
              `submittedAt=${latest.submittedAt}, status=${latest.status}, version=${latest.version || "n/a"}`
          );

          setSubmissions((prev) => ({ ...prev, [taskId]: latest }));
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
      console.log(`[FILE] Selected for task ${taskId}: ${file.name}`);
    }
    e.target.value = ""; // Reset input
  };

  const handleSubmitTask = async (taskId) => {
    if (!selectedFile || uploadingTaskId !== taskId) return;

    setUploadStatus((prev) => ({
      ...prev,
      [taskId]: { loading: true, success: false, message: "" },
    }));

    try {
      console.log(`[UPLOAD] Creating new submission for task ${taskId}`);
      const res = await submissionApi.createSubmission({
        taskId,
        userId: user.id,
        file: selectedFile,
      });

      if (res.success || res.status === 201) {
        const newSubmission = res.data || res;
        setSubmissions((prev) => ({
          ...prev,
          [taskId]: newSubmission,
        }));

        setUploadStatus((prev) => ({
          ...prev,
          [taskId]: { loading: false, success: true, message: "Submitted successfully!" },
        }));

        setSelectedFile(null);
        setUploadingTaskId(null);
      } else {
        throw new Error(res.message || "Upload failed");
      }
    } catch (err) {
      console.error("[UPLOAD] Failed:", err);
      setUploadStatus((prev) => ({
        ...prev,
        [taskId]: { loading: false, success: false, message: err.message || "Failed to submit" },
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
      console.log(`[UPDATE] Updating submission ${submission.id} for task ${taskId}`);

      // Assuming backend accepts PUT with multipart/form-data and file replacement
      const formData = new FormData();
      formData.append("File", selectedFile);
      // You can add more fields if backend requires them, e.g.:
      // formData.append("Status", "Submitted");
      // formData.append("Feedback", "");

      const res = await submissionApi.updateSubmission(submission.id, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.success || res.status === 200) {
        const updatedSubmission = res.data || res;

        setSubmissions((prev) => ({
          ...prev,
          [taskId]: updatedSubmission,
        }));

        setUploadStatus((prev) => ({
          ...prev,
          [taskId]: { loading: false, success: true, message: "Submission updated successfully!" },
        }));

        setSelectedFile(null);
        setUploadingTaskId(null);
      } else {
        throw new Error(res.message || "Update failed");
      }
    } catch (err) {
      console.error("[UPDATE] Failed:", err);
      setUploadStatus((prev) => ({
        ...prev,
        [taskId]: { loading: false, success: false, message: err.message || "Failed to update submission" },
      }));
    }
  };

  const handleDeleteSubmission = async (taskId) => {
    const submission = submissions[taskId];
    if (!submission?.id) return;

    if (!window.confirm("Are you sure you want to delete this submission?")) return;

    try {
      console.log(`[DELETE] Deleting submission ${submission.id} for task ${taskId}`);
      await submissionApi.deleteSubmission(submission.id);

      // Remove from local state
      setSubmissions((prev) => {
        const copy = { ...prev };
        delete copy[taskId];
        return copy;
      });

      setUploadStatus((prev) => ({
        ...prev,
        [taskId]: { loading: false, success: true, message: "Submission deleted" },
      }));

      setSelectedFile(null);
      setUploadingTaskId(null);
    } catch (err) {
      console.error("[DELETE] Failed:", err);
      setUploadStatus((prev) => ({
        ...prev,
        [taskId]: { loading: false, success: false, message: "Failed to delete submission" },
      }));
    }
  };

  const allTasks = useMemo(() => {
    return Object.values(tasksByMilestone).flat();
  }, [tasksByMilestone]);

  if (!projectId) {
    return (
      <div className="p-8 text-center text-gray-600">
        <AlertCircle size={48} className="mx-auto mb-4 text-amber-500" />
        <h2 className="text-xl font-semibold">No active project found</h2>
        <p className="mt-2">Please join a project first.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <RefreshCw className="animate-spin h-10 w-10 text-blue-600 mb-4" />
        <p className="text-gray-600">Loading your tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <AlertCircle size={48} className="mx-auto mb-4" />
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ClipboardList size={32} className="text-blue-600" />
            My Tasks
          </h1>
          <p className="text-gray-600 mt-1">
            Project #{projectId} • Current milestone tasks
          </p>
        </div>
      </div>

      {allTasks.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-12 text-center">
          <FileText size={64} className="mx-auto text-gray-300 mb-6" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-3">
            No tasks assigned yet
          </h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Your mentor hasn't created any tasks for the current milestone.
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white">
            <h2 className="text-xl font-semibold flex items-center gap-3">
              <Calendar size={20} />
              Current Milestone Tasks
            </h2>
          </div>

          <div className="divide-y divide-gray-100">
            {allTasks.map((task) => {
              const mappedStatus = STATUS_MAP[task.status] || "NotStarted";
              const submission = submissions[task.id];
              const status = submission?.status || mappedStatus;
              const isUploading = uploadStatus[task.id]?.loading;
              const hasFileSelected = !!selectedFile && uploadingTaskId === task.id;

              return (
                <div key={task.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${STATUS_COLORS[status]}`}>
                          {STATUS_ICONS[status]}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">
                            {task.label || "Untitled Task"}
                          </h3>
                          <p className="text-gray-600 mt-1 line-clamp-2">
                            {task.description || "No description provided."}
                          </p>
                          <div className="flex flex-wrap gap-4 mt-4 text-sm">
                            <div className="flex items-center gap-1.5">
                              <Clock size={16} />
                              <span>
                                Due:{" "}
                                {task.dueDate
                                  ? new Date(task.dueDate).toLocaleDateString()
                                  : "No deadline"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Award size={16} className="text-amber-600" />
                              <span>Weight: {task.weight || "?"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-4 min-w-[240px]">
                      <span
                        className={`px-4 py-1.5 rounded-full text-sm font-medium ${STATUS_COLORS[status]}`}
                      >
                        {status}
                      </span>

                      {submission ? (
                        <div className="w-full text-sm text-gray-600 text-right space-y-2">
                          <p>
                            Submitted: {new Date(submission.submittedAt).toLocaleString()}
                          </p>
                          <p>
                            Status: <strong>{submission.status}</strong>
                          </p>
                          {submission.grade !== null && (
                            <p>Grade: {submission.grade}</p>
                          )}
                          {submission.fileUrl && (
                            <a
                              href={submission.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1 justify-end"
                            >
                              <Download size={16} />
                              View file
                            </a>
                          )}

                          <div className="flex flex-col gap-2 mt-3">
                            {hasFileSelected ? (
                              <div className="flex items-center justify-end gap-3">
                                <span className="text-gray-700 truncate max-w-[180px]">
                                  {selectedFile.name}
                                </span>
                                <button
                                  onClick={() => {
                                    setSelectedFile(null);
                                    setUploadingTaskId(null);
                                  }}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <X size={18} />
                                </button>
                                <button
                                  onClick={() => handleUpdateSubmission(task.id)}
                                  disabled={isUploading}
                                  className={`px-4 py-1.5 rounded text-white text-sm font-medium flex items-center gap-2 ${
                                    isUploading
                                      ? "bg-gray-400 cursor-not-allowed"
                                      : "bg-indigo-600 hover:bg-indigo-700"
                                  }`}
                                >
                                  <Edit size={16} />
                                  {isUploading ? "Updating..." : "Update"}
                                </button>
                              </div>
                            ) : (
                              <div className="flex flex-wrap justify-end gap-3">
                                <label className="cursor-pointer inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800">
                                  <Upload size={18} />
                                  <span>Re-submit</span>
                                  <input
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => handleFileChange(e, task.id)}
                                  />
                                </label>

                                <button
                                  onClick={() => handleDeleteSubmission(task.id)}
                                  className="inline-flex items-center gap-2 text-red-600 hover:text-red-800"
                                >
                                  <Trash2 size={18} />
                                  <span>Delete</span>
                                </button>
                              </div>
                            )}
                          </div>

                          {uploadStatus[task.id]?.message && (
                            <p
                              className={`text-sm ${
                                uploadStatus[task.id]?.success ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {uploadStatus[task.id].message}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="mt-3 text-right">
                          {hasFileSelected && (
                            <div className="mb-3 flex items-center justify-end gap-2">
                              <span className="truncate max-w-[180px] text-gray-700">
                                {selectedFile.name}
                              </span>
                              <button
                                onClick={() => {
                                  setSelectedFile(null);
                                  setUploadingTaskId(null);
                                }}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          )}

                          <label className="cursor-pointer inline-flex items-center gap-2 text-blue-600 hover:text-blue-800">
                            <Upload size={18} />
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
                              className={`ml-3 px-4 py-1.5 rounded text-white text-sm font-medium ${
                                isUploading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                              }`}
                            >
                              {isUploading ? "Uploading..." : "Submit"}
                            </button>
                          )}

                          {uploadStatus[task.id]?.message && (
                            <p
                              className={`mt-2 text-sm ${
                                uploadStatus[task.id]?.success ? "text-green-600" : "text-red-600"
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
        </motion.div>
      )}
    </div>
  );
}