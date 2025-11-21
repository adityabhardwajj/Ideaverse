/**
 * Token management utilities for handling access and refresh tokens
 */

const ACCESS_TOKEN_KEY = "ideaverse_token";
const REFRESH_TOKEN_KEY = "ideaverse_refresh_token";

export const tokenManager = {
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  },

  getAccessToken: () => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken: () => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  clearTokens: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  refreshAccessToken: async () => {
    const refreshToken = tokenManager.getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (data.success && data.data.accessToken) {
        tokenManager.setTokens(data.data.accessToken, data.data.refreshToken);
        return data.data.accessToken;
      } else {
        tokenManager.clearTokens();
        throw new Error("Failed to refresh token");
      }
    } catch (error) {
      tokenManager.clearTokens();
      throw error;
    }
  },
};

