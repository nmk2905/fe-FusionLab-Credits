// src/services/apis/rewardItemApi.jsx

import { apiUtils } from "../../utils/apiUtils";
import { API_ENDPOINTS_REWARD } from "../../constants/apiEndPoint";

const rewardItemService = {
  /**
   * Get paged reward items with optional filters (isActive, sortDir, etc.)
   * @param {Object} params - The parameters for fetching reward items.
   * @param {number} params.pageIndex - The page index (default is 1).
   * @param {number} params.pageSize - The page size (default is 100).
   * @param {boolean} params.isActive - Filter by active status (default is true).
   * @param {string} params.sortDir - Sort direction, either 'Asc' or 'Desc' (default is 'Asc').
   * @returns {Promise} - A promise that resolves to the paged reward items.
   */
  async getRewardItems({
    pageIndex = 1,
    pageSize = 100,
    isActive = true,
    sortDir = "Desc",
  }) {
    const endpoint = API_ENDPOINTS_REWARD.GET_REWARDS_ITEMS(
      pageIndex,
      pageSize,
      isActive,
      sortDir
    );

    return apiUtils.get(endpoint);
  },

  async getRewardItemById(id) {
    return apiUtils.get(API_ENDPOINTS_REWARD.GET_REWARDS_ITEM_BY_ID(id));
  },

  async createRewardItem(rewardItemData) {
    return apiUtils.post(
      API_ENDPOINTS_REWARD.CREATE_REWARD_ITEM,
      rewardItemData
    );
  },

  async updateRewardItem(id) {
    return apiUtils.put(API_ENDPOINTS_REWARD.UPDATE_REWARD_ITEM(id));
  },
  async deleteRewardItem(id) {
    return apiUtils.delete(API_ENDPOINTS_REWARD.DELETE_REWARD_ITEM(id));
  },
};

export default rewardItemService;
