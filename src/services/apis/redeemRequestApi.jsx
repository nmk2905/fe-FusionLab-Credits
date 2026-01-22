// src/services/apis/redeemRequestApi.jsx

import { apiUtils } from "../../utils/apiUtils";
import { API_ENDPOINTS_REDEEM } from "../../constants/apiEndPoint";

const redeemRequestService = {
  /**
   * Get paginated list of redeem requests with filters
   */
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
    const url = API_ENDPOINTS_REDEEM.GET_ALL({
      pageIndex,
      pageSize,
      keyword,
      status,
      userId,
      rewardItemId,
      collected,
      sortColumn,
      sortDir,
    });
    return apiUtils.get(url);
  },

  /**
   * Create a new redeem request
   */
  async createRedeemRequest({ quantity, userId, rewardItemId }) {
    const payload = { quantity, userId, rewardItemId };
    // FIX APPLIED: Removed () because CREATE is a string, not a function
    return apiUtils.post(API_ENDPOINTS_REDEEM.CREATE, payload);
  },

  /**
   * Get paginated redeem requests for a specific user
   */
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
    const url = API_ENDPOINTS_REDEEM.GET_BY_USER(userId, {
      pageIndex,
      pageSize,
      status,
      collected,
      sortColumn,
      sortDir,
    });
    return apiUtils.get(url);
  },

  /**
   * Get single redeem request by ID
   */
  async getRedeemRequestById(id) {
    return apiUtils.get(API_ENDPOINTS_REDEEM.GET_BY_ID(id));
  },

  /**
   * Delete a redeem request
   */
  async deleteRedeemRequest(id) {
    return apiUtils.delete(API_ENDPOINTS_REDEEM.DELETE(id));
  },

  /**
   * Update status of a redeem request (admin/finance)
   */
  async updateRedeemRequestStatus(id, status) {
    return apiUtils.put(API_ENDPOINTS_REDEEM.UPDATE_STATUS(id), { status });
  },

  /**
   * Mark request as collected (usually by user or admin)
   */
  async markAsCollected(id) {
    return apiUtils.put(API_ENDPOINTS_REDEEM.MARK_COLLECTED(id));
  },
};

export default redeemRequestService;