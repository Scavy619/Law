import axios from "axios";
import { toast } from "react-toastify";
import {
  getAccessToken,
  setAccessToken,
  clearAuth,
} from "../context/auth.tokens";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true, // send refresh token cookie
});

// Token refresh state to prevent multiple simultaneous refresh requests
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// request interceptor for access token bearer thang
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// response interceptor for rate limiting, refresh access token
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // rate limiting
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

    // refreshing expired access token
    // IMPORTANT: Don't retry the refresh endpoint itself to avoid infinite loops
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/api/auth/refresh")
    ) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
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
      isRefreshing = true;

      try {
        const { data } = await api.post("/api/auth/refresh");

        setAccessToken(data.accessToken);
        processQueue(null, data.accessToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuth();

        // Only redirect if we're not already on login page
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Don't log 401 errors from login or refresh endpoints (they're normal)
    if (
      error.response?.status === 401 &&
      (originalRequest.url?.includes("/api/user/login") ||
        originalRequest.url?.includes("/api/auth/refresh"))
    ) {
      // Silently reject without logging
      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);

export default api;
