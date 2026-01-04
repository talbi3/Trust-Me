import axios from 'axios';

const apiUrl = import.meta.env.VITE_SERVER_API_URL || 'http://localhost:5000';

const axiosInstance = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// REQUEST INTERCEPTOR – add Google ID token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("googleIdToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(
      `🚀 [API Request] ${config.method?.toUpperCase()} ${config.url}`,
      config.data ? config.data : ''
    );

    return config;
  },
  (error) => {
    console.error('❌ [API Request Error]', error);
    return Promise.reject(error);
  }
);

// RESPONSE INTERCEPTOR 
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(
      `✅ [API Response] ${response.status} ${response.config.url}`,
      response.data
    );
    return response;
  },
  (error) => {
    if (
      !error.response ||
      error.code === "ERR_NETWORK" ||
      error.response.status === 401
    ) {
      console.error("Server unavailable or unauthorized. Logging out...");

      localStorage.removeItem("user");
      localStorage.removeItem("googleIdToken");

      if (window.location.pathname !== '/login') {
        window.location.href = "/login";
      }
    }

    console.error(
      `❌ [API Error] ${error.response?.status || 'Network'} ${error.config?.url}`,
      error.response?.data || error.message
    );

    return Promise.reject(error);
  }
);

export default axiosInstance;
