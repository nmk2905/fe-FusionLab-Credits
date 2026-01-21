// api/submissionApi.js  (or wherever this file lives)

import { API_ENDPOINTS_SUBMISSION } from "../../constants/apiEndPoint";   // ← import here
import { apiUtils } from "../../utils/apiUtils";

const submissionApi = {
  /**
   * Get paginated list of submissions with optional filters
   * @param {Object} params
   */
  async getSubmissions({
    pageIndex = 1,
    pageSize = 10,
    userId,
    taskId,
    sortColumn = "Id",
    sortDir = "Asc",
  } = {}) {
    const url = API_ENDPOINTS_SUBMISSION.GET_ALL(
      pageIndex,
      pageSize,
      userId,
      taskId,
      sortColumn,
      sortDir
    );
    return apiUtils.get(url);
  },

  /**
   * Get a single submission by ID
   */
  async getSubmissionById(id) {
    return apiUtils.get(API_ENDPOINTS_SUBMISSION.GET_BY_ID(id));
  },

  /**
   * Create a new submission (file upload)
   */
  async createSubmission({ taskId, userId, file }) {
    const formData = new FormData();
    formData.append("TaskId", taskId);
    formData.append("UserId", userId);
    formData.append("File", file);

    return apiUtils.post(API_ENDPOINTS_SUBMISSION.CREATE, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  /**
   * Update submission
   */
  async updateSubmission(id, data) {
    return apiUtils.put(API_ENDPOINTS_SUBMISSION.UPDATE(id), data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  /**
   * Delete a submission
   */
  async deleteSubmission(id) {
    return apiUtils.delete(API_ENDPOINTS_SUBMISSION.DELETE(id));
  },

  /**
   * Review/grade a submission (mentor only)
   */
  async reviewSubmission(id, reviewData) {
    return apiUtils.put(API_ENDPOINTS_SUBMISSION.REVIEW(id), reviewData);
  },
};

export default submissionApi;