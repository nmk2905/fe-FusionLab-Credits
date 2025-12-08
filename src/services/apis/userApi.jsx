import { performApiRequest } from "../../utils/apiUtils";
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
      { method: "get" }
    );
  },

  async getCurrentUser(userId) {
    return performApiRequest(API_ENDPOINTS_USER.GET_USER(userId), {
      method: "get",
    });
  },
};

export default userService;
