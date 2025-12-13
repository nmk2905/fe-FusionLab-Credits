import { API_ENDPOINTS_SEMESTER } from "../../constants/apiEndPoint";
import { apiUtils } from "../../utils/apiUtils";

const semesterService = {
  async getCurrentSemester(pageSize = 1000, pageIndex = 1, keyword = "") {
    return apiUtils.get(
      API_ENDPOINTS_SEMESTER.GET_CURRENT_SEMESTER(pageSize, pageIndex, keyword)
    );
  },

  async getSemesterById(semesterId) {
    return apiUtils.get(API_ENDPOINTS_SEMESTER.GET_SEMESTER_BY_ID(semesterId));
  },

  async addSemester(semesterData) {
    return apiUtils.post(API_ENDPOINTS_SEMESTER.ADD_SEMESTER, semesterData);
  },
};

export default semesterService;
