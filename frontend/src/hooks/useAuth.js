import { useContext } from "react";
import AuthContext from "../context/AuthContext";
import { tokenManager } from "../utils/tokenManager";

export const useAuth = () => {
  const { state, dispatch } = useContext(AuthContext);
  return {
    user: state.user,
    token: state.token,
    login: (user, token, refreshToken) =>
      dispatch({
        type: "LOGIN",
        payload: { user, token, refreshToken },
      }),
    logout: () => {
      tokenManager.clearTokens();
      dispatch({ type: "LOGOUT" });
    },
    updateToken: (token) => dispatch({ type: "UPDATE_TOKEN", payload: { token } }),
  };
};

