// src/pages/PointExchange.jsx
import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import {
  Gift,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { AuthContext } from "../../../contexts/AuthContext";
import rewardItemService from "../../../services/apis/rewardItemApi";
import redeemRequestService from "../../../services/apis/redeemRequestApi";
import walletService from "../../../services/apis/walletService";

export default function PointExchange() {
  const { user } = useContext(AuthContext);
  const [rewards, setRewards] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [selectedItems, setSelectedItems] = useState({});

  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await rewardItemService.getRewardItems({
          pageIndex: 1,
          pageSize: 100,
          isActive: true,
          sortDir: "Desc",
        });

        // ───────────────────────────────────────────────────────────────
        // FIXED: the real structure is { success: true, data: [ ... ], ... }
        // so we take response.data (which is the array of reward items)
        // ───────────────────────────────────────────────────────────────
        let rewardList = [];
        if (response && response.data && Array.isArray(response.data)) {
          rewardList = response.data;
        } else {
          console.warn("Unexpected reward items response shape:", response);
        }

        console.log("API raw response:", response);
        console.log("Extracted rewards:", rewardList);

        setRewards(rewardList);

        // Fetch wallet balance
        const balRes = await walletService.getWalletBalance(user.id);
        setBalance(balRes?.data?.balance ?? balRes?.balance ?? 0);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Could not load rewards. Please try again later.");
        setRewards([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const toggleSelect = (reward) => {
    setSelectedItems((prev) => {
      const copy = { ...prev };
      if (copy[reward.id]) {
        delete copy[reward.id];
      } else {
        copy[reward.id] = 1;
      }
      return copy;
    });
  };

  const changeQuantity = (rewardId, delta) => {
    setSelectedItems((prev) => {
      const copy = { ...prev };
      const current = copy[rewardId] || 1;
      const next = Math.max(1, current + delta);
      copy[rewardId] = next;
      return copy;
    });
  };

  const totalPointsRequired = () => {
    return Object.entries(selectedItems).reduce((sum, [id, qty]) => {
      const item = rewards.find((r) => r.id === Number(id));
      return sum + (item?.priceInPoints || 0) * qty;
    }, 0);
  };

  const canAfford = totalPointsRequired() <= balance;

  const handleRedeem = async () => {
    if (Object.keys(selectedItems).length === 0) return;
    if (!canAfford) {
      setError("Not enough points.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const promises = Object.entries(selectedItems).map(([rewardId, quantity]) =>
        redeemRequestService.createRedeemRequest({
          quantity,
          userId: user.id,
          rewardItemId: Number(rewardId),
        })
      );

      await Promise.all(promises);

      setSuccess("Redemption request(s) submitted successfully!");
      setSelectedItems({});

      const balRes = await walletService.getWalletBalance(user.id);
      setBalance(balRes?.data?.balance ?? balRes?.balance ?? 0);
    } catch (err) {
      console.error(err);
      setError("Failed to submit redemption request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-600 px-8 py-10 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Gift size={32} /> Point Exchange
              </h1>
              <p className="mt-2 opacity-90">
                Exchange your points for exciting rewards
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-2xl text-center">
              <p className="text-sm">Your Balance</p>
              <p className="text-3xl font-bold">{balance.toLocaleString()}</p>
              <p className="text-sm opacity-80">points</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mx-8 mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
            <AlertCircle size={20} />
            {error}
          </div>
        )}
        {success && (
          <div className="mx-8 mt-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700">
            <CheckCircle2 size={20} />
            {success}
          </div>
        )}

        {/* Rewards Grid */}
        <div className="p-8">
          {rewards.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              No active rewards available at the moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {rewards.map((item) => {
                const isSelected = !!selectedItems[item.id];
                const qty = selectedItems[item.id] || 1;
                const points = (item.priceInPoints || 0) * qty;

                return (
                  <motion.div
                    key={item.id}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className={`rounded-2xl border-2 overflow-hidden transition-all ${
                      isSelected
                        ? "border-orange-500 shadow-lg shadow-orange-200/50"
                        : "border-gray-200 hover:border-orange-200"
                    }`}
                  >
                    {/* Image placeholder */}
                    <div className="h-48 bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                      <Gift size={64} className="text-orange-400 opacity-50" />
                    </div>

                    <div className="p-5">
                      <h3 className="font-bold text-lg line-clamp-2">
                        {item.name || "Unnamed Reward"}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2 min-h-[3rem]">
                        {item.description || "No description provided."}
                      </p>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="text-xl font-bold text-orange-600">
                          {(item.priceInPoints || 0).toLocaleString()} pts
                        </div>

                        {isSelected && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => changeQuantity(item.id, -1)}
                              className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                            >
                              −
                            </button>
                            <span className="w-10 text-center font-medium">{qty}</span>
                            <button
                              onClick={() => changeQuantity(item.id, 1)}
                              className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => toggleSelect(item)}
                        className={`mt-5 w-full py-3 rounded-xl font-medium transition-all ${
                          isSelected
                            ? "bg-red-100 text-red-700 hover:bg-red-200"
                            : "bg-orange-500 text-white hover:bg-orange-600"
                        }`}
                      >
                        {isSelected ? "Remove" : "Select"}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sticky bottom bar */}
        {Object.keys(selectedItems).length > 0 && (
          <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-6 shadow-2xl z-10">
            <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <p className="text-sm text-gray-600">Total required</p>
                <p className="text-3xl font-bold text-orange-600">
                  {totalPointsRequired().toLocaleString()} points
                </p>
                <p className={`text-sm mt-1 ${canAfford ? "text-green-600" : "text-red-600"}`}>
                  {canAfford ? "Enough balance ✓" : "Not enough points ✗"}
                </p>
              </div>

              <button
                onClick={handleRedeem}
                disabled={submitting || !canAfford}
                className={`px-10 py-4 rounded-2xl font-bold text-lg flex items-center gap-3 transition-all ${
                  submitting || !canAfford
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-orange-600 text-white hover:bg-orange-700 shadow-lg shadow-orange-200"
                }`}
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    Redeem Now <ArrowRight size={20} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}