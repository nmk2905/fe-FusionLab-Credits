import { API_ENDPOINTS_TASK } from "../../constants/apiEndPoint";
import { apiUtils } from "../../utils/apiUtils";

const taskService = {
  async getTasksByMilestone(milestoneId, pageIndex, pageSize, sortDir) {
    return apiUtils.get(
      API_ENDPOINTS_TASK.GET_TASKS_BY_MILESTONE(
        milestoneId,
        pageIndex,
        pageSize,
        sortDir
      )
    );
  },

  async getTaskById(taskId) {
    return apiUtils.get(API_ENDPOINTS_TASK.GET_TASK_BY_ID(taskId));
  },

  async addTask(taskData) {
    return apiUtils.post(API_ENDPOINTS_TASK.ADD_TASK, taskData);
  },

  async updateTask(taskId, taskData) {
    return apiUtils.put(API_ENDPOINTS_TASK.UPDATE_TASK(taskId), taskData);
  },

  async deleteTask(taskId) {
    return apiUtils.delete(API_ENDPOINTS_TASK.DELETE_TASK(taskId));
  },
};

export default taskService;