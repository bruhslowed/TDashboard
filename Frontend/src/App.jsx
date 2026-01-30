import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";
import { API_URLS } from "./constants/const";

function App() {
  const [currentView, setCurrentView] = useState("home");
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await axios.get(API_URLS.DEVICES);
      setDevices(response.data);
    } catch (error) {
      console.error("Error fetching devices:", error);
    }
  };

  const openDeviceDashboard = (device) => {
    setSelectedDevice(device);
    setCurrentView("device");
  };

  return (
    <div
      style={{ minHeight: "100vh", backgroundColor: "#0f0f0f", color: "#fff" }}
    >
      {currentView === "home" && (
        <HomePage devices={devices} onDeviceClick={openDeviceDashboard} />
      )}
      {currentView === "device" && selectedDevice && (
        <DeviceDashboard
          device={selectedDevice}
          onBack={() => setCurrentView("home")}
        />
      )}
    </div>
  );
}

function HomePage({ devices, onDeviceClick }) {
  const [latestReadings, setLatestReadings] = useState({});

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

  return (
    <div style={{ padding: "40px" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "3em", marginBottom: "10px" }}>
          🌡️ Temperature Monitoring Dashboard
        </h1>
        <p style={{ color: "#888", fontSize: "1.1em", marginBottom: "40px" }}>
          Monitor all your IoT temperature sensors in real-time
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
            gap: "25px",
          }}
        >
          {devices.map((device) => (
            <DeviceCard
              key={device.deviceId}
              device={device}
              latestReading={latestReadings[device.deviceId]}
              onClick={() => onDeviceClick(device)}
            />
          ))}
        </div>

        {devices.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "60px",
              backgroundColor: "#1a1a1a",
              borderRadius: "15px",
              marginTop: "40px",
            }}
          >
            <p style={{ fontSize: "1.3em", color: "#666" }}>
              No devices found. Please seed devices in MongoDB.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function DeviceCard({ device, latestReading, onClick }) {
  const isOnline =
    latestReading && new Date() - new Date(latestReading.date) < 30000;

  const getStatusColor = () => {
    if (!isOnline) return "#666";
    if (!device.thresholdMin || !device.thresholdMax) return "#4CAF50";

    const temp = latestReading?.temperature;
    if (temp < device.thresholdMin || temp > device.thresholdMax)
      return "#f44336";
    return "#4CAF50";
  };

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: "#1a1a1a",
        borderRadius: "15px",
        padding: "25px",
        cursor: "pointer",
        transition: "all 0.3s ease",
        border: "2px solid transparent",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.borderColor = "#4CAF50";
        e.currentTarget.style.boxShadow = "0 10px 30px rgba(76, 175, 80, 0.3)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "transparent";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "15px",
          right: "15px",
          width: "12px",
          height: "12px",
          borderRadius: "50%",
          backgroundColor: getStatusColor(),
          boxShadow: `0 0 10px ${getStatusColor()}`,
        }}
      />

      <h2
        style={{
          fontSize: "1.5em",
          marginBottom: "5px",
          color: "#fff",
        }}
      >
        {device.name || device.deviceId}
      </h2>

      <p
        style={{
          color: "#888",
          fontSize: "0.9em",
          marginBottom: "10px",
        }}
      >
        {device.location || "No location set"}
      </p>

      <p
        style={{
          color: "#666",
          fontSize: "0.8em",
          marginBottom: "20px",
          fontFamily: "monospace",
        }}
      >
        ID: {device.deviceId}
      </p>

      {latestReading ? (
        <>
          <div
            style={{
              fontSize: "3em",
              fontWeight: "bold",
              color: getStatusColor(),
              marginBottom: "10px",
            }}
          >
            {latestReading.temperature.toFixed(1)}°C
          </div>

          <div style={{ color: "#666", fontSize: "0.9em" }}>
            Updated {new Date(latestReading.date).toLocaleTimeString()}
          </div>

          {device.thresholdMin && device.thresholdMax && (
            <div
              style={{
                marginTop: "15px",
                padding: "10px",
                backgroundColor: "#0f0f0f",
                borderRadius: "8px",
                fontSize: "0.85em",
              }}
            >
              <div style={{ color: "#888" }}>
                Range: {device.thresholdMin}°C - {device.thresholdMax}°C
              </div>
            </div>
          )}
        </>
      ) : (
        <div style={{ color: "#666", fontSize: "1.1em", padding: "20px 0" }}>
          No data available
        </div>
      )}

      <div
        style={{
          marginTop: "15px",
          padding: "8px 15px",
          backgroundColor: isOnline
            ? "rgba(76, 175, 80, 0.1)"
            : "rgba(255, 255, 255, 0.05)",
          borderRadius: "6px",
          fontSize: "0.85em",
          color: isOnline ? "#4CAF50" : "#666",
          fontWeight: "500",
        }}
      >
        {isOnline ? "● Online" : "○ Offline"}
      </div>
    </div>
  );
}

function DeviceDashboard({ device, onBack }) {
  const [temperatureData, setTemperatureData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("20");

  const fetchTemperature = async () => {
    try {
      const response = await axios.get(
        `${API_URLS.TEMPERATURES}?deviceId=${device.deviceId}&limit=${timeRange}`,
      );
      setTemperatureData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Fetch error:", error);
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemperature();
    const interval = setInterval(fetchTemperature, 5000);
    return () => clearInterval(interval);
  }, [device.deviceId, timeRange]);

  const chartData = temperatureData
    .slice()
    .reverse()
    .map((item) => ({
      time: new Date(item.date).toLocaleTimeString(),
      temperature: item.temperature,
    }));

  const latestReading = temperatureData[0];

  if (loading)
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>
    );
  if (error)
    return (
      <div style={{ padding: "40px", color: "#f44336" }}>Error: {error}</div>
    );

  const isInBreach =
    latestReading &&
    device.thresholdMin &&
    device.thresholdMax &&
    (latestReading.temperature < device.thresholdMin ||
      latestReading.temperature > device.thresholdMax);

  return (
    <div style={{ padding: "40px" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <button
          onClick={onBack}
          style={{
            backgroundColor: "#2a2a2a",
            color: "#fff",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            cursor: "pointer",
            marginBottom: "20px",
            fontSize: "1em",
          }}
        >
          ← Back to Home
        </button>

        <h1 style={{ fontSize: "2.5em", marginBottom: "10px" }}>
          🌡️ {device.name || device.deviceId}
        </h1>
        <p style={{ color: "#888", fontSize: "1.1em", marginBottom: "10px" }}>
          {device.location || "No location set"}
        </p>
        <p
          style={{
            color: "#666",
            fontSize: "0.9em",
            marginBottom: "30px",
            fontFamily: "monospace",
          }}
        >
          Device ID: {device.deviceId}
        </p>

        {latestReading && (
          <div
            style={{
              fontSize: "2em",
              margin: "20px 0",
              padding: "30px",
              backgroundColor: isInBreach ? "#3d1616" : "#1a1a1a",
              borderRadius: "15px",
              border: isInBreach
                ? "2px solid #f44336"
                : "2px solid transparent",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "20px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "0.5em",
                    color: "#888",
                    marginBottom: "5px",
                  }}
                >
                  Current Temperature
                </div>
                <strong style={{ color: isInBreach ? "#f44336" : "#4CAF50" }}>
                  {latestReading.temperature.toFixed(1)}°C
                </strong>
              </div>
              {device.thresholdMin && device.thresholdMax && (
                <div style={{ fontSize: "0.6em", textAlign: "right" }}>
                  <div style={{ color: "#888" }}>Threshold Range</div>
                  <div style={{ color: "#fff", marginTop: "5px" }}>
                    {device.thresholdMin}°C - {device.thresholdMax}°C
                  </div>
                  {isInBreach && (
                    <div
                      style={{
                        color: "#f44336",
                        marginTop: "10px",
                        fontWeight: "bold",
                      }}
                    >
                      ⚠️ BREACH DETECTED
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <div
          style={{
            marginBottom: "20px",
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          {["20", "50", "100"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              style={{
                backgroundColor: timeRange === range ? "#4CAF50" : "#2a2a2a",
                color: "#fff",
                border: "none",
                padding: "10px 20px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "0.9em",
              }}
            >
              Last {range} readings
            </button>
          ))}
        </div>

        <div
          style={{
            width: "100%",
            height: 400,
            backgroundColor: "#1a1a1a",
            borderRadius: "15px",
            padding: "20px",
          }}
        >
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="time" stroke="#888" />
              <YAxis domain={["dataMin - 1", "dataMax + 1"]} stroke="#888" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #333",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#4CAF50"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              {device.thresholdMax && (
                <Line
                  type="monotone"
                  dataKey={() => device.thresholdMax}
                  stroke="#f44336"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Max Threshold"
                />
              )}
              {device.thresholdMin && (
                <Line
                  type="monotone"
                  dataKey={() => device.thresholdMin}
                  stroke="#2196F3"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Min Threshold"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{ marginTop: 40 }}>
          <h2 style={{ fontSize: "1.5em", marginBottom: "20px" }}>
            Recent Readings
          </h2>
          <div
            style={{
              backgroundColor: "#1a1a1a",
              borderRadius: "15px",
              padding: "20px",
              maxHeight: "300px",
              overflowY: "auto",
            }}
          >
            {temperatureData.map((item, index) => (
              <div
                key={index}
                style={{
                  padding: "10px",
                  borderBottom:
                    index < temperatureData.length - 1
                      ? "1px solid #333"
                      : "none",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>{item.temperature.toFixed(1)}°C</span>
                <span style={{ color: "#888" }}>
                  {new Date(item.date).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
