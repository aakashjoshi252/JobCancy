import { createSlice } from "@reduxjs/toolkit";

// Load company data from sessionStorage if available
const storedCompany = sessionStorage.getItem("company")
  ? JSON.parse(sessionStorage.getItem("company"))
  : null;

const companySlice = createSlice({
  name: "company",
  initialState: {
    data: storedCompany,
    loading: false,
    error: null,
    isLoaded: !!storedCompany,
    lastFetched: null,
  },
  reducers: {
    // Set loading state
    setCompanyLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    
    // Set company data (success)
    setCompany: (state, action) => {
      state.data = action.payload;
      state.loading = false;
      state.error = null;
      state.isLoaded = true;
      state.lastFetched = new Date().toISOString();
      
      // Save to sessionStorage for persistence
      if (action.payload) {
        sessionStorage.setItem("company", JSON.stringify(action.payload));
      } else {
        sessionStorage.removeItem("company");
      }
    },
    
    // Set error state
    setCompanyError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
      state.isLoaded = false;
    },
    
    // Clear company data
    clearCompany: (state) => {
      state.data = null;
      state.loading = false;
      state.error = null;
      state.isLoaded = false;
      state.lastFetched = null;
      sessionStorage.removeItem("company");
    },
    
    // Update specific company fields (without full reload)
    updateCompanyFields: (state, action) => {
      if (state.data) {
        state.data = { ...state.data, ...action.payload };
        sessionStorage.setItem("company", JSON.stringify(state.data));
      }
    },
    
    // Set company logo
    setCompanyLogo: (state, action) => {
      if (state.data) {
        state.data.uploadLogo = action.payload;
        state.data.cloudinaryPublicId = action.payload.publicId;
        sessionStorage.setItem("company", JSON.stringify(state.data));
      }
    },
    
    // Reset company state
    resetCompany: (state) => {
      state.data = null;
      state.loading = false;
      state.error = null;
      state.isLoaded = false;
      state.lastFetched = null;
      sessionStorage.removeItem("company");
    },
  },
});

export const {
  setCompanyLoading,
  setCompany,
  setCompanyError,
  clearCompany,
  updateCompanyFields,
  setCompanyLogo,
  resetCompany,
} = companySlice.actions;

// Selectors for convenient data access
export const selectCompany = (state) => state.company.data;
export const selectCompanyLoading = (state) => state.company.loading;
export const selectCompanyError = (state) => state.company.error;
export const selectCompanyIsLoaded = (state) => state.company.isLoaded;
export const selectCompanyName = (state) => state.company.data?.companyName;
export const selectCompanyLogo = (state) => state.company.data?.uploadLogo;
export const selectCompanyIndustry = (state) => state.company.data?.industry;
export const selectCompanyLocation = (state) => state.company.data?.location;

export default companySlice.reducer;