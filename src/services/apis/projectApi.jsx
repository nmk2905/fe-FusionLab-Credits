import { apiUtils } from "../../utils/apiUtils";
import { API_ENDPOINTS_PROJECT } from "../../constants/apiEndPoint";

const projectService = {
  async getProjectById(projectId) {
    return apiUtils.get(API_ENDPOINTS_PROJECT.GET_PROJECT_BY_ID(projectId));
  },

  async addProject(projectData) {
    return apiUtils.post(API_ENDPOINTS_PROJECT.ADD_PROJECT, projectData);
  },
};

export default projectService;
