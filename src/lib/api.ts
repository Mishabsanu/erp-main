import axios, { AxiosError } from 'axios';
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

// Auto-refresh token when expired
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    // Handle 401 Unauthorized error (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Correct: withCredentials must go in Axios config (3rd param)
        await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          {}, // no body required
          { withCredentials: true } // cookie-based refresh token
        );

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError: any) {
        console.error('Token refresh failed:', refreshError);
        return Promise.reject(refreshError);
      }
    }

    // All other errors
    return Promise.reject(error);
  }
);

export default api;
