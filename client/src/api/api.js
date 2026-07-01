import axios from "axios";
import { getPersistedLanguage } from "../i18n/storage";
import { getApiErrorKey } from "../utils/apiErrors";

// ===========================
//  Environment Configuration
// ===========================
const cleanEnvValue = (value, fallback = "") => (value || fallback).split("#")[0].trim();
const trimTrailingSlash = (value) => cleanEnvValue(value).replace(/\/+$/, "");

const API_VERSION = "/api/v1";
const PRODUCTION_API_URL = "https://job-sss.onrender.com/api/v1";
const DEFAULT_DEV_API_ORIGIN = "http://localhost:3000";
const DEBUG_MODE = import.meta.env.VITE_DEBUG_MODE === "true";
const apiDebugLog = (...args) => {
  if (DEBUG_MODE) console.log(...args);
};
const apiDebugError = (...args) => {
  if (DEBUG_MODE) console.error(...args);
};

const getRuntimeHostname = () => (typeof window !== "undefined" ? window.location.hostname : "");
const getRuntimeProtocol = () =>
  typeof window !== "undefined" && window.location.protocol === "https:" ? "https:" : "http:";
const isNetworkHost = (hostname) =>
  /^(172\.(1[6-9]|2[0-9]|3[01])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3})$/.test(hostname);
const getDevelopmentApiOrigin = () => {
  const hostname = getRuntimeHostname();
  if (import.meta.env.DEV && isNetworkHost(hostname)) {
    return `${getRuntimeProtocol()}//${hostname}:3000`;
  }

  return DEFAULT_DEV_API_ORIGIN;
};

const normalizeApiBaseUrl = (value) => {
  const cleaned = trimTrailingSlash(value);
  if (!cleaned) return "";

  const deduped = cleaned.replace(/(?:\/api\/v1)+$/i, API_VERSION);
  if (deduped.toLowerCase().endsWith("/api")) return `${deduped}/v1`;
  return deduped.toLowerCase().endsWith(API_VERSION) ? deduped : `${deduped}${API_VERSION}`;
};

const isRelativeUrl = (value) => value.startsWith("/");
const isLocalUrl = (value) =>
  /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)/i.test(value);
const isUnsafeProductionUrl = (value) => import.meta.env.PROD && !isRelativeUrl(value) && isLocalUrl(value);
const shouldUseRuntimeDevHost = (value) =>
  import.meta.env.DEV && /^https?:\/\/(localhost|127\.0\.0\.1)(?::\d+)?/i.test(value || "") && isNetworkHost(getRuntimeHostname());

const configuredApiUrl = cleanEnvValue(import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL);
const selectedApiUrl =
  configuredApiUrl && !isUnsafeProductionUrl(configuredApiUrl)
    ? shouldUseRuntimeDevHost(configuredApiUrl)
      ? getDevelopmentApiOrigin()
      : configuredApiUrl
    : "";
const defaultApiUrl = import.meta.env.PROD ? PRODUCTION_API_URL : `${getDevelopmentApiOrigin()}${API_VERSION}`;
const API_BASE_URL = normalizeApiBaseUrl(selectedApiUrl || defaultApiUrl);
const SERVER_BASE_URL = trimTrailingSlash(API_BASE_URL).replace(/(?:\/api\/v1)+$/i, "");
const BASE_URL = SERVER_BASE_URL;
const configuredSocketUrl = cleanEnvValue(import.meta.env.VITE_SOCKET_URL);
const selectedSocketUrl =
  configuredSocketUrl && !isUnsafeProductionUrl(configuredSocketUrl)
    ? shouldUseRuntimeDevHost(configuredSocketUrl)
      ? getDevelopmentApiOrigin()
      : configuredSocketUrl
    : "";
const SOCKET_BASE_URL = trimTrailingSlash(selectedSocketUrl || SERVER_BASE_URL);

// ===========================
//  Axios Common Config
// ===========================
const axiosConfig = {
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
};

// ===========================
//  Factory: create API instance
// ===========================
const createApiInstance = (baseURL, apiName) => {
  const instance = axios.create({ baseURL, ...axiosConfig });

  // Request interceptor adds JWT token
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      if (typeof FormData !== "undefined" && config.data instanceof FormData) {
        if (typeof config.headers?.delete === "function") {
          config.headers.delete("Content-Type");
          config.headers.delete("content-type");
        } else {
          delete config.headers["Content-Type"];
          delete config.headers["content-type"];
        }
      }

      const language = getPersistedLanguage();
      config.headers["Accept-Language"] = language;
      config.headers["X-Language"] = language;
      apiDebugLog(`[${apiName}] ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor handles errors and 401 auto-logout
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        apiDebugError(`[${apiName}] ${error.response.status}: ${error.config?.url}`);
        apiDebugError("Error details:", error.response.data);
      }
      
      if (error.response?.status === 401 && !error.config?.skipAuthRedirect) {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        localStorage.removeItem("user");
        sessionStorage.removeItem("user");
        if (!window.location.pathname.includes("/login")) {
          window.location.replace("/login");
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

// ===========================
//  API Instances
// ===========================
export const userApi = createApiInstance(`${API_BASE_URL}/user`, "User");
export const companyApi = createApiInstance(`${API_BASE_URL}/company`, "Company");
export const jobsApi = createApiInstance(`${API_BASE_URL}/jobs`, "Jobs");
export const applicationApi = createApiInstance(`${API_BASE_URL}/application`, "Application");
export const resumeApi = createApiInstance(`${API_BASE_URL}/resume`, "Resume");
export const chatApi = createApiInstance(`${API_BASE_URL}/chat`, "Chat");
export const notificationApi = createApiInstance(`${API_BASE_URL}/notifications`, "Notification");
export const subscriptionApi = createApiInstance(`${API_BASE_URL}/subscription`, "Subscription");
export const blogApi = createApiInstance(`${API_BASE_URL}/blogs`, "Blog");
export const dashboardApi = createApiInstance(`${API_BASE_URL}/dashboard`, "Dashboard");
export const candidateApi = createApiInstance(`${API_BASE_URL}/candidate`, "Candidate");
export const adminApi = createApiInstance(`${API_BASE_URL}/admin`, "Admin");
export const interviewsApi = createApiInstance(`${API_BASE_URL}/interviews`, "Interviews");
export const pdfApi = createApiInstance(`${API_BASE_URL}/pdf`, "Pdf");
export const categoryApi = createApiInstance(`${API_BASE_URL}/category`, "Category");

export const blogService = {
  getBlogs: (params) => blogApi.get("/", { params, skipAuthRedirect: true }),
  getPublishedBlogs: (params) => blogApi.get("/published", { params, skipAuthRedirect: true }),
  getBlogBySlug: (slug, config = {}) => blogApi.get(`/slug/${slug}`, { skipAuthRedirect: true, ...config }),
  getBlogById: (id, config = {}) => blogApi.get(`/${id}`, { skipAuthRedirect: true, ...config }),
  createBlog: (data) => blogApi.post("/", data),
  updateBlog: (id, data) => blogApi.patch(`/${id}`, data),
  deleteBlog: (id) => blogApi.delete(`/${id}`),
  uploadBlogImage: (formData) => blogApi.post("/upload-image", formData),
  likeBlog: (id) => blogApi.post(`/${id}/like`),
  bookmarkBlog: (id) => blogApi.post(`/${id}/bookmark`),
  commentBlog: (id, data) => blogApi.post(`/${id}/comments`, data),
  searchBlogs: (query, params = {}) => blogApi.get("/search", { params: { ...params, query }, skipAuthRedirect: true }),
};

// ===========================
//  Helper Wrappers
// ===========================
export const apiHelpers = {
  jobs: {
    getByRecruiter: (recruiterId) => jobsApi.get(`/recruiter/${recruiterId}`),
    getById: (jobId) => jobsApi.get(`/${jobId}`),
    create: (jobData) => jobsApi.post("/", jobData),
    update: (jobId, jobData) => jobsApi.put(`/${jobId}`, jobData),
    delete: (jobId) => jobsApi.delete(`/${jobId}`),
    getAll: (params) => jobsApi.get("/", { params }),
  },
  interviews: {
    getUpcoming: (recruiterId) => interviewsApi.get(`/recruiter/${recruiterId}/upcoming`),
    getAllByRecruiter: (recruiterId, params) => interviewsApi.get(`/recruiter/${recruiterId}`, { params }),
    getById: (interviewId) => interviewsApi.get(`/${interviewId}`),
    create: (interviewData) => interviewsApi.post("/", interviewData),
    update: (interviewId, interviewData) => interviewsApi.put(`/${interviewId}`, interviewData),
    delete: (interviewId) => interviewsApi.delete(`/${interviewId}`),
    updateStatus: (interviewId, status) => interviewsApi.patch(`/${interviewId}/status`, { status }),
  },
  applications: {
    getRecent: (recruiterId) => applicationApi.get(`/recruiter/${recruiterId}/recent`),
    getAllByRecruiter: (recruiterId, params) => applicationApi.get(`/recruiter/${recruiterId}`, { params }),
    getById: (applicationId) => applicationApi.get(`/${applicationId}`),
    updateStatus: (applicationId, status) => applicationApi.patch(`/${applicationId}/status`, { status }),
    getByCandidate: (candidateId) => applicationApi.get(`/candidate/${candidateId}`),
    getByJob: (jobId) => applicationApi.get(`/job/${jobId}`),
    submit: (applicationData) => applicationApi.post("/", applicationData),
  },
  dashboard: {
    getRecruiter: () => dashboardApi.get("/recruiter"),
    getCandidate: () => dashboardApi.get("/candidate"),
    getAdmin: () => dashboardApi.get("/admin"),
    getJobsCount: () => dashboardApi.get("/jobs/count"),
    getApplicationsCount: () => dashboardApi.get("/applications/count"),
    getCandidatesCount: () => dashboardApi.get("/candidates/count"),
    getRecruitersCount: () => dashboardApi.get("/recruiters/count"),
    getCompaniesCount: () => dashboardApi.get("/companies/count"),
  },
  company: {
    getByRecruiter: (recruiterId) => companyApi.get(`/recruiter/${recruiterId}`),
    getProfile: (recruiterId) => companyApi.get(`/recruiter/${recruiterId}`),
    updateProfile: (companyId, data) => companyApi.put(`/update/${companyId}`, data),
    getJobs: (companyId) => jobsApi.get(`/company/${companyId}`),
    getStats: (companyId) => companyApi.get(`/${companyId}/stats`),
  },
  user: {
    getMe: () => userApi.get("/me"),
    getProfile: () => userApi.get("/me"),
    updateProfile: (data, config) => userApi.patch("/profile", data, config),
    updateProfileImage: (data, config) => userApi.patch("/profile-image", data, config),
    deleteProfileImage: () => userApi.delete("/profile-image"),
    changePassword: (data) => userApi.post("/change-password", data),
    getLoginActivity: (params) => userApi.get("/login-activity", { params }),
    getLoginHistory: (params) => userApi.get("/security/login-history", { params }),
    getNotifications: () => userApi.get("/notifications"),
    markNotificationRead: (notificationId) => userApi.patch(`/notifications/${notificationId}`),
  },
  loginActivity: {
    getMine: (params) => userApi.get("/security/login-history", { params }),
    getAdmin: (params) => adminApi.get("/login-activity", { params }),
    getAdminByUser: (userId, params) => adminApi.get(`/login-activity/${userId}`, { params }),
    delete: (activityId) => adminApi.delete(`/login-activity/${activityId}`),
  },
  notifications: {
    list: (params) => notificationApi.get("/", { params }),
    unreadCount: () => notificationApi.get("/unread-count"),
    markRead: (notificationId) => notificationApi.patch(`/${notificationId}/read`),
    markUnread: (notificationId) => notificationApi.patch(`/${notificationId}/unread`),
    markAllRead: () => notificationApi.patch("/mark-all-read"),
    delete: (notificationId) => notificationApi.delete(`/${notificationId}`),
    clearAll: () => notificationApi.delete("/clear-all"),
    sendSystemAlert: (data) => notificationApi.post("/system-alert", data),
  },
  subscription: {
    getPlans: () => subscriptionApi.get("/plans"),
    getPlan: (planId) => subscriptionApi.get(`/plans/${planId}`),
    createOrder: (planId) => subscriptionApi.post("/create-order", { planId }),
    verifyPayment: (paymentData) => subscriptionApi.post("/verify-payment", paymentData),
    recordPaymentFailure: (paymentData) => subscriptionApi.post("/payment-failed", paymentData),
    getMySubscription: () => subscriptionApi.get("/my-subscription"),
    getTransactions: (params) => subscriptionApi.get("/transactions", { params }),
    getTransaction: (paymentId) => subscriptionApi.get(`/transactions/${paymentId}`),
    getInvoice: (paymentId) => subscriptionApi.get(`/invoice/${paymentId}`),
    getUsage: () => subscriptionApi.get("/usage"),
    cancel: () => subscriptionApi.post("/cancel"),
  },
};

// ===========================
//  Error Handler
// ===========================
export const handleApiError = (error, customMessage = null) => {
  if (error.response) {
    const message = error.response.data?.message || customMessage || "An error occurred";
    const status = error.response.status;
    console.error(`API Error (${status}):`, message);
    return {
      success: false,
      message,
      errorKey: getApiErrorKey(error),
      code: error.response.data?.code,
      status,
      data: error.response.data,
    };
  } else if (error.request) {
    console.error("Network Error:", error.request);
    return {
      success: false,
      message: "Network error. Please check your connection.",
      errorKey: "networkError",
      status: 0,
    };
  } else {
    console.error("Error:", error.message);
    return {
      success: false,
      message: error.message || "An unexpected error occurred",
      errorKey: "unexpected",
      status: null,
    };
  }
};

// ===========================
//  Health Check
// ===========================
export const checkApiHealth = async () => {
  try {
    const response = await axios.get(`${SERVER_BASE_URL}/health`, { timeout: 5000 });
    apiDebugLog("API Health: OK");
    return { success: true, data: response.data };
  } catch (error) {
    apiDebugError("API Health: Server down");
    return { success: false, error: error.message };
  }
};

// ===========================
//  Startup Log
// ===========================
apiDebugLog(`API Ready: ${API_BASE_URL}`);
apiDebugLog(`API Version: ${API_VERSION}`);
apiDebugLog(`Environment: ${import.meta.env.MODE}`);

// Export base configs for advanced use
export { BASE_URL, SERVER_BASE_URL, SOCKET_BASE_URL, API_BASE_URL, API_VERSION };
