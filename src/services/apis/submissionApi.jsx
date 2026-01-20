
import { API_ENDPOINTS_SUBMISSION } from "../../constants/apiEndPoint";  // you can move endpoints here later
import { apiUtils } from "../../utils/apiUtils";

// You can later move these into apiEndPoint.js like the others
const SUBMISSION_ENDPOINTS = {
  GET_ALL: (pageIndex = 1, pageSize = 10, userId = "", taskId = "", sortColumn = "Id", sortDir = "Asc") =>
    `/api/submissions?pageIndex=${pageIndex}&pageSize=${pageSize}` +
    (userId ? `&userId=${userId}` : "") +
    (taskId ? `&taskId=${taskId}` : "") +
    `&sortColumn=${sortColumn}&sortDir=${sortDir}`,

  GET_BY_ID: (id) => `/api/submissions/${id}`,

  CREATE: "/api/submissions",

  UPDATE: (id) => `/api/submissions/${id}`,

  DELETE: (id) => `/api/submissions/${id}`,

  REVIEW: (id) => `/api/submissions/${id}/review`,
};

const submissionApi = {
  /**
   * Get paginated list of submissions with optional filters
   * @param {Object} params
   * @param {number} [params.pageIndex=1]
   * @param {number} [params.pageSize=10]
   * @param {number} [params.userId]
   * @param {number} [params.taskId]
   * @param {string} [params.sortColumn="Id"]
   * @param {string} [params.sortDir="Asc"]
   */
  async getSubmissions({
    pageIndex = 1,
    pageSize = 10,
    userId,
    taskId,
    sortColumn = "Id",
    sortDir = "Asc",
  } = {}) {
    const url = SUBMISSION_ENDPOINTS.GET_ALL(
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
   * @param {number} id
   */
  async getSubmissionById(id) {
    return apiUtils.get(SUBMISSION_ENDPOINTS.GET_BY_ID(id));
  },

  /**
   * Create a new submission (file upload)
   * @param {Object} data
   * @param {number} data.taskId
   * @param {number} data.userId
   * @param {File} data.file
   */
  async createSubmission({ taskId, userId, file }) {
    const formData = new FormData();
    formData.append("TaskId", taskId);
    formData.append("UserId", userId);
    formData.append("File", file);

    return apiUtils.post(SUBMISSION_ENDPOINTS.CREATE, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  /**
   * Update submission (usually for admin/mentor)
   * @param {number} id
   * @param {Object} data
   */
  async updateSubmission(id, data) {
    return apiUtils.put(SUBMISSION_ENDPOINTS.UPDATE(id), data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  /**
   * Delete a submission
   * @param {number} id
   */
  async deleteSubmission(id) {
    return apiUtils.delete(SUBMISSION_ENDPOINTS.DELETE(id));
  },

  /**
   * Review/grade a submission (mentor only)
   * @param {number} id
   * @param {Object} reviewData
   * @param {string} reviewData.decision
   * @param {string} [reviewData.feedback]
   * @param {number} [reviewData.score]
   * @param {boolean} [reviewData.extendDeadline]
   */
  async reviewSubmission(id, reviewData) {
    return apiUtils.put(SUBMISSION_ENDPOINTS.REVIEW(id), reviewData);
  },
};

export default submissionApi;