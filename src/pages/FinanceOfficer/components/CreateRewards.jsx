// src/pages/Finance/components/CreateRewards.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, ArrowLeft, Save } from "lucide-react";
import { useNotification } from "../../../hook/useNotification";
import rewardItemService from "../../../services/apis/rewardItemApi";

const CreateRewards = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    priceInPoints: 1,
    quantity: 1,
    type: "Physical",
    isActive: "true",
  });

  const rewardTypes = ["Physical", "Digital"];

  const activeOptions = [
    { value: "true", label: "Active" },
    { value: "false", label: "Inactive" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "priceInPoints" || name === "quantity"
          ? parseInt(value) || 0
          : value,
    }));
  };

  // Xử lý riêng cho input number để tránh vấn đề không xóa được số 0
  const handleNumberChange = (e) => {
    const { name, value } = e.target;

    // Nếu giá trị rỗng, đặt thành 0 tạm thời (nhưng vẫn cho phép nhập)
    if (value === "") {
      setFormData((prev) => ({
        ...prev,
        [name]: "",
      }));
    } else {
      // Chỉ parse khi có giá trị hợp lệ
      const numValue = parseInt(value);
      if (!isNaN(numValue)) {
        setFormData((prev) => ({
          ...prev,
          [name]: numValue,
        }));
      }
    }
  };

  // Xử lý khi blur khỏi ô input (đảm bảo giá trị hợp lệ)
  const handleNumberBlur = (e) => {
    const { name, value } = e.target;

    if (value === "" || parseInt(value) < 1) {
      setFormData((prev) => ({
        ...prev,
        [name]: name === "priceInPoints" ? 1 : 1,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation trước khi submit
    if (formData.priceInPoints < 1) {
      setError("Price must be at least 1 point");
      return;
    }

    if (formData.quantity < 1) {
      setError("Quantity must be at least 1");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        ...formData,
        isActive: formData.isActive === "true",
        priceInPoints: Number(formData.priceInPoints),
        quantity: Number(formData.quantity),
      };

      const result = await rewardItemService.createRewardItem(payload);

      // ✅ CHECK SUCCESS Ở ĐÂY
      if (result?.success) {
        showNotification("Reward item created successfully!", "success");

        setFormData({
          name: "",
          description: "",
          priceInPoints: 1,
          quantity: 1,
          type: "Physical",
          isActive: "true",
        });
      } else {
        // ❌ API trả về success = false
        setError(result?.data?.title || "Create reward item failed");
      }
    } catch (err) {
      console.error("Error creating reward:", err);

      setError(
        err?.response?.data?.title ||
          err?.response?.data?.message ||
          "Failed to create reward item. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Create New Reward
              </h1>
              <p className="text-gray-600 mt-2">
                Add a new reward item to the system
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600">{success}</p>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reward Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter reward name"
                />
              </div>

              {/* Description */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter reward description"
                />
              </div>

              {/* Price in Points */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (Points) *
                </label>
                <input
                  type="number"
                  name="priceInPoints"
                  value={formData.priceInPoints}
                  onChange={handleNumberChange}
                  onBlur={handleNumberBlur}
                  min="1"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter points required"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Minimum 1 point required
                </p>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleNumberChange}
                  onBlur={handleNumberBlur}
                  min="1"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter available quantity"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Minimum quantity is 1
                </p>
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reward Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                >
                  {rewardTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  name="isActive"
                  value={formData.isActive}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                >
                  {activeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  Active rewards are visible to users
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate("/finance/view-rewards")}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save size={20} className="mr-2" />
                      Create Reward
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Form Guidelines - Updated */}
        <div className="mt-8 bg-blue-50 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            📝 Form Guidelines
          </h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                <strong>Name:</strong> Should be clear and descriptive
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                <strong>Price:</strong> Minimum 1 point required
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                <strong>Quantity:</strong> Minimum 1 required for new rewards
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                <strong>Status:</strong> Inactive rewards won't be shown to
                users
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                <strong>Type:</strong> Choose the appropriate category for the
                reward
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreateRewards;
