import React, { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  FolderPlus,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  Wallet,
  History,
  BarChart2,
} from "lucide-react";
import { AuthContext } from "../../../contexts/AuthContext"; // Assuming path is correct
import walletService from "../../../services/apis/walletService"; // Adjust path if needed
import { apiUtils } from "../../../utils/apiUtils"; // Adjust path if needed
import { API_ENDPOINTS_REDEEM } from "../../../constants/apiEndPoint"; // Adjust path if needed

// Define redeemService similar to walletService
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
        // Fetch wallet
        const walletRes = await walletService.getWalletByUser(user.id);
        setWallet(walletRes?.data || walletRes);

        // Fetch balance (though wallet has it, but using the endpoint)
        const balanceRes = await walletService.getWalletBalance(user.id);
        setBalance(balanceRes?.data?.balance || balanceRes?.balance || 0);

        // Fetch redeem history (assuming this is the point usage history)
        const redeemRes = await redeemService.getRedeemsByUser(user.id);
        let history = [];
        if (redeemRes?.data && Array.isArray(redeemRes.data)) {
          history = redeemRes.data;
        } else if (Array.isArray(redeemRes)) {
          history = redeemRes;
        }
        setRedeemHistory(history.sort((a, b) => new Date(b.createdAt || b.requestedAt) - new Date(a.createdAt || a.requestedAt)));

        // Process monthly data (assuming each redeem has 'points' or 'quantity' * cost, but since schema unknown, assume 'pointsUsed')
        const monthly = {};
        history.forEach((item) => {
          const date = new Date(item.createdAt || item.requestedAt || item.updatedAt);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          if (!monthly[monthKey]) {
            monthly[monthKey] = { spent: 0, count: 0 };
          }
          // Assuming item has 'pointsUsed' field; adjust based on actual API response
          const pointsUsed = item.pointsUsed || item.quantity * (item.rewardItem?.cost || 0) || 0;
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

  // Simple bar chart renderer using divs (no external chart lib assumed)
  const renderMonthlyChart = () => {
    const months = Object.keys(monthlyData).sort();
    if (months.length === 0) return <p className="text-gray-600">No data available for chart.</p>;

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
              Last updated: {new Date(wallet?.lastUpdatedAt).toLocaleString()}
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
              Diagram showing points spent per month.
            </p>
          </div>
        </div>

        {/* History Section */}
        <div className="p-8 border-t border-gray-100">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <History size={20} className="text-purple-500" />
            Points Usage History
          </h3>
          {redeemHistory.length === 0 ? (
            <p className="text-gray-600">No usage history yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points Used</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {redeemHistory.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(item.createdAt || item.requestedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.status}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.pointsUsed || item.quantity * (item.rewardItem?.cost || 0) || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.rewardItem?.name || item.description || 'Redeem request'}
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