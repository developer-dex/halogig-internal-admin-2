export const apiEndPoints = {
  // Authentication endpoints
  ADMIN_LOGIN: "admin/login",
  ADMIN_VERIFY_OTP: "admin/verify-otp",
  
  GET_CLIENT_DATA: "admin/clients",
  GET_CLIENT_DETAILS: "admin/user",
  GET_FRELANCER_DATA:"admin/freelancers",
  GET_FREELANCER_COMPLETE_DATA: "admin/freelancer",
  GET_CONTACT_US:"admin/contact-us",
  STATUS_UPDATE:"admin/user",
  GET_ENROLL_AS: "designation",
  GET_COUNTRIES: "country",
  GET_INDUSTRY:"industry",
  UPDATE_CLIENT_STATUS_IN_CONTACT_US_BY_ADMIN:"admin/update-client-status",
  CREATE_USER_BY_ADMIN:"admin/create-user",
  GET_SITE_ANALYTICS:"admin/page-analytics",
  GET_IP_ANALYTICS:"admin/ip-analytics",
  GET_CLIENT_PROJECTS: "admin/projects",
  GET_CATEGORIES: "category",
  GET_SUBCATEGORIES: "user/sub-category",
  GET_TECHNOLOGIES: "technology",
  GET_INDUSTRIES: "industry",
  UPDATE_PROJECT: "admin/project",
  UPDATE_PROJECT_STATUS: "admin/project",
  
  // Project Bids endpoints
  GET_ALL_PROJECT_BIDS: "admin/project-bids",
  GET_PROJECT_BID_DETAILS: "admin/project-bids",
  
  // Chat endpoints
  GET_ALL_USERS: "admin/user",
  CREATE_CHAT_ROOM: "admin/chat/rooms",
  GET_ADMIN_CHAT_ROOMS: "admin/chat/rooms",
  GET_USER_CHAT_ROOMS: "admin/chat-room/not-created-by-admin",
  UPDATE_CHAT_ROOM_STATUS: "admin/chat-room",
  GET_CHAT_ROOM_MESSAGES: "admin/chat/rooms",
  SEND_MESSAGE: "chat/rooms",
  DELETE_MESSAGE: "chat/messages",
  GET_CHAT_ROOM_DETAILS: "chat/rooms",
  
  // Website Data endpoints
  WEBSITE_DATA_UPLOAD_EXCEL: "admin/website-data/upload-excel",
  WEBSITE_DATA_DOWNLOAD_EXCEL: "admin/website-data/download-excel",
  GET_WEBSITE_DATA: "admin/website-data",
  GET_WEBSITE_DATA_BY_ID: "admin/website-data",
  DELETE_WEBSITE_DATA: "admin/website-data",
  DELETE_ALL_WEBSITE_DATA: "admin/website-data",
  CREATE_WEBSITE_DATA: "admin/website-data",
  UPDATE_WEBSITE_DATA: "admin/website-data",
  
  // Freelancer Country Preferences endpoints
  GET_FREELANCER_COUNTRY_PREFERENCES: "admin/freelancer",
  ADD_FREELANCER_COUNTRY_PREFERENCE: "admin/freelancer", 
  UPDATE_FREELANCER_COUNTRY_PREFERENCE: "admin/freelancer",
  DELETE_FREELANCER_COUNTRY_PREFERENCE: "admin/freelancer",
  
  // Freelancer Max Values endpoints
  UPDATE_MAX_PROPOSAL_VALUE: "admin/freelancer",
  UPDATE_MAX_DELIVERY_IN_PROGRESS: "admin/freelancer",

  // Blog endpoints
  CREATE_BLOG: "admin/blog",
  GET_ALL_BLOGS: "admin/blogs",
  GET_BLOG_BY_ID: "admin/blog",
  UPDATE_BLOG: "admin/blog",
  DELETE_BLOG: "admin/blog",

  // AI endpoints
  GET_EMAIL_DOMAIN_ANALYSIS: "admin/email-domain-analysis",
  GET_UNIQUE_SPECIAL_CATEGORY: "admin/unique-special-category",
  GET_ALL_CATEGORIES: "admin/categories",
  GET_SUB_CATEGORIES_BY_CATEGORY: "admin/sub-categories",
  GET_BATCH_NAME: "admin/batch-name",
  GET_HTML_TEMPLATE: "admin/html-template",
  GET_WEBSITE_DATA_SLUG: "admin/website-data-slug",
  CAMPAIGN_SEND: "campaign/send",
};
