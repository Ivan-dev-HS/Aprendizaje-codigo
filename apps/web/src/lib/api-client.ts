import axios, { type AxiosRequestConfig } from "axios";
import { getAccessToken, notifyAuthFailure, setAccessToken } from "./token-store";

/**
 * Cliente HTTP único hacia la API. Todas las llamadas de red del frontend
 * pasan por aquí (nunca `fetch` directo en componentes) para poder aplicar
 * interceptores de auth/refresh/errores en un solo lugar.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:4000/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

interface RetryableConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  refreshPromise ??= axios
    .post<{ accessToken: string }>(
      `${apiClient.defaults.baseURL}/auth/refresh`,
      {},
      { withCredentials: true },
    )
    .then((res) => res.data.accessToken)
    .catch(() => null)
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryableConfig | undefined;
    const isAuthEndpoint =
      typeof originalRequest?.url === "string" && originalRequest.url.includes("/auth/");

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;
      const newToken = await refreshAccessToken();
      if (newToken) {
        setAccessToken(newToken);
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newToken}`,
        };
        return apiClient(originalRequest);
      }
      setAccessToken(null);
      notifyAuthFailure();
    }

    return Promise.reject(error);
  },
);
