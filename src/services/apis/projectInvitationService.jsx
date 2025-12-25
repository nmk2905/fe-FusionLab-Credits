// src/services/apis/projectInvitationService.js

import { apiUtils } from "../../utils/apiUtils";
import { API_ENDPOINTS_PROJECT_INVITATION } from "../../constants/apiEndPoint";

const projectInvitationService = {
  async sendInvitation({ projectId, invitedUserId, message = "" }) {
    const payload = {
      projectId,
      invitedUserId,
      message: message.trim(),
    };

    return apiUtils.post(
      API_ENDPOINTS_PROJECT_INVITATION.SEND_INVITATION,
      payload
    );
  },
  async respondToInvitation(inviteCode, accept = true) {
    const payload = {
      inviteCode,
      accept,
    };

    return apiUtils.post(
      API_ENDPOINTS_PROJECT_INVITATION.RESPOND_INVITATION,
      payload
    );
  },

  async getInvitationsByProject(projectId, pageIndex = 1, pageSize = 10) {
    const endpoint =
      API_ENDPOINTS_PROJECT_INVITATION.GET_INVITATIONS_BY_PROJECT(
        projectId,
        pageIndex,
        pageSize
      );
    return apiUtils.get(endpoint);
  },

  async getInvitationById(invitationId) {
    return apiUtils.get(
      API_ENDPOINTS_PROJECT_INVITATION.GET_INVITATION_BY_ID(invitationId)
    );
  },

  async cancelInvitation(invitationId) {
    return apiUtils.delete(
      API_ENDPOINTS_PROJECT_INVITATION.DELETE_INVITATION(invitationId)
    );
  },

  async rejectInvitation(inviteCode) {
    return this.respondToInvitation(inviteCode, false);
  },
};

export default projectInvitationService;
