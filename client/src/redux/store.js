import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import resumeReducer from "./slices/resumeSlice";
import companyReducer from "./slices/companySlice";
import jobReducer from "./slices/job";
import languageReducer from "./slices/languageSlice";
import notificationReducer from "./slices/notificationSlice";
import { apiSlice } from "../services/apiSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    resume: resumeReducer,
    company: companyReducer,
    job: jobReducer,
    language: languageReducer,
    notifications: notificationReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/loginSuccess'],
      },
    }).concat(apiSlice.middleware),
});


export default store;
