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
import { blogReducer } from "../features/admin/blogSlice";
import { emailDomainAnalysisReducer } from "../features/admin/emailDomainAnalysisSlice";
import { emailCampaignsReducer } from "../features/admin/emailCampaignsSlice";
import { pendingViewCountsReducer } from "../features/admin/pendingViewCountsSlice";
import { freelancerPaymentsReducer } from "../features/admin/freelancerPaymentsSlice";
import { disputeManagementReducer } from "../features/admin/disputeManagementSlice";

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
    blog: blogReducer,
    emailDomainAnalysis: emailDomainAnalysisReducer,
    emailCampaigns: emailCampaignsReducer,
    pendingViewCounts: pendingViewCountsReducer,
    freelancerPayments: freelancerPaymentsReducer,
    disputeManagement: disputeManagementReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
