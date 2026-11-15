const configuredBackendUrl = import.meta.env.VITE_BACKEND_URL;

export const BACKEND_URL = import.meta.env.PROD
  ? "/api"
  : configuredBackendUrl ?? "http://localhost:3000";
