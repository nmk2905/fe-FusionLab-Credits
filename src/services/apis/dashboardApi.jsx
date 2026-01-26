// src/services/dashboardService.js

import { apiUtils } from "../../utils/apiUtils";
import { API_ENDPOINTS_DASHBOARD } from "../../constants/apiEndPoint";

const dashboardService = {
  /**
   * Get project status counts for the semester
   * (total, open, inProcess, close, complete)
   *
   * @param {number} semesterId
   * @returns {Promise<{ total: number, open: number, inProcess: number, close: number, complete: number }>}
   */
  async getProjectCounts(semesterId) {
    if (!semesterId) throw new Error("semesterId is required");

    return apiUtils.get(API_ENDPOINTS_DASHBOARD.GET_PROJECT_COUNTS(semesterId));
  },

  /**
   * Get total number of users (students + mentors + ...) in the semester
   *
   * @param {number} semesterId
   * @returns {Promise<{ totalUsers: number } | any>}
   */
  async getTotalUsers(semesterId) {
    if (!semesterId) throw new Error("semesterId is required");

    return apiUtils.get(API_ENDPOINTS_DASHBOARD.GET_TOTAL_USERS(semesterId));
  },

  /**
   * Fetch basic dashboard overview data in parallel
   * → Easy to extend when more stats are added
   *
   * @param {number} semesterId
   * @returns {Promise<{
   *   projectStats: object,
   *   userStats: object,
   *   // taskStats?: object,
   *   // ...
   * }>}
   */
  async getDashboardOverview(semesterId) {
    if (!semesterId) throw new Error("semesterId is required");

    try {
      const [projectStats, userStats] = await Promise.all([
        this.getProjectCounts(semesterId),
        this.getTotalUsers(semesterId),
      ]);

      return {
        projectStats,
        userStats,
        // Add new fields here later, e.g.:
        // taskStats:       await this.getTaskCounts(semesterId),
        // mentorStats:     await this.getActiveMentors(semesterId),
      };
    } catch (error) {
      console.error("Dashboard overview failed:", error);
      throw error; // let the component handle the error UI
    }
  },

  // ────────────────────────────────────────────────
  //    Add more specific methods when backend adds endpoints
  // ────────────────────────────────────────────────

  // Example (uncomment when you add the endpoint):
  /*
  async getTaskCounts(semesterId) {
    if (!semesterId) throw new Error("semesterId is required");
    return apiUtils.get(API_ENDPOINTS_DASHBOARD.GET_TASK_COUNTS(semesterId));
  },
  */
};

export default dashboardService;