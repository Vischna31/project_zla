import { saveToken, clearToken, getToken } from "../api/auth";

const API_BASE = "http://127.0.0.1:8000/api";

// Типы действий
export const SET_USER = "auth/SET_USER";
export const CLEAR_USER = "auth/CLEAR_USER";

// Действия
export const setUser = (user) => ({
  type: SET_USER,
  payload: user,
});

export const clearUser = () => ({
  type: CLEAR_USER,
});

// Thunk actions
export const login = (username, password) => async (dispatch) => {
  clearToken();

  const res = await fetch(`${API_BASE}/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    console.error("Login failed", res.status, errorData);
    return { success: false, error: errorData.error || "Ошибка входа" };
  }

  const data = await res.json();
  saveToken(data.token);
  console.log("Logged in as", data.user.username);
  
  dispatch(setUser({
    id: data.user.id,
    username: data.user.username,
    email: data.user.email,
    role: data.user.profile?.role,
  }));
  
  return { success: true };
};

export const register = (username, password, email = "", role = "student") => async (dispatch) => {
  const res = await fetch(`${API_BASE}/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, email, role }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    console.error("Registration failed", res.status, errorData);
    return { success: false, error: errorData.error || "Ошибка регистрации" };
  }

  const data = await res.json();
  console.log("User registered", data.user.username);
  return { success: true };
};

export const logout = () => async (dispatch) => {
  const token = getToken();
  
  if (token) {
    try {
      const res = await fetch(`${API_BASE}/logout/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });
      
      if (!res.ok) {
        console.error("Logout failed", res.status);
      }
    } catch (error) {
      console.error("Error during logout", error);
    }
  }

  clearToken();
  dispatch(clearUser());
  console.log("Logged out");
};

export const fetchCurrentUser = () => async (dispatch) => {
  const token = getToken();
  
  if (!token) {
    dispatch(clearUser());
    return;
  }

  const res = await fetch(`${API_BASE}/user/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });

  if (!res.ok) {
    clearToken();
    dispatch(clearUser());
    return;
  }

  const data = await res.json();
  dispatch(setUser({
    id: data.id,
    username: data.username,
    email: data.email,
    role: data.profile?.role,
  }));
};
