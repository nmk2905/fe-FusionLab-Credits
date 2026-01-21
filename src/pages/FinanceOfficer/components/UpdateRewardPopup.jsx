// src/pages/FinanceOfficer/components/UpdateRewardPopup.jsx
import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import rewardItemService from "../../../services/apis/rewardItemApi";

const UpdateRewardPopup = ({ isOpen, onClose, rewardId, onUpdateSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    priceInPoints: "",
    quantity: "",
    type: "Physical",
    isActive: true,
  });

  const rewardTypes = ["Physical", "Digital"];

  // Fetch reward data when popup opens
  useEffect(() => {
    if (isOpen && rewardId) {
      fetchRewardData();
    }

    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, rewardId]);

  const fetchRewardData = async () => {
    setFetching(true);
    setError("");
    try {
      const result = await rewardItemService.getRewardItemById(rewardId);

      if (result?.success) {
        const reward = result?.rawResponse?.data || result?.data;
        setFormData({
          name: reward.name || "",
          description: reward.description || "",
          priceInPoints: reward.priceInPoints?.toString() || "",
          quantity: reward.quantity?.toString() || "",
          type: reward.type || "Physical",
          isActive: reward.isActive || true,
        });
      } else {
        setError("Failed to fetch reward details");
      }
    } catch (err) {
      console.error("Error fetching reward:", err);
      setError("Failed to load reward details. Please try again.");
    } finally {
      setFetching(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }
    if (!formData.priceInPoints || Number(formData.priceInPoints) <= 0) {
      setError("Points must be greater than 0");
      return;
    }
    if (!formData.quantity || Number(formData.quantity) < 0) {
      setError("Quantity cannot be negative");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const updateData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        priceInPoints: Number(formData.priceInPoints),
        quantity: Number(formData.quantity),
        type: formData.type,
        isActive: formData.isActive,
      };

      const result = await rewardItemService.updateRewardItem(
        rewardId,
        updateData,
      );

      if (result?.success) {
        setSuccess("Reward updated successfully!");
        setTimeout(() => {
          onUpdateSuccess?.();
          onClose();
        }, 1500);
      } else {
        setError(result?.data?.title || "Failed to update reward");
      }
    } catch (err) {
      console.error("Error updating reward:", err);
      setError("Failed to update reward. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={!loading ? onClose : undefined}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl transform overflow-hidden rounded-xl bg-white shadow-xl transition-all">
          {/* Header */}
          <div className="p-6 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Update Reward
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Update reward details
                </p>
              </div>
              <button
                onClick={onClose}
                disabled={loading}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-colors disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="mx-6 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mx-6 mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {success}
            </div>
          )}

          {/* Content */}
          <form onSubmit={handleSubmit}>
            <div className="px-6 pb-6 max-h-[60vh] overflow-y-auto">
              {fetching ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                    <p className="mt-3 text-gray-600">
                      Loading reward details...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Reward Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={loading}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:opacity-50"
                      placeholder="Enter reward name"
                      required
                    />
                  </div>

                  {/* Type */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Type *
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      disabled={loading}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:opacity-50"
                    >
                      {rewardTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price in Points */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Points Required *
                    </label>
                    <input
                      type="number"
                      name="priceInPoints"
                      value={formData.priceInPoints}
                      onChange={handleInputChange}
                      disabled={loading}
                      min="1"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:opacity-50"
                      placeholder="Enter points"
                      required
                    />
                  </div>

                  {/* Quantity */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      disabled={loading}
                      min="0"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:opacity-50"
                      placeholder="Enter quantity"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      disabled={loading}
                      rows={3}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:opacity-50 resize-none"
                      placeholder="Enter reward description"
                    />
                  </div>

                  {/* Status */}
                  <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        disabled={loading}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex-1">
                      <label
                        htmlFor="isActive"
                        className="text-sm font-medium text-gray-700"
                      >
                        Active Reward
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        Inactive rewards won't be visible to users
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        formData.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {formData.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading || fetching}
                className="px-5 py-2.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || fetching}
                className="px-5 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Reward"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateRewardPopup;
