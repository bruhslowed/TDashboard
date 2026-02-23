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
import { API_URLS } from "../constants/const";

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
              onClick={() => {
                setTimeRange(range);
              }}
              style={{
                backgroundColor:
                  timeRange === range ? "#4CAF50" : "#2a2a2a",
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

export default DeviceDashboard;
