import { createSlice } from "@reduxjs/toolkit";
import { detectInitialLanguage, persistLanguage } from "../../i18n/storage";
import { getLanguageDirection } from "../../i18n/languages";

const initialLanguage = detectInitialLanguage();

const languageSlice = createSlice({
  name: "language",
  initialState: {
    current: initialLanguage,
    direction: getLanguageDirection(initialLanguage),
  },
  reducers: {
    setLanguage: (state, action) => {
      const language = persistLanguage(action.payload);
      state.current = language;
      state.direction = getLanguageDirection(language);
    },
  },
});

export const { setLanguage } = languageSlice.actions;

export const selectLanguage = (state) => state.language.current;
export const selectLanguageDirection = (state) => state.language.direction;

export default languageSlice.reducer;
