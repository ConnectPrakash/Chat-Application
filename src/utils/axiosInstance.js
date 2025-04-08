import axios from "axios";

const MAX_RETRIES = 5;

const axiosInstance = axios.create({
  baseURL: "https://chat-application-2-g4pg.onrender.com",
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const {
      config,
      response: { status },
    } = error;
    const retries = config.__retries || 0;

    if (status === 429 && retries < MAX_RETRIES) {
      config.__retries = retries + 1;
      const delay = Math.pow(2, retries) * 1000; // Exponential backoff
      await new Promise((res) => setTimeout(res, delay));
      return axiosInstance(config);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
