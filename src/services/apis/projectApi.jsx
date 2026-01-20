import { apiUtils } from "../../utils/apiUtils";
import { API_ENDPOINTS_PROJECT } from "../../constants/apiEndPoint";

const projectService = {
  async getAllProjects(pageSize = 1000, pageIndex = 1, sortDir = "") {
    return apiUtils.get(
      API_ENDPOINTS_PROJECT.GET_ALL_PROJECTS(pageSize, pageIndex, sortDir)
    );
  },

  async getProjectById(projectId) {
    return apiUtils.get(API_ENDPOINTS_PROJECT.GET_PROJECT_BY_ID(projectId));
  },

  async getProjectByMentorId(mentorId, pageSize = 1000, pageIndex = 1, sortDir = "") {
    return apiUtils.get(
      API_ENDPOINTS_PROJECT.GET_PROJECT_BY_MENTOR_ID(mentorId, pageSize, pageIndex, sortDir)
    );
  },

  async addProject(projectData) {
    return apiUtils.post(API_ENDPOINTS_PROJECT.ADD_PROJECT, projectData);
  },
  async getUserProjectHistory(userId, { pageIndex = 1, pageSize = 20, sortColumn = "Id", sortDir = "Desc" } = {}) {
  return apiUtils.get(
    API_ENDPOINTS_PROJECT.GET_USER_HISTORY(userId, pageIndex, pageSize, sortColumn, sortDir)
  );}
};


export default projectService;
