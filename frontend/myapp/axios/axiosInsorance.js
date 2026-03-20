import axios from "axios";
// import { triggerSessionExpired } from "../utils/authEvents";

const axiosInstance = axios.create({
  baseURL:"https://googlesheets-kxuo.onrender.com",
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      localStorage.removeItem("token");
    //   triggerSessionExpired(); // will trigger ONLY ONCE
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;