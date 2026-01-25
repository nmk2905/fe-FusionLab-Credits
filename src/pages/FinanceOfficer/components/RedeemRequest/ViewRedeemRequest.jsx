import React, { useState, useEffect } from "react";
import redeemRequestService from "../../../../services/apis/redeemRequestApi";
import rewardItemService from "../../../../services/apis/rewardItemApi";
import userService from "../../../../services/apis/userApi";
import {
  Search,
  Filter,
  Calendar,
  User,
  Gift,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  Package,
  XCircle,
  Check,
  X,
  PackageCheck,
} from "lucide-react";
import { useNotification } from "../../../../hook/useNotification";

const ViewRedeemRequests = () => {
  const [redeemRequests, setRedeemRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userDetails, setUserDetails] = useState({});
  const [rewardDetails, setRewardDetails] = useState({});
  const [filters, setFilters] = useState({
    pageIndex: 1,
    pageSize: 1000,
    status: "all",
    sortDir: "Desc",
  });
  const [updatingId, setUpdatingId] = useState(null); // Track which request is being updated
  const { showNotification } = useNotification();

  // Fetch redeem requests
  const fetchRedeemRequests = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await redeemRequestService.getAllRedeemRequests(filters);
      const requests = response?.rawResponse?.data || [];
      setRedeemRequests(requests);

      // Fetch additional details for each request
      fetchAdditionalDetails(requests);
    } catch (err) {
      setError("Failed to load redeem requests data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user and reward details
  const fetchAdditionalDetails = async (requests) => {
    const userIds = [...new Set(requests.map((r) => r.userId))];
    const rewardIds = [...new Set(requests.map((r) => r.rewardItemId))];

    try {
      // Fetch user details
      const userPromises = userIds.map((id) =>
        userService.getCurrentUser(id).catch(() => null),
      );
      const userResults = await Promise.all(userPromises);

      const userMap = {};
      userResults.forEach((result, index) => {
        if (result?.data) {
          userMap[userIds[index]] = result.data.fullName || "Unknown User";
        }
      });
      setUserDetails(userMap);

      // Fetch reward details
      const rewardPromises = rewardIds.map((id) =>
        rewardItemService.getRewardItemById(id).catch(() => null),
      );
      const rewardResults = await Promise.all(rewardPromises);

      const rewardMap = {};
      rewardResults.forEach((result, index) => {
        if (result?.data) {
          rewardMap[rewardIds[index]] = result.data.name || "Unknown Reward";
        }
      });
      setRewardDetails(rewardMap);
    } catch (err) {
      console.error("Failed to fetch additional details:", err);
    }
  };

  // Handle status update
  const handleUpdateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      // Prepare the data object
      const data = { status };

      // Call the API
      const response = await redeemRequestService.updateRedeemRequestStatus(
        id,
        data,
      );

      if (response.success) {
        showNotification(`Request ${id} updated to ${status}`, "success");
      } else {
        showNotification(`Failed to update request ${id}`, "error");
      }

      // Refresh the data
      fetchRedeemRequests();

      // Optional: Show success message
      setError(null);
      console.log(`Request ${id} updated to ${status}`);
    } catch (err) {
      setError(`Failed to update request status: ${err.message}`);
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Handle mark as collected
  const handleMarkAsCollected = async (id) => {
    setUpdatingId(id);
    try {
      // Call the API
      const response = await redeemRequestService.markAsCollected(id);

      if (response.success) {
        showNotification(`Request ${id} marked as collected`, "success");
      } else {
        showNotification(`Failed to mark request ${id} as collected`, "error");
      }

      // Refresh the data
      fetchRedeemRequests();

      // Optional: Show success message
      setError(null);
      console.log(`Request ${id} marked as collected`);
    } catch (err) {
      setError(`Failed to mark request as collected: ${err.message}`);
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    fetchRedeemRequests();
  }, [filters.pageIndex, filters.pageSize, filters.sortDir, filters.status]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      pageIndex: 1,
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not processed";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Pending: {
        bg: "bg-yellow-50",
        text: "text-yellow-700",
        border: "border-yellow-200",
        dot: "bg-yellow-400",
        icon: Clock,
      },
      Approved: {
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-green-200",
        dot: "bg-green-400",
        icon: CheckCircle,
      },
      PickedUp: {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
        dot: "bg-blue-400",
        icon: Package,
      },
      Rejected: {
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
        dot: "bg-red-400",
        icon: XCircle,
      },
    };

    const config = statusConfig[status] || {
      bg: "bg-gray-50",
      text: "text-gray-700",
      border: "border-gray-200",
      dot: "bg-gray-400",
      icon: Clock,
    };

    const IconComponent = config.icon;

    return (
      <div
        className={`inline-flex items-center px-3 py-1.5 rounded-full border ${config.bg} ${config.text} ${config.border}`}
      >
        <IconComponent size={14} className="mr-2" />
        <span className="text-sm font-medium">{status}</span>
      </div>
    );
  };

  const getStatusCount = (status) => {
    if (status === "all") return redeemRequests.length;
    return redeemRequests.filter((r) => r.status === status).length;
  };

  if (loading && filters.pageIndex === 1) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading redeem requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Redeem Requests Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage and track user reward redemption requests
          </p>
        </div>
        <button
          onClick={fetchRedeemRequests}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Status Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        {/* All Requests Card */}
        <div
          onClick={() => handleFilterChange("status", "all")}
          className={`bg-white p-4 rounded-xl shadow-sm border cursor-pointer transition-all hover:scale-[1.02] ${
            filters.status === "all"
              ? "border-blue-500 ring-2 ring-blue-100"
              : "border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-2xl font-bold text-gray-900">
              {getStatusCount("all")}
            </div>
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Filter size={16} className="text-gray-600" />
            </div>
          </div>
          <div className="text-gray-600 text-sm">Total Requests</div>
          {filters.status === "all" && (
            <div className="mt-2 text-xs text-blue-600 font-medium">
              • Active filter
            </div>
          )}
        </div>

        {/* Pending Card */}
        <div
          onClick={() => handleFilterChange("status", "Pending")}
          className={`bg-white p-4 rounded-xl shadow-sm border cursor-pointer transition-all hover:scale-[1.02] ${
            filters.status === "Pending"
              ? "border-yellow-500 ring-2 ring-yellow-100"
              : "border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-2xl font-bold text-yellow-600">
              {getStatusCount("Pending")}
            </div>
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock size={16} className="text-yellow-600" />
            </div>
          </div>
          <div className="text-gray-600 text-sm">Pending</div>
          {filters.status === "Pending" && (
            <div className="mt-2 text-xs text-yellow-600 font-medium">
              • Active filter
            </div>
          )}
        </div>

        {/* Approved Card */}
        <div
          onClick={() => handleFilterChange("status", "Approved")}
          className={`bg-white p-4 rounded-xl shadow-sm border cursor-pointer transition-all hover:scale-[1.02] ${
            filters.status === "Approved"
              ? "border-green-500 ring-2 ring-green-100"
              : "border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-2xl font-bold text-green-600">
              {getStatusCount("Approved")}
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle size={16} className="text-green-600" />
            </div>
          </div>
          <div className="text-gray-600 text-sm">Approved</div>
          {filters.status === "Approved" && (
            <div className="mt-2 text-xs text-green-600 font-medium">
              • Active filter
            </div>
          )}
        </div>

        {/* Picked Up Card */}
        <div
          onClick={() => handleFilterChange("status", "PickedUp")}
          className={`bg-white p-4 rounded-xl shadow-sm border cursor-pointer transition-all hover:scale-[1.02] ${
            filters.status === "PickedUp"
              ? "border-blue-500 ring-2 ring-blue-100"
              : "border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-2xl font-bold text-blue-600">
              {getStatusCount("PickedUp")}
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package size={16} className="text-blue-600" />
            </div>
          </div>
          <div className="text-gray-600 text-sm">Picked Up</div>
          {filters.status === "PickedUp" && (
            <div className="mt-2 text-xs text-blue-600 font-medium">
              • Active filter
            </div>
          )}
        </div>

        {/* Rejected Card */}
        <div
          onClick={() => handleFilterChange("status", "Rejected")}
          className={`bg-white p-4 rounded-xl shadow-sm border cursor-pointer transition-all hover:scale-[1.02] ${
            filters.status === "Rejected"
              ? "border-red-500 ring-2 ring-red-100"
              : "border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-2xl font-bold text-red-600">
              {getStatusCount("Rejected")}
            </div>
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle size={16} className="text-red-600" />
            </div>
          </div>
          <div className="text-gray-600 text-sm">Rejected</div>
          {filters.status === "Rejected" && (
            <div className="mt-2 text-xs text-red-600 font-medium">
              • Active filter
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Request ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Reward Item
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {redeemRequests.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Gift className="text-gray-400" size={24} />
                      </div>
                      <p className="text-gray-900 font-medium">
                        No redeem requests found
                      </p>
                      <p className="text-gray-600 text-sm mt-1">
                        Try adjusting your filters or check back later
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                redeemRequests.map((request) => (
                  <tr
                    key={request.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">#</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            #{request.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <User size={16} className="text-purple-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {userDetails[request.userId] || "Loading..."}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {request.userId}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <Gift size={16} className="text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {rewardDetails[request.rewardItemId] ||
                              "Loading..."}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {request.rewardItemId}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">Quantity:</span>
                          <span className="font-medium">
                            {request.quantity}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">Total Points:</span>
                          <span className="font-medium text-blue-600">
                            {request.totalPoints} pts
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {getStatusBadge(request.status)}
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <Calendar
                            size={14}
                            className="text-gray-400 mt-0.5"
                          />
                          <div>
                            <div className="text-sm font-medium">Requested</div>
                            <div className="text-sm text-gray-500">
                              {formatDate(request.requestedAt)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Calendar
                            size={14}
                            className="text-gray-400 mt-0.5"
                          />
                          <div>
                            <div className="text-sm font-medium">Processed</div>
                            <div className="text-sm text-gray-500">
                              {formatDate(request.processedAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        {/* Show Approve/Reject buttons for Pending status */}
                        {request.status === "Pending" && (
                          <>
                            {/* Approve Button */}
                            <button
                              onClick={() =>
                                handleUpdateStatus(request.id, "Approved")
                              }
                              disabled={updatingId === request.id}
                              className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all ${
                                updatingId === request.id
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  : "bg-green-100 text-green-700 hover:bg-green-200"
                              }`}
                            >
                              {updatingId === request.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                              ) : (
                                <>
                                  <Check size={16} />
                                  <span className="text-sm font-medium">
                                    Approve
                                  </span>
                                </>
                              )}
                            </button>

                            {/* Reject Button */}
                            <button
                              onClick={() =>
                                handleUpdateStatus(request.id, "Rejected")
                              }
                              disabled={updatingId === request.id}
                              className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all ${
                                updatingId === request.id
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  : "bg-red-100 text-red-700 hover:bg-red-200"
                              }`}
                            >
                              {updatingId === request.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                              ) : (
                                <>
                                  <X size={16} />
                                  <span className="text-sm font-medium">
                                    Reject
                                  </span>
                                </>
                              )}
                            </button>
                          </>
                        )}

                        {/* Show Collected button for Approved status */}
                        {request.status === "Approved" && (
                          <button
                            onClick={() => handleMarkAsCollected(request.id)}
                            disabled={updatingId === request.id}
                            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all ${
                              updatingId === request.id
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                            }`}
                          >
                            {updatingId === request.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            ) : (
                              <>
                                <PackageCheck size={16} />
                                <span className="text-sm font-medium">
                                  Collected
                                </span>
                              </>
                            )}
                          </button>
                        )}

                        {/* Show message for other statuses */}
                        {request.status !== "Pending" &&
                          request.status !== "Approved" && (
                            <div className="text-center py-2">
                              <span className="text-xs text-gray-500 italic">
                                No actions available
                              </span>
                            </div>
                          )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {redeemRequests.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
          <div className="text-sm text-gray-600">
            Showing{" "}
            <span className="font-medium">
              {(filters.pageIndex - 1) * filters.pageSize + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(
                filters.pageIndex * filters.pageSize,
                redeemRequests.length,
              )}
            </span>{" "}
            of <span className="font-medium">{redeemRequests.length}</span>{" "}
            requests
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                handleFilterChange("pageIndex", filters.pageIndex - 1)
              }
              disabled={filters.pageIndex <= 1}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg ${
                filters.pageIndex <= 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <ChevronLeft size={18} />
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from(
                { length: Math.ceil(redeemRequests.length / filters.pageSize) },
                (_, i) => i + 1,
              )
                .slice(
                  Math.max(0, filters.pageIndex - 3),
                  Math.min(
                    Math.ceil(redeemRequests.length / filters.pageSize),
                    filters.pageIndex + 2,
                  ),
                )
                .map((page) => (
                  <button
                    key={page}
                    onClick={() => handleFilterChange("pageIndex", page)}
                    className={`w-10 h-10 rounded-lg ${
                      page === filters.pageIndex
                        ? "bg-blue-600 text-white"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
            </div>
            <button
              onClick={() =>
                handleFilterChange("pageIndex", filters.pageIndex + 1)
              }
              disabled={
                filters.pageIndex >=
                Math.ceil(redeemRequests.length / filters.pageSize)
              }
              className={`flex items-center gap-1 px-3 py-2 rounded-lg ${
                filters.pageIndex >=
                Math.ceil(redeemRequests.length / filters.pageSize)
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Next
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewRedeemRequests;
