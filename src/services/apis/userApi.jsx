import { performApiRequest } from "../../utils/apiUtils";
import { API_ENDPOINTS_USER } from "../../constants/apiEndPoint";

const userService = {
  async getCurrentUser(userId) {
    return performApiRequest(API_ENDPOINTS_USER.GET_USER(userId), {
      method: "get",
    });
  },
};

export default userService;
