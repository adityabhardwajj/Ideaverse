import axios from "axios";
import { toast } from "react-toastify";
import { tokenManager } from "../utils/tokenManager.js";

// Use environment variable for API URL, fallback to localhost for development
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
axiosClient.interceptors.request.use(
  (config) => {
    const token = tokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Handle different error status codes
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          tokenManager.clearTokens();
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
          break;
        case 403:
          toast.error("Access denied");
          break;
        case 404:
          // Resource not found - don't show toast for every 404
          if (!error.config.url.includes("/api/")) {
            toast.error("Resource not found");
          }
          break;
        case 500:
          toast.error("Server error. Please try again later.");
          break;
        default:
          const errorMessage =
            error.response?.data?.error?.message ||
            error.response?.data?.message ||
            "An error occurred";
          toast.error(errorMessage);
      }
    } else if (error.request) {
      // Network error
      toast.error("Network error. Please check your connection.");
    } else {
      toast.error("An unexpected error occurred");
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
