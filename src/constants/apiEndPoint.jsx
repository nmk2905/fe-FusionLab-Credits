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
  GET_ALL_PROJECTS: (pageSize = 1000, pageIndex = 1, sortDir = "") =>
    `/api/projects?pageIndex=${pageIndex}&pageSize=${pageSize}&sortDir=${sortDir}`,
  GET_PROJECT_BY_ID: (projectId) => `/api/projects/${projectId}`,
  ADD_PROJECT: "/api/projects",
};

export const API_ENDPOINTS_SEMESTER = {
  GET_CURRENT_SEMESTER: (pageSize, pageIndex, keyword) =>
    `/api/semesters?pageIndex=${pageIndex}&pageSize=${pageSize}&keyword=${keyword}`,
  ADD_SEMESTER: "/api/semesters",
};
