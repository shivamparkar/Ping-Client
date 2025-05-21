import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_SOCKET_URL,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const fullUrl = `${config.baseURL || ""}${config.url}`;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
