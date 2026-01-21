// Alternative version using constants (if you want to be 100% consistent)

import { apiUtils } from "../../utils/apiUtils";
import { API_ENDPOINTS_WALLET } from "../../constants/apiEndPoint";

const walletService = {
  async getAllWallets({ pageIndex = 1, pageSize = 10, keyword = "" } = {}) {
    const url = API_ENDPOINTS_WALLET.GET_ALL(pageIndex, pageSize, keyword);
    return apiUtils.get(url);
  },

  async getWalletByUser(userId) {
    return apiUtils.get(API_ENDPOINTS_WALLET.GET_BY_USER(userId));
  },

  async getWalletBalance(userId) {
    return apiUtils.get(API_ENDPOINTS_WALLET.GET_BALANCE(userId));
  },

  async deleteWallet(id) {
    return apiUtils.delete(API_ENDPOINTS_WALLET.DELETE(id));
  },
};

export default walletService;