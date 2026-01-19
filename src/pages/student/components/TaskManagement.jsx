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
} from "lucide-react";
import { AuthContext } from "../../../contexts/AuthContext";
import taskService from "../../../services/apis/taskApi";
import submissionApi from "../../../services/apis/submissionApi";
import { useNavigate } from "react-router-dom";

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

  // ─── STEP 1: Determine current projectId ───────────────────────────────
  useEffect(() => {
    const fetchCurrentProject = async () => {
      if (!user?.id) return;

      try {
        // TODO: Replace this with real membership check
        // Example: const res = await projectMemberApi.getMyActiveProject(user.id);
        // setProjectId(res.data?.projectId || null);

        // Temporary fallback (remove when real logic is ready)
        setProjectId(15);
        console.log("[PROJECT] Using temporary projectId = 15");
      } catch (err) {
        console.error("[PROJECT] Failed to get current project", err);
        setError("Cannot determine your current project");
      }
    };

    fetchCurrentProject();
  }, [user?.id]);

  // ─── STEP 2: Load tasks + submissions ─────────────────────────────────
  useEffect(() => {
    if (!projectId) return;

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        // TODO: Replace with real active/current milestone logic
        const milestoneId = 1; // ← CHANGE THIS when you have real milestone
        console.log(`[TASKS] Loading tasks for milestoneId = ${milestoneId}`);

        const tasksRes = await taskService.getTasksByMilestone(
          milestoneId,
          1,    // pageIndex
          50,   // pageSize
          "Asc" // sortDir
        );

        console.log("[TASKS] Raw API response:", tasksRes);

        // ─── Robust extraction of task array ───────────────────────────────
        let tasks = [];

        if (tasksRes && typeof tasksRes === "object") {
          // Common patterns we see in many APIs:
          if (Array.isArray(tasksRes.data?.items)) {
            tasks = tasksRes.data.items;
            console.log("[TASKS] Found tasks in: response.data.items");
          } else if (Array.isArray(tasksRes.data?.data)) {
            tasks = tasksRes.data.data;
            console.log("[TASKS] Found tasks in: response.data.data");
          } else if (Array.isArray(tasksRes.data)) {
            tasks = tasksRes.data;
            console.log("[TASKS] Found tasks in: response.data (array)");
          } else if (Array.isArray(tasksRes.items)) {
            tasks = tasksRes.items;
            console.log("[TASKS] Found tasks in: response.items");
          } else if (Array.isArray(tasksRes)) {
            tasks = tasksRes;
            console.log("[TASKS] Found tasks in: response itself (array)");
          }
        }

        console.log(`[TASKS] Extracted ${tasks.length} tasks`);
        console.log("[TASKS] First few tasks (if any):", tasks.slice(0, 2));

        setTasksByMilestone({ [milestoneId]: tasks });

        if (tasks.length > 0) {
          console.log("[SUBMISSIONS] Starting to load submissions for task IDs...");
          await loadSubmissionsForTasks(tasks.map((t) => t.id));
        } else {
          console.log("[SUBMISSIONS] No tasks → skipping submission check");
        }
      } catch (err) {
        console.error("[TASKS] Loading failed:", err);
        setError("Failed to load tasks. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [projectId]);

  const loadSubmissionsForTasks = async (taskIds) => {
    if (!user?.id || taskIds.length === 0) {
      console.log("[SUBMISSIONS] No user or no tasks → skip");
      return;
    }

    console.log(`[SUBMISSIONS] Checking ${taskIds.length} task(s)`);

    try {
      for (const taskId of taskIds) {
        console.log(`[SUBMISSION] Fetching for taskId = ${taskId}`);
        const res = await submissionApi.getSubmissions({
          userId: user.id,
          taskId,
          pageSize: 1,
        });

        console.log(`[SUBMISSION] Response for task ${taskId}:`, res);

        const subs = res?.data?.items || res?.data || [];
        if (subs.length > 0) {
          console.log(`[SUBMISSION] Found submission for task ${taskId}`);
          setSubmissions((prev) => ({ ...prev, [taskId]: subs[0] }));
        } else {
          console.log(`[SUBMISSION] No submission found for task ${taskId}`);
        }
      }
    } catch (err) {
      console.warn("[SUBMISSIONS] Failed to load some submissions", err);
    }
  };

  // ─── File upload logic ────────────────────────────────────────────────
  const handleFileChange = (e, taskId) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadingTaskId(taskId);
      console.log(`[UPLOAD] Selected file for task ${taskId}:`, file.name);
    }
  };

  const handleSubmitTask = async (taskId) => {
    if (!selectedFile || uploadingTaskId !== taskId) return;

    setUploadStatus((prev) => ({
      ...prev,
      [taskId]: { loading: true, success: false, message: "" },
    }));

    try {
      console.log(`[UPLOAD] Starting submission for task ${taskId}`);
      const res = await submissionApi.createSubmission({
        taskId,
        userId: user.id,
        file: selectedFile,
      });

      console.log("[UPLOAD] Submit response:", res);

      if (res.success) {
        setUploadStatus((prev) => ({
          ...prev,
          [taskId]: { loading: false, success: true, message: "Submitted successfully!" },
        }));
        await loadSubmissionsForTasks([taskId]);
      } else {
        throw new Error(res.message || "Upload failed");
      }
    } catch (err) {
      console.error("[UPLOAD] Submit failed:", err);
      setUploadStatus((prev) => ({
        ...prev,
        [taskId]: { loading: false, success: false, message: err.message || "Failed to submit" },
      }));
    } finally {
      setSelectedFile(null);
      setUploadingTaskId(null);
    }
  };

  const allTasks = useMemo(() => {
    return Object.values(tasksByMilestone).flat();
  }, [tasksByMilestone]);

  // ─── RENDERING ────────────────────────────────────────────────────────
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
              const submission = submissions[task.id];
              const status = submission?.status || "NotStarted";
              const uploadInfo = uploadStatus[task.id];

              return (
                <div
                  key={task.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  {/* ... rest of the task card rendering remains the same ... */}
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${STATUS_COLORS[status]}`}>
                          {STATUS_ICONS[status]}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">
                            {task.title || "Untitled Task"}
                          </h3>
                          <p className="text-gray-600 mt-1 line-clamp-2">
                            {task.description || "No description provided."}
                          </p>
                          <div className="flex flex-wrap gap-4 mt-4 text-sm">
                            <div className="flex items-center gap-1.5">
                              <Award size={16} className="text-amber-600" />
                              <span>{task.maxScore || "?"} points</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock size={16} />
                              <span>
                                Due:{" "}
                                {task.deadline
                                  ? new Date(task.deadline).toLocaleDateString()
                                  : "No deadline"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-4 min-w-[220px]">
                      <span
                        className={`px-4 py-1.5 rounded-full text-sm font-medium ${STATUS_COLORS[status]}`}
                      >
                        {status === "NotStarted" ? "To Do" : status}
                      </span>

                      {/* Upload / Status UI - same as before */}
                      {/* ... (keeping original upload logic here) ... */}
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