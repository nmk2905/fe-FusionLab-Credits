import { performApiRequest } from "../../utils/apiUtils";
import { API_ENDPOINTS_PROJECT } from "../../constants/apiEndPoint";

const projectService = {
  async getProjectById(projectId) {
    return performApiRequest(
      API_ENDPOINTS_PROJECT.GET_PROJECT_BY_ID(projectId),
      { method: "get" }
    );
  },
};

export default projectService;
