import { performApiRequest } from "../../utils/apiUtils";
import { apiUtils } from "../../utils/apiUtils";
import { API_ENDPOINTS_USER } from "../../constants/apiEndPoint";

const userService = {
  async getUsers({
    role,
    pageIndex = 1,
    pageSize = 1000,
    sortDir = "desc",
    search = "",
  } = {}) {
    return performApiRequest(
      API_ENDPOINTS_USER.GET_USERS(role, pageIndex, pageSize, sortDir, search),
      { method: "get" },
    );
  },

  async getCurrentUser(userId) {
    return apiUtils.get(API_ENDPOINTS_USER.GET_USER(userId));
  },

  async deleteUser(userId) {
    return apiUtils.delete(API_ENDPOINTS_USER.DELETE_USER(userId));
  },
};

export default userService;
