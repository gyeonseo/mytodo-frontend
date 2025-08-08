import axios from "axios";
const baseUrl = import.meta.env.VITE_API_BASE_URL;

const instance = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      localStorage.removeItem("accessToken");
    }
    return Promise.reject(error);
  }
);

instance.getCurrentUser = async () => {
  const response = await instance.get("/users/me");
  return response.data; // { id, username, ... }
};

export default instance;
