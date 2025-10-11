import axios, { type AxiosResponse, type AxiosError } from "axios";
import { toast } from "sonner";

interface ErrorResponse {
  message?: string;
  error?: string;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (error: AxiosError) => {
    if (error.response) {
      const { status, data } = error.response;

      // Redirect to login on 401 (Unauthorized)
      if (status === 401) {
        localStorage.removeItem("authToken");
        window.location.href = "/login";

        return Promise.reject(
          new Error("Session expired. Please log in again.")
        );
      }

      // Show error message for other status codes
      const errorData = data as ErrorResponse;
      const errorMessage =
        errorData?.message ||
        errorData?.error ||
        `Request failed with status ${status}`;

      showErrorAlert(errorMessage);
      return Promise.reject(new Error(errorMessage));
    } else if (error.request) {
      // Network error
      const networkError = "Network error. Please check your connection.";
      showErrorAlert(networkError);
      return Promise.reject(new Error(networkError));
    } else {
      // Other error
      const genericError = error.message || "An unexpected error occurred.";
      showErrorAlert(genericError);
      return Promise.reject(new Error(genericError));
    }
  }
);

// Simple error alert function
const showErrorAlert = (message: string) => {
  toast.error(`API Error: ${message}`);
};

export default api;
