import { configureStore } from "@reduxjs/toolkit";
import { clientDataReducer } from "../features/admin/clientManagementSlice";
import { freelancerDataReducer } from "../features/admin/freelancerManagementSlice";
import { contactDataReducer } from "../features/admin/contactUsManagementSlice";
import { siteAnalyticsReducer } from "../features/admin/siteAnalyticsSlice";
import { chatManagementReducer } from "../features/admin/chatManagementSlice";
import { projectDataReducer } from "../features/admin/projectManagementSlice";
import { dropdownDataReducer } from "../features/admin/dropdownDataSlice";
import { projectBidsReducer } from "../features/admin/projectBidsSlice";
import { loginDataReducer } from "../features/auth/loginSlice";
import { websiteDataReducer } from "../features/admin/websiteDataSlice";

const store = configureStore({
  reducer: {
    clientDataReducer: clientDataReducer,
    freelancerDataReducer:freelancerDataReducer,
    contactDataReducer:contactDataReducer,
    siteAnalyticsReducer:siteAnalyticsReducer,
    chatManagementReducer:chatManagementReducer,
    projectDataReducer:projectDataReducer,
    dropdownDataReducer:dropdownDataReducer,
    projectBidsReducer:projectBidsReducer,
    loginDataReducer:loginDataReducer,
    websiteData:websiteDataReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
