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

// Global event emitter for rate limit events — components can listen to this
// to disable their inputs without needing prop drilling or context
export const rateLimitEmitter = {
  _listeners: {},

  on(event, fn) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(fn);
  },

  off(event, fn) {
    if (!this._listeners[event]) return;
    this._listeners[event] = this._listeners[event].filter((l) => l !== fn);
  },

  emit(event, payload) {
    (this._listeners[event] || []).forEach((fn) => fn(payload));
  },
};

// Token refresh state — prevents multiple simultaneous refresh requests
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

// ── Request interceptor — attach access token ─────────────────────────────────
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

// ── Response interceptor — handle 429, 403 credits, 401 refresh ──────────────
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const responseMessage = error.response?.data?.message || "";

    // ── 429 Too Many Requests ─────────────────────────────────────────────────
    if (status === 429) {
      const message =
        responseMessage || "Too many requests. Please wait and try again.";

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

      // Notify all listening components to enter a 10s cooldown
      rateLimitEmitter.emit("rate-limited", { cooldownMs: 10000 });

      return Promise.reject({ ...error, handled: true, message });
    }

    // ── 403 Daily credit limit ────────────────────────────────────────────────
    if (
      status === 403 &&
      responseMessage.toLowerCase().includes("daily credit limit")
    ) {
      toast.error("You have used all your daily credits. Try again tomorrow.", {
        position: "top-center",
        autoClose: false, // stays until manually dismissed
        closeOnClick: true,
        style: {
          fontSize: "15px",
          fontWeight: "500",
        },
      });

      // Notify chat component to permanently disable input for this session
      rateLimitEmitter.emit("credits-exhausted", {});

      return Promise.reject({
        ...error,
        handled: true,
        message: responseMessage,
      });
    }

    // ── 401 — try to refresh access token ────────────────────────────────────
    if (
      status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/api/auth/refresh") &&
      !originalRequest.url?.includes("/api/user/login")
    ) {
      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
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

        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
