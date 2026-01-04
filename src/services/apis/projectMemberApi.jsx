// src/services/apis/projectMemberApi.jsx

import { apiUtils } from "../../utils/apiUtils";
import { API_ENDPOINTS_PROJECT_MEMBER } from "../../constants/apiEndPoint";

const projectMemberApi = {
  /**
   * Get paged project members with optional filters (by projectId, userId, keyword, etc.)
   */
  async getProjectMembers({
    pageIndex = 1,
    pageSize = 100,
    keyword = "",
    projectId,
    userId,
    sortColumn = "Id",
    sortDir = "Asc",
  }) {
    let endpoint = `${API_ENDPOINTS_PROJECT_MEMBER.GET_ALL}?pageIndex=${pageIndex}&pageSize=${pageSize}&sortColumn=${sortColumn}&sortDir=${sortDir}`;

    if (keyword) {
      endpoint += `&keyword=${encodeURIComponent(keyword)}`;
    }
    if (projectId) {
      endpoint += `&projectId=${projectId}`;
    }
    if (userId) {
      endpoint += `&userId=${userId}`;
    }

    return apiUtils.get(endpoint);
  },

  /**
   * Join a project (add new member)
   */
  async joinProject({ role, userId, projectId }) {
    const payload = {
      role,
      userId,
      projectId,
    };

    return apiUtils.post(API_ENDPOINTS_PROJECT_MEMBER.JOIN, payload);
  },

  /**
   * Get a single project member by ID
   */
  async getProjectMemberById(id) {
    return apiUtils.get(API_ENDPOINTS_PROJECT_MEMBER.GET_BY_ID(id));
  },

  /**
   * Update role of a project member
   */
  async updateProjectMemberRole(id, role) {
    const payload = { role };

    return apiUtils.put(API_ENDPOINTS_PROJECT_MEMBER.UPDATE_ROLE(id), payload);
  },

  /**
   * Remove a member from a project
   */
  async removeProjectMember(id) {
    return apiUtils.delete(API_ENDPOINTS_PROJECT_MEMBER.DELETE(id));
  },
/**
 * Current user leaves a project
 */
async leaveProject({ userId, projectId }) {
  const payload = { 
    userId,
    projectId 
  };

  return apiUtils.post(API_ENDPOINTS_PROJECT_MEMBER.LEAVE, payload);
},
};

export default projectMemberApi;