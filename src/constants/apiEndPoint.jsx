export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

// Các endpoint cho xác thực
export const API_ENDPOINTS_AUTH = {
  LOGIN: "/api/Auth/login",
  REGISTER: "/api/Auth/register",
  REGISTER_MENTOR: "/api/Auth/register-mentor",
  REGISTER_FINANCE: "/api/Auth/register-finance",
};

// Các endpoint cho user
export const API_ENDPOINTS_USER = {
  GET_USERS: (
    role = "",
    pageIndex = 1,
    pageSize = 1000,
    sortDir = "desc",
    search = ""
  ) =>
    `/api/Users?Search=${search}&Role=${role}&PageIndex=${pageIndex}&PageSize=${pageSize}&SortDir=${sortDir}`,
  GET_USER: (userId) => `/api/Users/${userId}`,
  UPDATE_INFORMATION_USER: "/api/User/UpdateInfoUser",
};

export const API_ENDPOINTS_PROJECT = {
  GET_ALL_PROJECTS: (pageSize = 100, pageIndex = 1, sortDir = "") =>
    `/api/projects?pageIndex=${pageIndex}&pageSize=${pageSize}&sortDir=${sortDir}`,
  GET_PROJECT_BY_ID: (projectId) => `/api/projects/${projectId}`,
  GET_PROJECT_BY_MENTOR_ID: (mentorId, pageSize, pageIndex, sortDir) =>
    `/api/projects/mentor/${mentorId}?pageIndex=${pageIndex}&pageSize=${pageSize}&sortDir=${sortDir}`,
  ADD_PROJECT: "/api/projects",
};

export const API_ENDPOINTS_SEMESTER = {
  GET_CURRENT_SEMESTER: (pageSize, pageIndex, keyword) =>
    `/api/semesters?pageIndex=${pageIndex}&pageSize=${pageSize}&keyword=${keyword}`,
  GET_SEMESTER_BY_ID: (semesterId) => `/api/semesters/${semesterId}`,
  ADD_SEMESTER: "/api/semesters",
};

export const API_ENDPOINTS_PROJECT_INVITATION = {
  SEND_INVITATION: "/api/project-invitations",
  RESPOND_INVITATION: "/api/project-invitations/accept-or-deny",   // ← changed
  GET_INVITATIONS_BY_PROJECT: (projectId, pageIndex = 1, pageSize = 10) =>
    `/api/project-invitations/project/${projectId}?pageIndex=${pageIndex}&pageSize=${pageSize}`,
  GET_INVITATION_BY_ID: (id) => `/api/project-invitations/${id}`,
  DELETE_INVITATION: (id) => `/api/project-invitations/${id}`,
};

export const API_ENDPOINTS_PROJECT_MEMBER = {
  GET_ALL: "/api/project-members",
  GET_BY_ID: (id) => `/api/project-members/${id}`,
  JOIN: "/api/project-members",
  UPDATE_ROLE: (id) => `/api/project-members/${id}`,
  DELETE: (id) => `/api/project-members/${id}`,
  LEAVE: "/api/project-members/leave",
};

export const API_ENDPOINTS_MILESTONE = {
  GET_MILESTONES_BY_PROJECT: (pageIndex, pageSize, projectId, sortDir) =>
    `/api/milestones?pageIndex=${pageIndex}&pageSize=${pageSize}&projectId=${projectId}&sortDir=${sortDir}`,
  GET_MILESTONE_BY_ID: (milestoneId) => `/api/milestones/${milestoneId}`,
  ADD_MILESTONE: "/api/milestones",
  UPDATE_MILESTONE: (milestoneId) => `/api/milestones/${milestoneId}`,
  DELETE_MILESTONE: (milestoneId) => `/api/milestones/${milestoneId}`,
};

export const API_ENDPOINTS_TASK = {
  GET_TASKS_BY_MILESTONE: (milestoneId, pageIndex, pageSize, sortDir) =>
    `/api/tasks?milestoneId=${milestoneId}&pageIndex=${pageIndex}&pageSize=${pageSize}&sortDir=${sortDir}`,
  GET_TASK_BY_ID: (taskId) => `/api/tasks/${taskId}`,
  ADD_TASK: "/api/tasks",
  UPDATE_TASK: (taskId) => `/api/tasks/${taskId}`,
  DELETE_TASK: (taskId) => `/api/tasks/${taskId}`,
};
// constants/apiEndPoint.js
export const API_ENDPOINTS_SUBMISSION = {
  GET_ALL_SUBMISSIONS: (pageIndex = 1, pageSize = 10, userId = "", taskId = "", sortColumn = "Id", sortDir = "Asc") =>
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
