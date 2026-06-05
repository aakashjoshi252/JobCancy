import { createSlice } from "@reduxjs/toolkit";

const safeParse = (value) => {
  try {
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

const persistAuth = (user, token) => {
  sessionStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("user", JSON.stringify(user));

  if (token) {
    localStorage.setItem("token", token);
    sessionStorage.setItem("token", token);
  }
};

const clearAuthStorage = () => {
  sessionStorage.removeItem("user");
  sessionStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("token");
};

const storedUser = safeParse(sessionStorage.getItem("user")) || safeParse(localStorage.getItem("user"));

// Load token from localStorage
const storedToken = localStorage.getItem("token") || sessionStorage.getItem("token");

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: storedUser,
    token: storedToken,
    isAuthenticated: !!storedUser && !!storedToken,
    isLoading: false,
    loading: false, // Keep for backward compatibility
  },
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.loading = true;
    },
    
    loginSuccess: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.loading = false;

      persistAuth(user, token);
    },

    authLoaded: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.loading = false;

      persistAuth(user, token);
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.loading = false;

      clearAuthStorage();
    },

    authFailed: (state) => {
      state.isLoading = false;
      state.loading = false;
    },
    
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      persistAuth(state.user, state.token);
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  logout,
  authLoaded,
  authFailed,
  updateUser,
} = authSlice.actions;

export default authSlice.reducer;
