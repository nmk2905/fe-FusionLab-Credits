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
          console.log("[TASKS] Tasks found in response.data (array)");
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
          pageSize: 1,
        });

        console.log(`[SUBMISSION] Response for task ${taskId}:`, res);

        // Robust extraction (similar to tasks)
        let subs = [];
        if (res?.data && Array.isArray(res.data)) {
          subs = res.data;
        } else if (Array.isArray(res)) {
          subs = res;
        }

        if (subs.length > 0) {
          console.log(`[SUBMISSION] Found for task ${taskId}`);
          setSubmissions((prev) => ({ ...prev, [taskId]: subs[0] }));
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
    e.target.value = ""; // Reset for re-select
  };

  const handleSubmitTask = async (taskId) => {
    if (!selectedFile || uploadingTaskId !== taskId) {
      console.log("[UPLOAD] Blocked: no file or wrong task");
      return;
    }

    setUploadStatus((prev) => ({
      ...prev,
      [taskId]: { loading: true, success: false, message: "" },
    }));

    try {
      console.log(`[UPLOAD] Starting for task ${taskId}`);
      const res = await submissionApi.createSubmission({
        taskId,
        userId: user.id,
        file: selectedFile,
      });

      console.log("[UPLOAD] Response:", res);

      if (res.success || res.status === 201) {
        const newSubmission = res.data || res; // Adjust based on wrapper
        setSubmissions((prev) => ({ ...prev, [taskId]: newSubmission }));

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

              return (
                <div
                  key={task.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
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

                    <div className="flex flex-col items-end gap-4 min-w-[220px]">
                      <span
                        className={`px-4 py-1.5 rounded-full text-sm font-medium ${STATUS_COLORS[status]}`}
                      >
                        {status}
                      </span>

                      {submission ? (
                        <div className="mt-2 text-sm text-gray-600 text-right">
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
                              className="text-blue-600 hover:underline flex items-center gap-1 justify-end mt-1"
                            >
                              <Download size={16} />
                              View file
                            </a>
                          )}
                        </div>
                      ) : (
                        <div className="mt-3 text-right">
                          {selectedFile && uploadingTaskId === task.id && (
                            <div className="mb-2 text-sm text-gray-600 flex items-center justify-end gap-2">
                              <span className="truncate max-w-[180px]">{selectedFile.name}</span>
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

                          {selectedFile && uploadingTaskId === task.id && (
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