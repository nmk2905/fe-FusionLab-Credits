import { performApiRequest } from "../../utils/apiUtils";
import { API_ENDPOINTS_USER } from "../../constants/apiEndPoint";

const userService = {
  async getCurrentUser() {
    return performApiRequest(API_ENDPOINTS_USER.GET_USER, { method: "get" });
  },
};

export default userService;
