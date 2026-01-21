import React, { useState, useEffect } from "react";
import submissionService from "../../../../../services/apis/submissionApi";
import userService from "../../../../../services/apis/userApi";

const ViewSubmissionPopup = ({ isOpen, onClose, taskId, taskLabel }) => {
  const [submission, setSubmission] = useState(null);
  const [memberName, setMemberName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && taskId) {
      fetchSubmission();
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, taskId]);

  const fetchSubmission = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await submissionService.getSubmissions({ taskId });
      const data = res?.rawResponse?.data || res;

      if (!data || data.length === 0) {
        setSubmission(null);
        return;
      }

      const sub = data[0];
      setSubmission(sub);

      // Lấy member (fullName)
      if (sub.userId) {
        const userRes = await userService.getCurrentUser(sub.userId);
        setMemberName(userRes?.rawResponse?.data?.fullName || "Unknown member");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load submission");
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (date) => new Date(date).toLocaleString("en-US");

  const getStatusColor = (status) => {
    const map = {
      Pending: "bg-yellow-100 text-yellow-800",
      Approved: "bg-emerald-100 text-emerald-800",
      Rejected: "bg-red-100 text-red-800",
    };
    return map[status] || "bg-gray-100 text-gray-700";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-xl">
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between">
          <div>
            <h3 className="text-lg font-semibold">Submission Detail</h3>
            <p className="text-sm text-gray-500">
              {taskLabel || `Task #${taskId}`}
            </p>
          </div>
          <button onClick={onClose}>✕</button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : !submission ? (
            <p className="text-center text-gray-500">No submission found</p>
          ) : (
            <div className="space-y-4">
              <Info label="Member" value={memberName} />
              <Info
                label="Submitted At"
                value={formatDateTime(submission.submittedAt)}
              />
              <Info
                label="Status"
                value={
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                      submission.status,
                    )}`}
                  >
                    {submission.status}
                  </span>
                }
              />
              <Info label="Version" value={submission.version} />
              <Info
                label="Final Submission"
                value={submission.isFinal ? "Yes" : "No"}
              />
              <Info label="Grade" value={submission.grade ?? "-"} />
              <Info label="Feedback" value={submission.feedback ?? "-"} />

              {submission.fileUrl && (
                <div>
                  <p className="text-sm font-medium mb-1">File</p>
                  <a
                    href={submission.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline"
                  >
                    Download submission file
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div>
    <p className="text-sm text-gray-500">{label}</p>
    <div className="font-medium text-gray-800">{value}</div>
  </div>
);

export default ViewSubmissionPopup;
