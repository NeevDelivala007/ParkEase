import axios, { AxiosError } from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api";

export const api = axios.create({
  baseURL,
  timeout: 15000,
});

// Attach the auth token, once auth exists (stage: not yet implemented —
// placeholder wired up now so later stages don't have to touch this file).
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("parkease_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Shape every backend error response is expected to follow. */
export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    details?: unknown;
  };
}

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    return axiosError.response?.data?.error?.message ?? axiosError.message ?? fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
