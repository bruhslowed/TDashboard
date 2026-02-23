import { useState, useEffect } from "react";
import axios from "axios";
import { API_URLS } from "../constants/const";
import StatusCard from "./StatusCard";
import TimeRangeSelector from "./TimeRangeSelector";
import DeviceChart from "./DeviceChart";
import ChartGuide from "./ChartGuide";
import RecentReadingsTable from "./RecentReadingsTable";

// Heat Index calculation function
const calculateHeatIndex = (tempC, humidity) => {
  if (!humidity || tempC < 27) return tempC;
  const tempF = (tempC * 9) / 5 + 32;
  const HI =
    -42.379 +
    2.04901523 * tempF +
    10.14333127 * humidity -
    0.22475541 * tempF * humidity -
    0.00683783 * tempF * tempF -
    0.05481717 * humidity * humidity +
    0.00122874 * tempF * tempF * humidity +
    0.00085282 * tempF * humidity * humidity -
    0.00000199 * tempF * tempF * humidity * humidity;
  return Math.round((((HI - 32) * 5) / 9) * 10) / 10;
};

// Custom Tooltip Component
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div
        style={{
          backgroundColor: "#1a1a1a",
          border: "1px solid #333",
          borderRadius: "8px",
          padding: "12px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
        }}
      >
        <p style={{ color: "#888", margin: "0 0 8px 0", fontSize: "0.9em" }}>
          {data.time}
        </p>
        <p style={{ color: "#4CAF50", margin: "5px 0", fontWeight: "bold" }}>
          🌡️ Temperature: {data.temperature.toFixed(1)}°C
        </p>
        {data.humidity !== null && (
          <>
            <p
              style={{ color: "#e0ffff ", margin: "5px 0", fontWeight: "bold" }}
            >
              💧 Humidity: {data.humidity.toFixed(0)}%
            </p>
            <p
              style={{ color: "#FF9800", margin: "5px 0", fontWeight: "bold" }}
            >
              🔥 Feels Like: {data.heatIndex.toFixed(1)}°C
            </p>
            {data.heatIndex > data.temperature + 1 && (
              <p
                style={{
                  color: "#f44336",
                  margin: "8px 0 0 0",
                  fontSize: "0.85em",
                }}
              >
                ⚠️ {(data.heatIndex - data.temperature).toFixed(1)}°C warmer due
                to humidity
              </p>
            )}
          </>
        )}
      </div>
    );
  }
  return null;
};

function DeviceDashboard({ device, onBack }) {
  const [temperatureData, setTemperatureData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("50");

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

  // Prepare chart data with heat index
  const chartData = temperatureData
    .slice()
    .reverse()
    .map((item) => ({
      time: new Date(item.date).toLocaleTimeString(),
      temperature: item.temperature,
      humidity: item.humidity || null,
      heatIndex: item.humidity
        ? calculateHeatIndex(item.temperature, item.humidity)
        : item.temperature,
    }));

  const latestReading = temperatureData[0];

  if (loading)
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>
    );
  if (error)
    return (
      <div style={{ padding: "40px", color: "#472624" }}>Error: {error}</div>
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

        {/* Status Card */}
        <StatusCard
          latestReading={latestReading}
          device={{ ...device, calculateHeatIndex }}
          isInBreach={isInBreach}
        />

        {/* Time Range Selector */}
        <TimeRangeSelector timeRange={timeRange} setTimeRange={setTimeRange} />

        {/* Device Chart */}
        <DeviceChart
          chartData={chartData}
          device={device}
          CustomTooltip={CustomTooltip}
        />

        {/* Chart Guide */}
        <ChartGuide device={device} />

        {/* Recent Readings Table */}
        <RecentReadingsTable
          temperatureData={temperatureData}
          calculateHeatIndex={calculateHeatIndex}
        />
      </div>
    </div>
  );
}

export default DeviceDashboard;
