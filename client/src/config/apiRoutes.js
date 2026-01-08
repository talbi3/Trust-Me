//const API_BASE = import.meta.env.VITE_SERVER_API_URL || "http://localhost:5000";

export const API_ROUTES = {
  CHAT: {
    GET_DAYS: `/api/chat-history/days`, 
    SAVE_MESSAGE: `/api/chat-history/message`,
    
    
    GET_BY_DAY: (day) => `/api/chat-history/day/${encodeURIComponent(day)}`,
    DELETE_DAY: (day) => `/api/chat-history/day/${encodeURIComponent(day)}`,
  },
  AUTH: {
    LOGIN: `/auth/login`,
  },
  PROFILE: {
    GET: `/api/user/profile`,
    UPDATE: `/api/user/profile`,
  },
  USER: {
    GET: `/api/user/profile`,
    UPDATE: `/api/user/profile`,
  },
  UPLOADS: {
    PROFILE_PICTURE: `/api/upload/profile-picture`,
  },
  SETTINGS: {
    GET: `/api/user/settings`,
    UPDATE: `/api/user/settings`,
  },
  CHAT_HISTORY: {
    GET_DAYS: `/api/chat-history/days`,
    SAVE_MESSAGE: `/api/chat-history/message`,
    GET_BY_DAY: (day) => `/api/chat-history/day/${encodeURIComponent(day)}`,
    DELETE_DAY: (day) => `/api/chat-history/day/${encodeURIComponent(day)}`,
  },
  AI: {
    CHAT: `/api/ai/chat`,
  },
  GOOGLE: {
    LOGIN: `/auth/google`,
    LOGOUT: `/auth/logout`,
  },
};