// src/config/env.ts

const getBackendUrl = () => {
  const envUrl = import.meta.env.VITE_BACKEND_URL;
  // Logic fallback: Nếu chạy local (port 5173) thì backend thường là 3000
  if (!envUrl && typeof window !== 'undefined') {
    return window.location.origin.replace("5173", "3000");
  }
  return envUrl || "http://localhost:3000";
};

export const ENV = {
  BACKEND_URL: getBackendUrl(),
  // Chỉ để là string nguyên bản
  JWT_SECRET: import.meta.env.VITE_JWT_SECRET || "default_secret",
  IS_DEV: import.meta.env.DEV,
};