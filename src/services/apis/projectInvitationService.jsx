// src/services/apis/projectInvitationService.js

import { apiUtils } from "../../utils/apiUtils";
import { API_ENDPOINTS_PROJECT_INVITATION } from "../../constants/apiEndPoint";

/**
 * Service dedicated to Project Invitation APIs
 */
const projectInvitationService = {
  /**
   * Send an invitation to a user to join a project
   * POST /api/project-invitations
   *
   * @param {Object} params
   * @param {number} params.projectId - ID of the project
   * @param {number} params.invitedUserId - ID of the user being invited
   * @param {string} [params.message=""] - Optional personal message
   * @returns {Promise<Object>} Normalized API response
   */
  async sendInvitation({ projectId, invitedUserId, message = "" }) {
    const payload = {
      projectId,
      invitedUserId,
      message: message.trim(),
    };

    return apiUtils.post(API_ENDPOINTS_PROJECT_INVITATION.SEND_INVITATION, payload);
  },

  /**
   * Accept or reject a project invitation
   * POST /api/project-invitations/accept
   *
   * @param {string} inviteCode - The invitation code received (usually from email or notification)
   * @param {boolean} [accept=true] - true = accept, false = reject
   * @returns {Promise<Object>} Normalized API response
   */
  async respondToInvitation(inviteCode, accept = true) {
    const payload = {
      inviteCode,
      accept,
    };

    return apiUtils.post(API_ENDPOINTS_PROJECT_INVITATION.RESPOND_INVITATION, payload);
  },

  /**
   * Get list of invitations sent for a specific project (e.g., view who was invited)
   * GET /api/project-invitations/project/{projectId}
   *
   * @param {number} projectId
   * @param {number} [pageIndex=1]
   * @param {number} [pageSize=10]
   * @returns {Promise<Object>} Normalized API response
   */
  async getInvitationsByProject(projectId, pageIndex = 1, pageSize = 10) {
    const endpoint = API_ENDPOINTS_PROJECT_INVITATION.GET_INVITATIONS_BY_PROJECT(
      projectId,
      pageIndex,
      pageSize
    );
    return apiUtils.get(endpoint);
  },

  /**
   * Get details of a single invitation by its ID
   * GET /api/project-invitations/{id}
   *
   * @param {number} invitationId
   * @returns {Promise<Object>} Normalized API response
   */
  async getInvitationById(invitationId) {
    return apiUtils.get(API_ENDPOINTS_PROJECT_INVITATION.GET_INVITATION_BY_ID(invitationId));
  },

  /**
   * Cancel / delete an invitation that was previously sent
   * DELETE /api/project-invitations/{id}
   *
   * @param {number} invitationId
   * @returns {Promise<Object>} Normalized API response
   */
  async cancelInvitation(invitationId) {
    return apiUtils.delete(API_ENDPOINTS_PROJECT_INVITATION.DELETE_INVITATION(invitationId));
  },

  /**
   * Helper: Reject invitation (convenience wrapper)
   */
  async rejectInvitation(inviteCode) {
    return this.respondToInvitation(inviteCode, false);
  },
};

export default projectInvitationService;