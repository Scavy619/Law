import axios from "axios";
import { toast } from "react-toastify";
import {
  getAdminAccessToken,
  setAdminAccessToken,
  getLawyerAccessToken,
  setLawyerAccessToken,
  clearAdminAuth,
  clearLawyerAuth,
} from "../context/auth.tokens";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true, // send refresh token cookies
});

// Token refresh state to prevent multiple simultaneous refresh requests
let isRefreshingAdmin = false;
let isRefreshingLawyer = false;
let failedAdminQueue = [];
let failedLawyerQueue = [];

const processAdminQueue = (error, token = null) => {
  failedAdminQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedAdminQueue = [];
};

const processLawyerQueue = (error, token = null) => {
  failedLawyerQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedLawyerQueue = [];
};

// Determine if request is for admin or lawyer based on URL
const isAdminRequest = (url) => {
  return url?.includes("/api/admin/");
};

const isLawyerRequest = (url) => {
  return url?.includes("/api/lawyer/");
};

// Request interceptor for access token bearer header
api.interceptors.request.use(
  (config) => {
    // For admin-specific endpoints, use admin token
    if (isAdminRequest(config.url)) {
      const adminToken = getAdminAccessToken();
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
      }
    }
    // For lawyer-specific endpoints, use lawyer token
    else if (isLawyerRequest(config.url)) {
      const lawyerToken = getLawyerAccessToken();
      if (lawyerToken) {
        config.headers.Authorization = `Bearer ${lawyerToken}`;
      }
    }
    // For other endpoints (like video), use whichever token is available
    else {
      const lawyerToken = getLawyerAccessToken();
      const adminToken = getAdminAccessToken();

      // Prefer lawyer token if available (for video calls, etc.)
      if (lawyerToken) {
        config.headers.Authorization = `Bearer ${lawyerToken}`;
      } else if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for rate limiting, refresh access token
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // Rate limiting
    if (error.response?.status === 429) {
      const message =
        error.response.data?.message ||
        "Too many requests! Try again after 10-15 minutes.";

      toast.error(message, {
        position: "top-center",
        autoClose: 8000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          whiteSpace: "pre-line",
          fontSize: "15px",
          fontWeight: "500",
        },
      });

      return Promise.reject({ ...error, message });
    }

    // Refreshing expired access token
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/refresh") &&
      !originalRequest.url?.includes("/login")
    ) {
      // Handle admin token refresh
      if (isAdminRequest(originalRequest.url)) {
        if (isRefreshingAdmin) {
          // If already refreshing, queue this request
          return new Promise((resolve, reject) => {
            failedAdminQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshingAdmin = true;

        try {
          const { data } = await api.post("/api/admin/refresh");

          setAdminAccessToken(data.accessToken);
          processAdminQueue(null, data.accessToken);

          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

          return api(originalRequest);
        } catch (refreshError) {
          processAdminQueue(refreshError, null);
          clearAdminAuth();

          // Only redirect if we're not already on login page
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshingAdmin = false;
        }
      }

      // Handle lawyer token refresh
      if (isLawyerRequest(originalRequest.url)) {
        if (isRefreshingLawyer) {
          // If already refreshing, queue this request
          return new Promise((resolve, reject) => {
            failedLawyerQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshingLawyer = true;

        try {
          const { data } = await api.post("/api/lawyer/refresh");

          setLawyerAccessToken(data.accessToken);
          processLawyerQueue(null, data.accessToken);

          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

          return api(originalRequest);
        } catch (refreshError) {
          processLawyerQueue(refreshError, null);
          clearLawyerAuth();

          // Only redirect if we're not already on login page
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshingLawyer = false;
        }
      }
    }

    // Don't log 401 errors from login or refresh endpoints (they're normal)
    if (
      error.response?.status === 401 &&
      (originalRequest.url?.includes("/login") ||
        originalRequest.url?.includes("/refresh"))
    ) {
      // Silently reject without logging
      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);

export default api;
