// src/pages/student/components/PointExchange.jsx
import React, { useState, useEffect, useContext, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gift,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ShoppingBag,
  Coins,
  ChevronLeft,
  ChevronRight,
  Flame,
  X,
  History,
  RefreshCw,
} from "lucide-react";
import { AuthContext } from "../../../contexts/AuthContext";
import rewardItemService from "../../../services/apis/rewardItemApi";
import redeemRequestService from "../../../services/apis/redeemRequestApi";
import walletService from "../../../services/apis/walletService";

const ITEMS_PER_PAGE = 12;
const HISTORY_ITEMS_PER_PAGE = 7;

export default function PointExchange() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("redeem"); // "redeem" or "history"

  // ────────────────────────────────────────────────
  // REDEEM TAB STATES
  // ────────────────────────────────────────────────
  const [rewards, setRewards] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedItems, setSelectedItems] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingItems, setPendingItems] = useState([]);

  // ────────────────────────────────────────────────
  // HISTORY TAB STATES
  // ────────────────────────────────────────────────
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [historyPage, setHistoryPage] = useState(1);

  // Auto-hide success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const totalPointsRequired = useMemo(() => {
    return Object.entries(selectedItems).reduce((sum, [id, qty]) => {
      const item = rewards.find((r) => r.id === Number(id));
      return sum + (item?.priceInPoints || 0) * qty;
    }, 0);
  }, [selectedItems, rewards]);

  const canAfford = totalPointsRequired <= balance && totalPointsRequired > 0;
  const hasSelection = Object.keys(selectedItems).length > 0;

  // Pagination for rewards
  const totalPages = Math.ceil(rewards.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRewards = rewards.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Client-side pagination for history
  const totalHistoryPages = Math.ceil(history.length / HISTORY_ITEMS_PER_PAGE);
  const historyStartIndex = (historyPage - 1) * HISTORY_ITEMS_PER_PAGE;
  const paginatedHistory = history.slice(historyStartIndex, historyStartIndex + HISTORY_ITEMS_PER_PAGE);

  // Auto-rotate featured carousel
  useEffect(() => {
    if (rewards.length === 0) return;
    const interval = setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % Math.min(5, rewards.length));
    }, 5000);
    return () => clearInterval(interval);
  }, [rewards.length]);

  // Fetch rewards + balance when redeem tab is active
  useEffect(() => {
    if (activeTab !== "redeem" || !user?.id) return;

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

        let rewardList = [];
        if (response?.rawResponse?.data && Array.isArray(response.rawResponse.data)) {
          rewardList = response.rawResponse.data;
        } else if (response?.data && Array.isArray(response.data)) {
          rewardList = response.data;
        } else if (response?.data?.data && Array.isArray(response.data.data)) {
          rewardList = response.data.data;
        }

        setRewards(rewardList);
        setCurrentPage(1);

        const balRes = await walletService.getWalletBalance(user.id);
        setBalance(balRes?.data?.balance ?? balRes?.balance ?? 0);
      } catch (err) {
        console.error("Failed to load rewards:", err);
        setError("Unable to load rewards. Please try again later.");
        setRewards([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id, activeTab]);

  // Fetch redemption history when history tab is active
  useEffect(() => {
    if (activeTab !== "history" || !user?.id) return;

    const fetchHistory = async () => {
      setHistoryLoading(true);
      setHistoryError(null);

      try {
        const res = await redeemRequestService.getRedeemRequestsByUser(user.id, {
          pageIndex: 1,
          pageSize: 20,
          sortColumn: "RequestedAt",
          sortDir: "Desc",
        });

        // ── Improved response handling ──────────────────────────────────────
        let data = [];

        // Most common axios pattern
        if (res?.data && Array.isArray(res.data)) {
          data = res.data;
        }
        // Sometimes nested
        else if (res?.data?.data && Array.isArray(res.data.data)) {
          data = res.data.data;
        }
        // If your apiUtils wraps differently
        else if (res?.rawResponse?.data && Array.isArray(res.rawResponse.data)) {
          data = res.rawResponse.data;
        }
        // Final fallback
        else {
          data = [];
        }

        console.log("[HISTORY FETCH] Full response:", res);
        console.log("[HISTORY FETCH] res.data:", res?.data);
        console.log("[HISTORY FETCH] res.data?.data:", res?.data?.data);
        console.log("[HISTORY FETCH] Extracted history array:", data);
        console.log("[HISTORY FETCH] Items count:", data.length);

        setHistory(data);
        setHistoryPage(1);
      } catch (err) {
        console.error("Failed to load redemption history:", err);
        setHistoryError("Could not load redemption history. Please try again.");
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchHistory();
  }, [user?.id, activeTab]);

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
      const next = Math.max(0, current + delta);
      if (next === 0) delete copy[rewardId];
      else copy[rewardId] = next;
      return copy;
    });
  };

  const handleRedeemClick = () => {
    if (!hasSelection) {
      setError("Please select at least one reward.");
      return;
    }

    if (!canAfford) {
      setError("You don't have enough points to redeem these items.");
      return;
    }

    const itemsToConfirm = Object.entries(selectedItems).map(([id, qty]) => {
      const item = rewards.find((r) => r.id === Number(id));
      return {
        id: Number(id),
        name: item?.name || "Unknown Item",
        priceInPoints: item?.priceInPoints || 0,
        quantity: qty,
        total: (item?.priceInPoints || 0) * qty,
        description: item?.description || "No description available",
      };
    });

    setPendingItems(itemsToConfirm);
    setShowConfirmModal(true);
  };

  const confirmAndRedeem = async () => {
    setShowConfirmModal(false);
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const promises = pendingItems.map((item) =>
        redeemRequestService.createRedeemRequest({
          quantity: item.quantity,
          userId: user.id,
          rewardItemId: item.id,
        })
      );

      const results = await Promise.all(promises);
      console.log("Redemption successful:", results);

      setSuccess("Redemption request(s) sent successfully!");
      setSelectedItems({});
      setCurrentPage(1);
      setPendingItems([]);

      const balRes = await walletService.getWalletBalance(user.id);
      setBalance(balRes?.data?.balance ?? balRes?.balance ?? 0);
    } catch (err) {
      console.error("Redemption failed:", err);

      let errorMessage = "Failed to submit redemption request. Please try again.";

      if (err.response) {
        const { status, data } = err.response;

        if (status === 400) {
          if (data?.message) {
            errorMessage = data.message;
          } else if (data?.errors) {
            const firstError = Object.values(data.errors)[0]?.[0];
            errorMessage = firstError || "Invalid request data.";
          } else if (typeof data === "string") {
            errorMessage = data;
          } else {
            errorMessage = "Invalid request (400 Bad Request).";
          }
        } else if (status === 401 || status === 403) {
          errorMessage = "Authentication error. Please log in again.";
        } else if (status === 404) {
          errorMessage = "One or more reward items were not found.";
        } else if (status >= 500) {
          errorMessage = "Server error occurred. Please try again later.";
        }
      } else if (err.request) {
        errorMessage = "No response from server. Check your internet connection.";
      } else {
        errorMessage = err.message || "An unexpected error occurred.";
      }

      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // ────────────────────────────────────────────────
  // HISTORY PAGINATION CONTROLS
  // ────────────────────────────────────────────────
  const goToHistoryPage = (page) => {
    if (page >= 1 && page <= totalHistoryPages) {
      setHistoryPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // ────────────────────────────────────────────────
  // CANCEL / REFUND FUNCTION
  // ────────────────────────────────────────────────
  const handleCancelRequest = async (requestId) => {
    if (!window.confirm("Are you sure you want to cancel / request refund for this redemption?")) {
      return;
    }

    try {
      await redeemRequestService.deleteRedeemRequest(requestId);
      setSuccess("Redemption request cancelled successfully!");

      // Refresh history after cancel
      const res = await redeemRequestService.getRedeemRequestsByUser(user.id, {
        pageIndex: 1,
        pageSize: 20,
        sortColumn: "RequestedAt",
        sortDir: "Desc",
      });

      let data = [];
      if (res?.data && Array.isArray(res.data)) {
        data = res.data;
      } else if (res?.data?.data && Array.isArray(res.data.data)) {
        data = res.data.data;
      } else if (res?.rawResponse?.data && Array.isArray(res.rawResponse.data)) {
        data = res.rawResponse.data;
      }

      setHistory(data);
      setHistoryPage(1);
    } catch (err) {
      console.error("Cancel failed:", err);

      let errorMessage = "Failed to cancel redemption request.";

      if (err.response) {
        const { status, data } = err.response;
        if (status === 400) {
          errorMessage = data?.message || "Invalid cancellation request.";
        } else if (status === 401 || status === 403) {
          errorMessage = "Authentication error. Please log in again.";
        } else if (status === 404) {
          errorMessage = "Redemption request not found or already processed.";
        } else if (status >= 500) {
          errorMessage = "Server error occurred. Please try again later.";
        }
      } else if (err.request) {
        errorMessage = "No response from server. Check your internet connection.";
      } else {
        errorMessage = err.message || "An unexpected error occurred.";
      }

      setError(errorMessage);
    }
  };

  // ────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50/50 pt-6 px-4 sm:px-6 lg:px-8">
      {/* === New Navigation - Icon only - Top Right === */}
      <div className="absolute top-6 right-6 sm:right-8 lg:right-12 z-30 flex items-center gap-2.5">
        <button
          onClick={() => setActiveTab("redeem")}
          title="Redeem Points"
          className={`p-3 rounded-xl transition-all duration-200 shadow-sm ${
            activeTab === "redeem"
              ? "bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-orange-500/30 ring-2 ring-orange-400/40"
              : "bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-600 border border-gray-200"
          }`}
        >
          <Gift className="h-6 w-6" strokeWidth={activeTab === "redeem" ? 2.4 : 2} />
        </button>

        <button
          onClick={() => setActiveTab("history")}
          title="Redemption History"
          className={`p-3 rounded-xl transition-all duration-200 shadow-sm ${
            activeTab === "history"
              ? "bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-orange-500/30 ring-2 ring-orange-400/40"
              : "bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-600 border border-gray-200"
          }`}
        >
          <History className="h-6 w-6" strokeWidth={activeTab === "history" ? 2.4 : 2} />
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "redeem" ? (
        <>
          <div className={`transition-all duration-300 ${hasSelection ? "pb-52 sm:pb-44" : "pb-16"}`}>
            {/* Featured Carousel */}
            {rewards.length > 0 && (
              <div className="mb-10 relative rounded-3xl overflow-hidden shadow-xl">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={featuredIndex}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="relative h-64 sm:h-80 bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 flex items-center justify-center text-white"
                  >
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(255,255,255,0.2)_0%,transparent_50%)]" />
                    </div>

                    <div className="relative z-10 text-center px-6 max-w-3xl">
                      <Flame className="h-16 w-16 mx-auto mb-4 text-yellow-300 animate-pulse" />
                      <h2 className="text-3xl sm:text-5xl font-black mb-3 drop-shadow-lg">
                        {rewards[featuredIndex]?.name || "Featured Reward"}
                      </h2>
                      <p className="text-lg sm:text-xl opacity-90 mb-6">
                        Only {rewards[featuredIndex]?.priceInPoints?.toLocaleString() || 0} points • Limited time!
                      </p>
                      <button
                        onClick={() => toggleSelect(rewards[featuredIndex])}
                        className="bg-white text-orange-600 px-10 py-4 rounded-full font-bold text-lg shadow-2xl hover:bg-orange-50 transition"
                      >
                        Grab Now
                      </button>
                    </div>

                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
                      {rewards.slice(0, 5).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setFeaturedIndex(i)}
                          className={`w-3 h-3 rounded-full transition-all ${
                            i === featuredIndex ? "bg-white scale-125" : "bg-white/50"
                          }`}
                        />
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            )}

            {/* Header */}
            <div className="bg-gradient-to-br from-orange-600/95 to-amber-700/95 rounded-3xl shadow-xl mb-10 overflow-hidden">
              <div className="px-8 py-14 sm:px-12 sm:py-16 text-white">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-10">
                  <div>
                    <h1 className="text-4xl sm:text-5xl font-black flex items-center gap-5 drop-shadow-md">
                      <Gift className="h-14 w-14 opacity-90" />
                      Redeem Points
                    </h1>
                    <p className="mt-5 text-xl opacity-90">
                      Turn your points into amazing rewards — shop the look!
                    </p>
                  </div>

                  <div className="bg-white/20 backdrop-blur-lg px-10 py-8 rounded-3xl border border-white/30 text-center min-w-[260px] shadow-inner">
                    <p className="text-sm uppercase tracking-widest font-semibold opacity-90">
                      Your Balance
                    </p>
                    <p className="text-6xl font-black mt-2 flex items-center justify-center gap-3">
                      {balance.toLocaleString()}
                      <Coins className="h-10 w-10 opacity-90" />
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            {error && (
              <div className="mb-8 p-6 bg-red-50/90 border border-red-300 rounded-3xl flex items-center gap-5 text-red-800 shadow-md">
                <AlertCircle className="h-7 w-7 flex-shrink-0" />
                <p className="font-medium">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-8 p-6 bg-green-50/90 border border-green-300 rounded-3xl flex items-center gap-5 text-green-800 shadow-md">
                <CheckCircle2 className="h-7 w-7 flex-shrink-0" />
                <p className="font-medium">{success}</p>
              </div>
            )}

            {/* Rewards Grid */}
            {rewards.length === 0 ? (
              <div className="text-center py-24 bg-white/70 rounded-3xl shadow-lg border border-gray-100">
                <ShoppingBag className="mx-auto h-24 w-24 text-gray-300 mb-8" />
                <h3 className="text-3xl font-bold text-gray-700 mb-4">
                  No rewards yet...
                </h3>
                <p className="text-gray-500 text-lg max-w-md mx-auto">
                  We're adding exciting new items soon. Come back later!
                </p>
              </div>
            ) : (
              <>
                <div className="mb-8 flex items-center gap-3">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">All Rewards</h2>
                  <span className="text-sm bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full font-medium">
                    Popular this week
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
                  {paginatedRewards.map((item) => {
                    const isSelected = !!selectedItems[item.id];
                    const qty = selectedItems[item.id] || 1;

                    return (
                      <motion.div
                        key={item.id}
                        whileHover={{ y: -8, scale: 1.02 }}
                        transition={{ duration: 0.25 }}
                        className={`rounded-3xl overflow-hidden border transition-all duration-300 shadow-md hover:shadow-2xl ${
                          isSelected
                            ? "border-orange-500/60 bg-gradient-to-b from-orange-50/70 to-white"
                            : "border-gray-200/80 bg-white hover:border-orange-300/50"
                        }`}
                      >
                        <div className="relative h-56 bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center overflow-hidden">
                          <Gift className="absolute -bottom-10 -right-10 h-40 w-40 text-orange-200/40 rotate-12" />
                          <div className="text-center z-10">
                            <p className="text-7xl font-black text-orange-600/90 drop-shadow-lg">
                              {item.priceInPoints}
                            </p>
                            <p className="text-xl font-bold text-orange-700 mt-1 tracking-wide">
                              POINTS
                            </p>
                          </div>

                          {item.priceInPoints < 500 && (
                            <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                              <Flame className="h-4 w-4" /> HOT
                            </div>
                          )}
                        </div>

                        <div className="p-5">
                          <h3 className="font-bold text-lg text-gray-900 line-clamp-2 min-h-[2.75rem]">
                            {item.name}
                          </h3>

                          <p className="text-sm text-gray-600 mt-3 line-clamp-3 min-h-[4.5rem]">
                            {item.description || "Premium reward item – limited stock!"}
                          </p>

                          <div className="mt-8 flex items-center justify-between">
                            <div className="text-2xl font-black text-orange-600">
                              {item.priceInPoints.toLocaleString()} pts
                            </div>

                            {isSelected && (
                              <div className="flex items-center gap-2 bg-orange-50 rounded-full px-4 py-2 shadow-sm">
                                <button
                                  onClick={() => changeQuantity(item.id, -1)}
                                  className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-orange-600 hover:bg-gray-100 border border-orange-200"
                                >
                                  −
                                </button>
                                <span className="w-10 text-center font-bold text-lg">{qty}</span>
                                <button
                                  onClick={() => changeQuantity(item.id, 1)}
                                  className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-orange-600 hover:bg-gray-100 border border-orange-200"
                                >
                                  +
                                </button>
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => toggleSelect(item)}
                            className={`mt-6 w-full py-3.5 rounded-2xl font-bold text-base transition-all shadow-md ${
                              isSelected
                                ? "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                                : "bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:from-orange-600 hover:to-amber-700"
                            }`}
                          >
                            {isSelected ? "Remove from Cart" : "Add to Redeem"}
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-12">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-4 rounded-full bg-white border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition shadow-sm"
                    >
                      <ChevronLeft className="h-6 w-6 text-gray-700" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`w-12 h-12 rounded-full font-semibold transition shadow-sm ${
                          currentPage === page
                            ? "bg-orange-600 text-white"
                            : "bg-white border border-gray-200 hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-4 rounded-full bg-white border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition shadow-sm"
                    >
                      <ChevronRight className="h-6 w-6 text-gray-700" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Fixed Bottom Bar - only shown in redeem tab */}
          {hasSelection && (
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-gray-200/80 shadow-2xl">
              <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="text-center sm:text-left">
                  <p className="text-base text-gray-600 font-medium">Total Points Needed</p>
                  <p className="text-4xl font-black text-orange-600 mt-1">
                    {totalPointsRequired.toLocaleString()}
                  </p>
                  <p className={`text-base mt-2 font-medium ${canAfford ? "text-green-600" : "text-red-600"}`}>
                    {canAfford ? "You're good to go ✓" : "Not enough points ✗"}
                  </p>
                </div>

                <button
                  onClick={handleRedeemClick}
                  disabled={submitting || !canAfford}
                  className={`w-full sm:w-auto min-w-[220px] py-5 rounded-2xl font-bold text-xl flex items-center justify-center gap-4 shadow-xl transition ${
                    submitting
                      ? "bg-gray-400 text-gray-600 cursor-wait"
                      : !canAfford
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-orange-600 to-amber-700 text-white hover:from-orange-700 hover:to-amber-800"
                  }`}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-7 w-7 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Redeem Now
                      <ArrowRight className="h-7 w-7" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Confirmation Modal */}
          <AnimatePresence>
            {showConfirmModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                onClick={() => setShowConfirmModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.85, y: 40 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.85, y: 40 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-6 sm:p-8 relative">
                    <button
                      onClick={() => setShowConfirmModal(false)}
                      className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                    >
                      <X className="h-6 w-6" />
                    </button>

                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3 pr-10">
                      <Gift className="h-7 w-7 text-orange-600" />
                      Confirm Your Redemption
                    </h2>

                    <div className="space-y-5 mb-8">
                      {pendingItems.map((item) => (
                        <div key={item.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{item.name}</h3>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {item.description}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="font-bold text-orange-600">
                                {item.quantity} × {item.priceInPoints.toLocaleString()}
                              </p>
                              <p className="text-sm text-gray-500">
                                = {item.total.toLocaleString()} pts
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-orange-50 p-5 rounded-2xl mb-8">
                      <div className="flex justify-between items-center text-lg">
                        <span className="font-medium text-gray-700">Total Points Required:</span>
                        <span className="font-black text-2xl text-orange-700">
                          {totalPointsRequired.toLocaleString()} pts
                        </span>
                      </div>
                      <p
                        className={`mt-2 text-center font-medium ${
                          canAfford ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {canAfford ? "✓ You have enough points" : "✗ Not enough points"}
                      </p>
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={() => setShowConfirmModal(false)}
                        className="flex-1 py-4 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition"
                        disabled={submitting}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={confirmAndRedeem}
                        disabled={submitting || !canAfford}
                        className={`flex-1 py-4 rounded-2xl font-bold text-white transition flex items-center justify-center gap-3 shadow-lg ${
                          submitting
                            ? "bg-gray-400 cursor-wait"
                            : "bg-gradient-to-r from-orange-600 to-amber-700 hover:from-orange-700 hover:to-amber-800"
                        }`}
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="h-6 w-6 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Confirm & Redeem"
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        // ────────────────────────────────────────────────
        // HISTORY TAB
        // ────────────────────────────────────────────────
        <div className="bg-white rounded-2xl shadow border border-gray-200 p-6 sm:p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <History className="h-7 w-7 text-orange-600" />
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Redemption History
              </h2>
            </div>

            <button
              onClick={() => {
                setHistoryLoading(true);
                setHistoryError(null);

                redeemRequestService
                  .getRedeemRequestsByUser(user.id, {
                    pageIndex: 1,
                    pageSize: 20,
                    sortColumn: "RequestedAt",
                    sortDir: "Desc",
                  })
                  .then((res) => {
                    let data = [];

                    if (res?.data && Array.isArray(res.data)) {
                      data = res.data;
                    } else if (res?.data?.data && Array.isArray(res.data.data)) {
                      data = res.data.data;
                    } else if (res?.rawResponse?.data && Array.isArray(res.rawResponse.data)) {
                      data = res.rawResponse.data;
                    }

                    console.log("[HISTORY REFRESH] Extracted data:", data);
                    console.log("[HISTORY REFRESH] Count:", data.length);

                    setHistory(data);
                    setHistoryPage(1);
                  })
                  .catch((err) => {
                    console.error("Refresh failed:", err);
                    setHistoryError("Could not refresh history.");
                  })
                  .finally(() => setHistoryLoading(false));
              }}
              disabled={historyLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-xl font-medium transition disabled:opacity-50"
            >
              <RefreshCw className={`h-5 w-5 ${historyLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {historyError && (
            <div className="mb-6 p-5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-4 text-red-800">
              <AlertCircle className="h-6 w-6 flex-shrink-0" />
              <p>{historyError}</p>
            </div>
          )}

          {historyLoading ? (
            <div className="flex flex-col items-center py-16">
              <Loader2 className="h-12 w-12 animate-spin text-orange-500 mb-4" />
              <p className="text-gray-600">Loading your redemption history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-16 bg-gray-50/50 rounded-2xl border border-dashed border-gray-300">
              <History className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No redemptions yet
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                When you redeem rewards, they'll appear here with status, date and points used.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {paginatedHistory.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-bold text-gray-900">
                            Request #{req.id}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              req.status === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : req.status === "Approved" || req.status === "Collected"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {req.status}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600">
                          {new Date(req.requestedAt).toLocaleString("en-US", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </p>

                        {req.rewardItemId && (
                          <p className="text-sm text-gray-500 mt-1">
                            Item ID: {req.rewardItemId} • Qty: {req.quantity}
                          </p>
                        )}
                      </div>

                      <div className="text-right">
                        <p className="text-xl font-bold text-orange-700">
                          {req.totalPoints?.toLocaleString() || "—"} pts
                        </p>

                        {req.processedAt && (
                          <p className="text-xs text-gray-500 mt-1">
                            Processed: {new Date(req.processedAt).toLocaleDateString()}
                          </p>
                        )}

                        {req.collectedAt && (
                          <p className="text-xs text-green-600 mt-1 font-medium">
                            Collected on {new Date(req.collectedAt).toLocaleDateString()}
                          </p>
                        )}

                        {(req.status === "Pending" || req.status === "Approved") && !req.collectedAt && (
                          <button
                            className="mt-3 text-sm text-red-600 hover:text-red-800 font-medium hover:underline"
                            onClick={() => handleCancelRequest(req.id)}
                          >
                            Cancel / Request Refund
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* History Pagination */}
              {totalHistoryPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-12">
                  <button
                    onClick={() => goToHistoryPage(historyPage - 1)}
                    disabled={historyPage === 1}
                    className="p-4 rounded-full bg-white border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition shadow-sm"
                  >
                    <ChevronLeft className="h-6 w-6 text-gray-700" />
                  </button>

                  <span className="text-sm font-medium px-4 py-2 bg-gray-100 rounded-lg">
                    Page {historyPage} of {totalHistoryPages}
                  </span>

                  <button
                    onClick={() => goToHistoryPage(historyPage + 1)}
                    disabled={historyPage === totalHistoryPages}
                    className="p-4 rounded-full bg-white border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition shadow-sm"
                  >
                    <ChevronRight className="h-6 w-6 text-gray-700" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}