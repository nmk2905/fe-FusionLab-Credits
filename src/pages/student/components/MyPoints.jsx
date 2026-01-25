// src/pages/student/components/MyPoints.jsx
import React, { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  History,
  BarChart2,
  Clock,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { AuthContext } from "../../../contexts/AuthContext";
import walletService from "../../../services/apis/walletService";
import rewardItemService from "../../../services/apis/rewardItemApi";
import redeemRequestService from "../../../services/apis/redeemRequestApi"; // if you want to use it directly
import { apiUtils } from "../../../utils/apiUtils";
import { API_ENDPOINTS_REDEEM } from "../../../constants/apiEndPoint";

// Optional: if you prefer to use redeemRequestService instead of defining redeemService
// But since you already have it in the file, we keep the local definition for consistency
const redeemService = {
  async getRedeemsByUser(userId) {
    const url = API_ENDPOINTS_REDEEM.GET_BY_USER(userId);
    return apiUtils.get(url);
  },
};

export default function MyPoints() {
  const { user } = useContext(AuthContext);
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(0);
  const [redeemHistory, setRedeemHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monthlyData, setMonthlyData] = useState({});

  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Fetch wallet
        const walletRes = await walletService.getWalletByUser(user.id);
        setWallet(walletRes?.data || walletRes);

        // 2. Fetch balance
        const balanceRes = await walletService.getWalletBalance(user.id);
        setBalance(balanceRes?.data?.balance || balanceRes?.balance || 0);

        // 3. Fetch all redeem requests for this user
        const redeemRes = await redeemService.getRedeemsByUser(user.id);
        let history = [];
        if (redeemRes?.data && Array.isArray(redeemRes.data)) {
          history = redeemRes.data;
        } else if (Array.isArray(redeemRes)) {
          history = redeemRes;
        } else if (redeemRes?.rawResponse?.data && Array.isArray(redeemRes.rawResponse.data)) {
          history = redeemRes.rawResponse.data;
        }

        // 4. Filter only collected items
        const collectedHistory = history.filter(
          (item) =>
            item.collectedAt !== null ||
            item.status === "PickedUp" ||
            item.status === "Collected"
        );

        // 5. Enrich each collected item with reward details
        const enrichedHistory = await Promise.all(
          collectedHistory.map(async (item) => {
            try {
              const rewardRes = await rewardItemService.getRewardItemById(item.rewardItemId);
              let rewardItem = null;

              if (rewardRes?.data) {
                rewardItem = rewardRes.data;
              } else if (rewardRes?.rawResponse?.data) {
                rewardItem = rewardRes.rawResponse.data;
              }

              return {
                ...item,
                rewardItem: rewardItem || { name: `Reward #${item.rewardItemId}`, description: "" },
              };
            } catch (err) {
              console.warn(`Failed to fetch reward item ${item.rewardItemId}:`, err);
              return {
                ...item,
                rewardItem: { name: `Reward #${item.rewardItemId}`, description: "" },
              };
            }
          })
        );

        // 6. Sort by collected date (fallback to requestedAt)
        enrichedHistory.sort((a, b) => {
          const dateA = new Date(a.collectedAt || a.requestedAt);
          const dateB = new Date(b.collectedAt || b.requestedAt);
          return dateB - dateA;
        });

        setRedeemHistory(enrichedHistory);

        // 7. Process monthly data (only collected items)
        const monthly = {};
        enrichedHistory.forEach((item) => {
          const date = new Date(item.collectedAt || item.requestedAt || item.updatedAt);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          if (!monthly[monthKey]) {
            monthly[monthKey] = { spent: 0, count: 0 };
          }
          const pointsUsed = item.totalPoints || item.quantity * (item.rewardItem?.priceInPoints || 0) || 0;
          monthly[monthKey].spent += pointsUsed;
          monthly[monthKey].count += 1;
        });
        setMonthlyData(monthly);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load your points data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  // Simple bar chart renderer using divs
  const renderMonthlyChart = () => {
    const months = Object.keys(monthlyData).sort();
    if (months.length === 0) return <p className="text-gray-600">No collected data available for chart.</p>;

    const maxSpent = Math.max(...Object.values(monthlyData).map((d) => d.spent), 1);

    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-end h-40">
          {months.map((month) => {
            const data = monthlyData[month];
            const height = (data.spent / maxSpent) * 100;
            return (
              <motion.div
                key={month}
                className="bg-orange-500 rounded-t-lg w-16"
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.5 }}
              >
                <span className="text-xs text-white font-bold flex justify-center mt-1">
                  {data.spent}
                </span>
              </motion.div>
            );
          })}
        </div>
        <div className="flex justify-between">
          {months.map((month) => (
            <span key={month} className="text-xs text-gray-600">
              {month}
            </span>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Clock className="animate-spin h-12 w-12 text-orange-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <AlertCircle size={64} className="mx-auto mb-6 text-red-500" />
        <h2 className="text-2xl font-bold text-gray-800">Error</h2>
        <p className="mt-3 text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
      >
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-6 text-white">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Wallet size={24} />
            My Points
          </h2>
        </div>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Balance Section */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <CheckCircle size={20} className="text-green-500" />
              Total Balance
            </h3>
            <p className="text-4xl font-bold text-orange-600">{balance} points</p>
            <p className="text-sm text-gray-600 mt-2">
              Last updated: {new Date(wallet?.lastUpdatedAt || Date.now()).toLocaleString()}
            </p>
          </div>

          {/* Monthly Chart Section */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BarChart2 size={20} className="text-blue-500" />
              Monthly Points Management
            </h3>
            {renderMonthlyChart()}
            <p className="text-sm text-gray-600 mt-4">
              Diagram showing points spent per month (only collected redemptions).
            </p>
          </div>
        </div>

        {/* History Section - only collected items with reward details */}
        <div className="p-8 border-t border-gray-100">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <History size={20} className="text-purple-500" />
            Collected Rewards History
          </h3>

          {redeemHistory.length === 0 ? (
            <p className="text-gray-600">No collected rewards yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Collected Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reward
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Points Used
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {redeemHistory.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.collectedAt
                          ? new Date(item.collectedAt).toLocaleDateString()
                          : new Date(item.requestedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="font-medium">
                          {item.rewardItem?.name || `Reward #${item.rewardItemId}`}
                        </div>
                        {item.rewardItem?.description && (
                          <div className="text-xs text-gray-500 mt-1 line-clamp-2 max-w-xs">
                            {item.rewardItem.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.quantity || 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-orange-700">
                        {item.totalPoints?.toLocaleString() || "—"} pts
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            item.status === "PickedUp" || item.status === "Collected"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}