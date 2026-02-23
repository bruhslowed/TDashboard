// constants/const.js
// Use relative API paths so frontend calls backend via Nginx proxy at /api
const API_BASE_URL = "http://benjamin-temp-system:3001";

export const API_URLS = {
  TEMPERATURES: `/api/temperature/get_temperatures`,
  DEVICES: `/api/devices`,
  BREACHES: `/api/breaches`,
  ONGOING_BREACHES: `/api/breaches/ongoing`,
  getDevice: (deviceId) => `/api/devices/${deviceId}`,
};
