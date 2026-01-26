import React, { useState, useEffect } from "react";
import submissionService from "../../../../../services/apis/submissionApi";
import userService from "../../../../../services/apis/userApi";
import { useNotification } from "../../../../../hook/useNotification";
import {
  FiX,
  FiDownload,
  FiClock,
  FiUser,
  FiFlag,
  FiFileText,
  FiCheckCircle,
  FiXCircle,
  FiStar,
  FiMessageSquare,
  FiCalendar,
} from "react-icons/fi";

const ViewSubmissionPopup = ({ isOpen, onClose, taskId, taskLabel }) => {
  const [submission, setSubmission] = useState(null);
  const [memberName, setMemberName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showNotification } = useNotification();

  // State for review
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({
    decision: "approve",
    feedback: "",
    score: 0,
    extendDeadline: false,
  });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState(null);

  useEffect(() => {
    if (isOpen && taskId) {
      fetchSubmission();
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "";
      setShowReviewForm(false);
      setReviewData({
        decision: "approve",
        feedback: "",
        score: 0,
        extendDeadline: false,
      });
    };
  }, [isOpen, taskId]);

  const fetchSubmission = async () => {
    try {
      setLoading(true);
      setError(null);
      setReviewError(null);

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
      setError("Failed to load submission. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!submission?.id) return;

    if (!reviewData.feedback.trim() && reviewData.decision === "reject") {
      setReviewError("Feedback is required when rejecting a submission");
      return;
    }

    try {
      setReviewLoading(true);
      setReviewError(null);

      const response = await submissionService.reviewSubmission(
        submission.id,
        reviewData,
      );

      if (response.success) {
        showNotification("Submission reviewed successfully", "success");
        await fetchSubmission();
        setShowReviewForm(false);
        setReviewData({
          decision: "approve",
          feedback: "",
          score: 0,
          extendDeadline: false,
        });
      } else {
        showNotification("Failed to review submission", "error");
      }
    } catch (err) {
      console.error("Review error:", err);
      setReviewError(
        err.response?.data?.message ||
          "Failed to submit review. Please try again.",
      );
    } finally {
      setReviewLoading(false);
    }
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusConfig = (status) => {
    const config = {
      Pending: {
        color: "bg-yellow-50 text-yellow-700 border-yellow-200",
        icon: <FiClock className="text-yellow-500" />,
      },
      Approved: {
        color: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: <FiCheckCircle className="text-emerald-500" />,
      },
      Rejected: {
        color: "bg-red-50 text-red-700 border-red-200",
        icon: <FiXCircle className="text-red-500" />,
      },
    };
    return (
      config[status] || {
        color: "bg-gray-50 text-gray-700 border-gray-200",
        icon: null,
      }
    );
  };

  const getGradeColor = (grade) => {
    if (!grade) return "text-gray-600";
    const num = parseInt(grade);
    if (num >= 90) return "text-green-600";
    if (num >= 80) return "text-blue-600";
    if (num >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      {/* Backdrop with blur effect */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl max-h-[85vh] overflow-hidden transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white sticky top-0 z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FiFileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Submission Details
                </h2>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <FiCalendar className="w-3 h-3" />
                  {taskLabel || `Task #${taskId}`}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              aria-label="Close"
            >
              <FiX className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          className="px-6 py-4 overflow-y-auto"
          style={{ maxHeight: "calc(85vh - 140px)" }}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Loading submission details...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <FiXCircle className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-red-600 font-medium mb-2">
                Error Loading Submission
              </p>
              <p className="text-gray-600">{error}</p>
              <button
                onClick={fetchSubmission}
                className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          ) : !submission ? (
            <div className="py-12 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FiFileText className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-700 font-medium mb-2">
                No Submission Found
              </p>
              <p className="text-gray-500">
                There's no submission for this task yet.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Submission Status Banner */}
              <div
                className={`p-4 rounded-lg border ${getStatusConfig(submission.status).color}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusConfig(submission.status).icon}
                    <div>
                      <p className="font-semibold">Submission Status</p>
                      <p className="text-sm opacity-90">
                        Current status of this submission
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusConfig(submission.status).color.split(" ")[0]} ${getStatusConfig(submission.status).color.split(" ")[1]}`}
                  >
                    {submission.status}
                  </span>
                </div>
              </div>

              {/* Submission Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard
                  icon={<FiUser className="w-4 h-4" />}
                  label="Submitted By"
                  value={memberName}
                />
                <InfoCard
                  icon={<FiClock className="w-4 h-4" />}
                  label="Submitted At"
                  value={formatDateTime(submission.submittedAt)}
                />
                <InfoCard
                  icon={<FiFlag className="w-4 h-4" />}
                  label="Version"
                  value={`v${submission.version}`}
                />
                <InfoCard
                  icon={<FiStar className="w-4 h-4" />}
                  label="Final Submission"
                  value={submission.isFinal ? "Yes" : "No"}
                  highlight={submission.isFinal}
                />
              </div>

              {/* Grade & Feedback Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FiStar className="w-5 h-5 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Grade</p>
                      <p
                        className={`text-2xl font-bold ${getGradeColor(submission.grade)}`}
                      >
                        {submission.grade ?? "Not Graded"}
                      </p>
                    </div>
                  </div>
                </div>

                {submission.feedback && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-center space-x-2 mb-2">
                      <FiMessageSquare className="w-4 h-4 text-blue-600" />
                      <p className="font-medium text-blue-900">Feedback</p>
                    </div>
                    <p className="text-blue-800 whitespace-pre-wrap">
                      {submission.feedback}
                    </p>
                  </div>
                )}

                {submission.fileUrl && (
                  <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <FiFileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            Submission File
                          </p>
                          <p className="text-sm text-gray-500">
                            Click to download the submitted file
                          </p>
                        </div>
                      </div>
                      <a
                        href={submission.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                      >
                        <FiDownload className="w-4 h-4" />
                        <span>Download</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Review Form */}
              {showReviewForm && (
                <div className="mt-6 p-5 border border-gray-200 rounded-xl bg-gradient-to-b from-gray-50 to-white">
                  <div className="flex items-center space-x-3 mb-5">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FiStar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Review Submission
                      </h4>
                      <p className="text-sm text-gray-500">
                        Provide feedback and evaluation
                      </p>
                    </div>
                  </div>

                  {reviewError && (
                    <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      {reviewError}
                    </div>
                  )}

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Decision <span className="text-red-500">*</span>
                      </label>
                      <div className="flex space-x-4">
                        <label className="flex-1 cursor-pointer">
                          <input
                            type="radio"
                            value="approve"
                            checked={reviewData.decision === "approve"}
                            onChange={(e) =>
                              setReviewData({
                                ...reviewData,
                                decision: e.target.value,
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="p-4 border-2 rounded-lg text-center transition-all duration-200 peer-checked:border-emerald-500 peer-checked:bg-emerald-50 hover:border-emerald-300">
                            <FiCheckCircle className="w-5 h-5 mx-auto mb-2 text-emerald-500" />
                            <span className="font-medium">Approve</span>
                          </div>
                        </label>
                        <label className="flex-1 cursor-pointer">
                          <input
                            type="radio"
                            value="reject"
                            checked={reviewData.decision === "reject"}
                            onChange={(e) =>
                              setReviewData({
                                ...reviewData,
                                decision: e.target.value,
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="p-4 border-2 rounded-lg text-center transition-all duration-200 peer-checked:border-red-500 peer-checked:bg-red-50 hover:border-red-300">
                            <FiXCircle className="w-5 h-5 mx-auto mb-2 text-red-500" />
                            <span className="font-medium">Reject</span>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Score
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={reviewData.score}
                            onChange={(e) =>
                              setReviewData({
                                ...reviewData,
                                score: parseInt(e.target.value) || 0,
                              })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter score"
                          />
                          <span className="absolute right-3 top-3 text-gray-500">
                            /10
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Feedback
                      </label>
                      <textarea
                        value={reviewData.feedback}
                        onChange={(e) =>
                          setReviewData({
                            ...reviewData,
                            feedback: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows="3"
                        placeholder="Provide constructive feedback..."
                      />
                    </div>

                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <input
                        type="checkbox"
                        id="extendDeadline"
                        checked={reviewData.extendDeadline}
                        onChange={(e) =>
                          setReviewData({
                            ...reviewData,
                            extendDeadline: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label
                        htmlFor="extendDeadline"
                        className="ml-3 text-gray-700"
                      >
                        Extend deadline for resubmission
                      </label>
                    </div>

                    <div className="flex space-x-3 pt-2">
                      <button
                        onClick={handleReviewSubmit}
                        disabled={reviewLoading}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        {reviewLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <FiCheckCircle className="w-4 h-4" />
                            <span>Submit Review</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setShowReviewForm(false)}
                        className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {submission && !showReviewForm && (
          <div className="px-6 py-4 border-t border-gray-100 bg-white sticky bottom-0">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Last updated:{" "}
                {formatDateTime(submission.updatedAt || submission.submittedAt)}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-5 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                {submission.status !== "Approved" && (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center space-x-2"
                  >
                    <FiStar className="w-4 h-4" />
                    <span>Review Submission</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const InfoCard = ({ icon, label, value, highlight = false }) => (
  <div className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
    <div className="flex items-center space-x-3">
      <div
        className={`p-2 rounded-lg ${highlight ? "bg-emerald-50 text-emerald-600" : "bg-gray-50 text-gray-600"}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {label}
        </p>
        <p
          className={`font-medium ${highlight ? "text-emerald-600" : "text-gray-900"}`}
        >
          {value}
        </p>
      </div>
    </div>
  </div>
);

export default ViewSubmissionPopup;
