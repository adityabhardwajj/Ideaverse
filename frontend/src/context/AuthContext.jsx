import React, { createContext, useReducer, useEffect } from "react";
import { tokenManager } from "../utils/tokenManager";

const AuthContext = createContext();

const initialState = {
  user: JSON.parse(localStorage.getItem("ideaverse_user")) || null,
  token: tokenManager.getAccessToken(),
  refreshToken: tokenManager.getRefreshToken(),
};

function reducer(state, action) {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
      };
    case "LOGOUT":
      return { user: null, token: null, refreshToken: null };
    case "UPDATE_TOKEN":
      return { ...state, token: action.payload.token };
    default:
      return state;
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (state.user && state.token) {
      localStorage.setItem("ideaverse_user", JSON.stringify(state.user));
      tokenManager.setTokens(state.token, state.refreshToken);
    } else {
      localStorage.removeItem("ideaverse_user");
      tokenManager.clearTokens();
    }
  }, [state.user, state.token, state.refreshToken]);

  return <AuthContext.Provider value={{ state, dispatch }}>{children}</AuthContext.Provider>;
};

export default AuthContext;

