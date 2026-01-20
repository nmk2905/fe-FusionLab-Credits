// src/services/apis/redeemRequestApi.jsx

import { apiUtils } from "../../utils/apiUtils";
import { API_ENDPOINTS_REDEEM } from "../../constants/apiEndPoint";

const redeemRequestService = {
  async getAllRedeemRequests({
    pageIndex = 1,
    pageSize = 10,
    keyword = "",
    status = "",
    userId = null,
    rewardItemId = null,
    collected = null,
    sortColumn = "Id",
    sortDir = "Asc",
  } = {}) {
    let url = `/api/redeemrequests?pageIndex=${pageIndex}&pageSize=${pageSize}&sortColumn=${sortColumn}&sortDir=${sortDir}`;

    if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
    if (status) url += `&status=${encodeURIComponent(status)}`;
    if (userId !== null && userId !== undefined) url += `&userId=${userId}`;
    if (rewardItemId !== null && rewardItemId !== undefined) url += `&rewardItemId=${rewardItemId}`;
    if (collected !== null && collected !== undefined) url += `&collected=${collected}`;

    return apiUtils.get(url);
  },

  async createRedeemRequest({ quantity, userId, rewardItemId }) {
    const payload = { quantity, userId, rewardItemId };
    return apiUtils.post("/api/redeemrequests", payload);
  },

  async getRedeemRequestsByUser(
    userId,
    {
      pageIndex = 1,
      pageSize = 10,
      status = "",
      collected = null,
      sortColumn = "Id",
      sortDir = "Asc",
    } = {}
  ) {
    let url = `/api/redeemrequests/by-user/${userId}?pageIndex=${pageIndex}&pageSize=${pageSize}&sortColumn=${sortColumn}&sortDir=${sortDir}`;

    if (status) url += `&status=${encodeURIComponent(status)}`;
    if (collected !== null && collected !== undefined) url += `&collected=${collected}`;

    return apiUtils.get(url);
  },

  async getRedeemRequestById(id) {
    return apiUtils.get(`/api/redeemrequests/${id}`);
  },

  async deleteRedeemRequest(id) {
    return apiUtils.delete(`/api/redeemrequests/${id}`);
  },

  async updateRedeemRequestStatus(id, status) {
    return apiUtils.put(`/api/redeemrequests/${id}/status`, { status });
  },

  async markAsCollected(id) {
    return apiUtils.put(`/api/redeemrequests/${id}/collect`);
  },
};

export default redeemRequestService;