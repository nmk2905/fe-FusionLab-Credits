import { API_ENDPOINTS_MILESTONE } from "../../constants/apiEndPoint";
import { apiUtils } from "../../utils/apiUtils";

const milestoneService = {
  async getMilestonesByProject(pageIndex, pageSize, projectId) {
    return apiUtils.get(
      API_ENDPOINTS_MILESTONE.GET_MILESTONES_BY_PROJECT(
        pageIndex,
        pageSize,
        projectId,
        "Desc"
      )
    );
  },

  async addMilestone(milestoneData) {
    return apiUtils.post(API_ENDPOINTS_MILESTONE.ADD_MILESTONE, milestoneData);
  },

  async updateMilestone(milestoneId, milestoneData) {
    return apiUtils.put(
      API_ENDPOINTS_MILESTONE.UPDATE_MILESTONE(milestoneId),
      milestoneData
    );
  },

  async deleteMilestone(milestoneId) {
    return apiUtils.delete(
      API_ENDPOINTS_MILESTONE.DELETE_MILESTONE(milestoneId)
    );
  },
};
export default milestoneService;
