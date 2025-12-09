import { apiUtils } from "../../utils/apiUtils";
import { API_ENDPOINTS_AUTH } from "../../constants/apiEndPoint";

const authService = {
  async login(loginData) {
    return apiUtils.post(API_ENDPOINTS_AUTH.LOGIN, loginData);
  },

  async register(registerData) {
    return apiUtils.post(API_ENDPOINTS_AUTH.REGISTER, registerData);
  },

  async registerMentor(registerData) {
    return apiUtils.post(API_ENDPOINTS_AUTH.REGISTER_MENTOR, registerData);
  },

  async registerFinance(registerData) {
    return apiUtils.post(API_ENDPOINTS_AUTH.REGISTER_FINANCE, registerData);
  },
};

export default authService;
