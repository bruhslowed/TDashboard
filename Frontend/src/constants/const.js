const API_BASE_URL = "http://localhost:3001";

export const API_URLS = {
  // Temperature endpoints
  TEMPERATURES: `${API_BASE_URL}/api/temperature/get_temperatures`,

  // Device endpoints
  DEVICES: `${API_BASE_URL}/api/devices`,
  getDevice: (deviceId) => `${API_BASE_URL}/api/devices/${deviceId}`,
};
