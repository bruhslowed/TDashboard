import { useState, useEffect } from "react";
import axios from "axios";
import { API_URLS } from "../constants/const";
import DeviceCard from "./Devicecard";
import EditDeviceModal from "./EditDeviceModal";

function HomePage({ devices, onDeviceClick }) {
  const [latestReadings, setLatestReadings] = useState({});
  const [editingDevice, setEditingDevice] = useState(null);

  useEffect(() => {
    devices.forEach((device) => {
      fetchLatestReading(device.deviceId);
    });
  }, [devices]);

  const fetchLatestReading = async (deviceId) => {
    try {
      const response = await axios.get(
        `${API_URLS.TEMPERATURES}?deviceId=${deviceId}&limit=1`,
      );
      if (response.data.length > 0) {
        setLatestReadings((prev) => ({
          ...prev,
          [deviceId]: response.data[0],
        }));
      }
    } catch (error) {
      console.error(`Error fetching reading for ${deviceId}:`, error);
    }
  };

  const handleCloseModal = () => {
    setEditingDevice(null);
  };

  const handleSaveDevice = () => {
    // Modal will trigger refresh by closing
    // Parent component (App.jsx) will auto-refresh devices every 5s
  };

  return (
    <div
      style={{
        padding: "20px",
        width: "100vw",
        minHeight: "100vh",
        boxSizing: "border-box",
        overflow: "auto",
      }}
    >
      <h1 style={{ fontSize: "2em", marginBottom: "5px", marginLeft: "0" }}>
        🌡️ Temperature Monitoring Dashboard
      </h1>
      <p
        style={{
          color: "#888",
          fontSize: "0.95em",
          marginBottom: "20px",
          marginLeft: "0",
        }}
      >
        Monitor all your IoT temperature sensors in real-time
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
          width: "100%",
        }}
      >
        {devices.map((device) => (
          <DeviceCard
            key={device.deviceId}
            device={device}
            latestReading={latestReadings[device.deviceId]}
            onClick={() => onDeviceClick(device)}
            onEditClick={() => setEditingDevice(device)}
          />
        ))}
      </div>

      {devices.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            backgroundColor: "#1a1a1a",
            borderRadius: "15px",
            marginTop: "30px",
          }}
        >
          <p style={{ fontSize: "1.1em", color: "#666" }}>
            No devices found. Please seed devices in MongoDB.
          </p>
        </div>
      )}

      {editingDevice && (
        <EditDeviceModal
          device={editingDevice}
          onClose={handleCloseModal}
          onSave={handleSaveDevice}
        />
      )}
    </div>
  );
}

export default HomePage;
