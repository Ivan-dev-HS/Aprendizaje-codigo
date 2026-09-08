import axios from "axios";

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
