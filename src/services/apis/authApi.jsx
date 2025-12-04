import { performApiRequest } from "../../utils/apiUtils";
import { API_ENDPOINTS_AUTH } from "../../constants/apiEndPoint";

const authService = {
  async login(loginData) {
    return performApiRequest(API_ENDPOINTS_AUTH.LOGIN, {
      method: "post",
      data: loginData,
    });
  },
};

export default authService;
