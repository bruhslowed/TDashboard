// constants/const.js
// Use relative path so frontend can call backend via Nginx proxy
// In Docker: http://backend:3001 → Nginx routes /api to backend
// In browser: /api → Nginx routes to backend
const API_BASE_URL = "/api";

export const API_URLS = {
  TEMPERATURES: `${API_BASE_URL}/api/temperature/get_temperatures`,
  DEVICES: `${API_BASE_URL}/api/devices`,
  BREACHES: `${API_BASE_URL}/api/breaches`,
  ONGOING_BREACHES: `${API_BASE_URL}/api/breaches/ongoing`,
  getDevice: (deviceId) => `${API_BASE_URL}/api/devices/${deviceId}`,
};
