// src/pages/FinanceOfficer/components/ViewRewards.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  Edit,
  Trash2,
  PlusCircle,
  Search,
  RefreshCw,
  Power,
} from "lucide-react";
import rewardItemService from "../../../services/apis/rewardItemApi";
import DeleteConfirmationPopup from "./DeleteConfirmationPopup";
import UpdateRewardPopup from "./UpdateRewardPopup"; // Import popup update

// Debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

const ViewRewards = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [rewards, setRewards] = useState([]);
  const [filteredRewards, setFilteredRewards] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Delete popup state
  const [deletePopup, setDeletePopup] = useState({
    isOpen: false,
    rewardId: null,
    rewardName: "",
    isLoading: false,
  });

  // Update popup state
  const [updatePopup, setUpdatePopup] = useState({
    isOpen: false,
    rewardId: null,
  });

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("Active");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const rewardTypes = ["All", "Physical", "Digital"];
  const statusOptions = ["Active", "Inactive"];

  // Fetch rewards
  useEffect(() => {
    fetchRewards();
  }, [statusFilter]);

  // Apply filters
  useEffect(() => {
    applyFilters();
  }, [rewards, debouncedSearch, typeFilter]);

  const fetchRewards = async () => {
    setLoading(true);
    setError("");
    try {
      let isActiveParam = null;
      if (statusFilter === "Active") isActiveParam = true;
      else if (statusFilter === "Inactive") isActiveParam = false;

      const result = await rewardItemService.getRewardItems({
        pageIndex: 1,
        pageSize: 100,
        isActive: isActiveParam,
        sortDir: "Desc",
      });

      if (result?.success) {
        setRewards(result?.rawResponse?.data || []);
      } else {
        setError(result?.data?.title || "Failed to fetch rewards");
      }
    } catch (err) {
      console.error("Error fetching rewards:", err);
      setError("Failed to load rewards. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...rewards];

    if (debouncedSearch) {
      const term = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.name?.toLowerCase().includes(term) ||
          r.description?.toLowerCase().includes(term),
      );
    }

    if (typeFilter !== "All") {
      filtered = filtered.filter((r) => r.type === typeFilter);
    }

    setFilteredRewards(filtered);
    setCurrentPage(1);
  };

  // Open delete popup
  const handleOpenDeletePopup = (id, name) => {
    setDeletePopup({
      isOpen: true,
      rewardId: id,
      rewardName: name,
      isLoading: false,
    });
  };

  // Close delete popup
  const handleCloseDeletePopup = () => {
    if (!deletePopup.isLoading) {
      setDeletePopup({
        isOpen: false,
        rewardId: null,
        rewardName: "",
        isLoading: false,
      });
    }
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!deletePopup.rewardId) return;

    setDeletePopup((prev) => ({ ...prev, isLoading: true }));

    try {
      const result = await rewardItemService.deleteRewardItem(
        deletePopup.rewardId,
      );
      if (result?.success) {
        setSuccess("Reward deleted successfully!");
        fetchRewards();
        handleCloseDeletePopup();
      } else {
        setError("Failed to delete reward");
      }
    } catch (err) {
      console.error("Error deleting reward:", err);
      setError("Failed to delete reward. Please try again.");
    } finally {
      setDeletePopup((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Open update popup
  const handleOpenUpdatePopup = (id) => {
    setUpdatePopup({
      isOpen: true,
      rewardId: id,
    });
  };

  // Close update popup
  const handleCloseUpdatePopup = () => {
    setUpdatePopup({
      isOpen: false,
      rewardId: null,
    });
  };

  // Handle update success
  const handleUpdateSuccess = () => {
    setSuccess("Reward updated successfully!");
    fetchRewards();
  };

  const handleToggleStatus = async (id, currentStatus) => {
    setLoading(true);
    try {
      const result = await rewardItemService.updateRewardItemStatus(
        id,
        !currentStatus,
      );
      if (result?.success) {
        setSuccess(
          `Reward ${!currentStatus ? "activated" : "deactivated"} successfully!`,
        );
        fetchRewards();
      } else {
        setError("Failed to update reward status");
      }
    } catch (err) {
      setError("Failed to update reward status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredRewards.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRewards.slice(indexOfFirstItem, indexOfLastItem);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (isActive) => (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
        isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );

  const getTypeBadge = (type) => {
    const colors = {
      Physical: "bg-blue-100 text-blue-800",
      Digital: "bg-purple-100 text-purple-800",
      Experience: "bg-yellow-100 text-yellow-800",
      Other: "bg-gray-100 text-gray-800",
    };
    return (
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
          colors[type] || colors.Other
        }`}
      >
        {type}
      </span>
    );
  };

  // Smart pagination rendering
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    return (
      <div className="flex items-center gap-1 flex-wrap justify-center sm:justify-end">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="p-2 rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
        >
          &lt;
        </button>

        {start > 1 && (
          <>
            <button
              onClick={() => setCurrentPage(1)}
              className="px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50"
            >
              1
            </button>
            {start > 2 && <span className="px-2 py-1.5">...</span>}
          </>
        )}

        {Array.from({ length: end - start + 1 }, (_, i) => start + i).map(
          (page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1.5 rounded border min-w-[2.25rem] ${
                currentPage === page
                  ? "bg-blue-600 text-white border-blue-600 font-medium"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          ),
        )}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="px-2 py-1.5">...</span>}
            <button
              onClick={() => setCurrentPage(totalPages)}
              className="px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="p-2 rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
        >
          &gt;
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Rewards Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage all reward items in the system
            </p>
          </div>
          <button
            onClick={() => navigate("/finance-officer/create-rewards")}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <PlusCircle size={18} />
            Create Reward
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {success}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            {/* Filters & Actions */}
            <div className="flex flex-wrap gap-3">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[140px]"
              >
                {rewardTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[140px]"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              <button
                onClick={fetchRewards}
                disabled={loading}
                className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw
                  size={18}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
              <p className="mt-4 text-gray-600">Loading rewards...</p>
            </div>
          ) : currentItems.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-xl text-gray-600 font-medium">
                {debouncedSearch || typeFilter !== "All"
                  ? "No rewards match your filters"
                  : "No rewards found"}
              </p>
              <p className="text-gray-500 mt-2">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reward
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type / Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Points / Qty
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentItems.map((reward) => (
                      <tr
                        key={reward.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            <p className="font-medium text-gray-900 truncate">
                              {reward.name}
                            </p>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {reward.description || "No description"}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-2">
                            {getTypeBadge(reward.type)}
                            {getStatusBadge(reward.isActive)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium text-gray-900">
                                {reward.priceInPoints.toLocaleString()}
                              </span>{" "}
                              pts
                            </p>
                            <p className="text-sm text-gray-600">
                              Qty:{" "}
                              <span className="font-medium text-gray-900">
                                {reward.quantity.toLocaleString()}
                              </span>
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {formatDate(reward.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                navigate(`/finance/rewards/${reward.id}`)
                              }
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View details"
                            >
                              <Eye size={18} />
                            </button>
                            {/* Updated edit button */}
                            <button
                              onClick={() => handleOpenUpdatePopup(reward.id)}
                              className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() =>
                                handleOpenDeletePopup(reward.id, reward.name)
                              }
                              className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-gray-600 whitespace-nowrap">
                    Showing{" "}
                    <span className="font-medium">{indexOfFirstItem + 1}</span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(indexOfLastItem, filteredRewards.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">
                      {filteredRewards.length}
                    </span>{" "}
                    rewards
                  </p>
                  {renderPagination()}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Delete Confirmation Popup */}
        <DeleteConfirmationPopup
          isOpen={deletePopup.isOpen}
          onClose={handleCloseDeletePopup}
          onConfirm={handleConfirmDelete}
          itemName={deletePopup.rewardName}
          isLoading={deletePopup.isLoading}
        />

        {/* Update Reward Popup */}
        <UpdateRewardPopup
          isOpen={updatePopup.isOpen}
          onClose={handleCloseUpdatePopup}
          rewardId={updatePopup.rewardId}
          onUpdateSuccess={handleUpdateSuccess}
        />
      </div>
    </div>
  );
};

export default ViewRewards;
