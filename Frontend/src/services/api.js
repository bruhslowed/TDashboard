import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api";

export const temperatureApi = {
  // Get all temperatures
  getAll: async () => {
    const response = await axios.get(`${API_BASE_URL}/temperature`);
    return response.data;
  },

  // Get temperatures for specific device
  getByDevice: async (deviceId) => {
    const response = await axios.get(`${API_BASE_URL}/temperature/${deviceId}`);
    return response.data;
  },
};
