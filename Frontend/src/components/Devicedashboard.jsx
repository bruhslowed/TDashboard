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
  ReferenceArea,
} from "recharts";
import axios from "axios";
import { API_URLS } from "../constants/const";

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
              style={{ color: "#2196F3", margin: "5px 0", fontWeight: "bold" }}
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
      <div style={{ padding: "40px", color: "#f44336" }}>Error: {error}</div>
    );

  const isInBreach =
    latestReading &&
    device.thresholdMin &&
    device.thresholdMax &&
    (latestReading.temperature < device.thresholdMin ||
      latestReading.temperature > device.thresholdMax);

  // Calculate if heat index is in breach
  const heatIndexBreach =
    latestReading &&
    latestReading.humidity &&
    device.thresholdMin &&
    device.thresholdMax &&
    (calculateHeatIndex(latestReading.temperature, latestReading.humidity) <
      device.thresholdMin ||
      calculateHeatIndex(latestReading.temperature, latestReading.humidity) >
        device.thresholdMax);

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

        {/* Current Status Card */}
        {latestReading && (
          <div
            style={{
              fontSize: "2em",
              margin: "20px 0",
              padding: "30px",
              backgroundColor:
                isInBreach || heatIndexBreach ? "#3d1616" : "#1a1a1a",
              borderRadius: "15px",
              border:
                isInBreach || heatIndexBreach
                  ? "2px solid #f44336"
                  : "2px solid transparent",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "20px",
              }}
            >
              {/* Temperature */}
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

              {/* Humidity */}
              {latestReading.humidity !== null &&
                latestReading.humidity !== undefined && (
                  <div>
                    <div
                      style={{
                        fontSize: "0.5em",
                        color: "#888",
                        marginBottom: "5px",
                      }}
                    >
                      Relative Humidity
                    </div>
                    <strong style={{ color: "#2196F3" }}>
                      {latestReading.humidity.toFixed(0)}%
                    </strong>
                  </div>
                )}

              {/* Heat Index */}
              {latestReading.humidity !== null &&
                latestReading.humidity !== undefined && (
                  <div>
                    <div
                      style={{
                        fontSize: "0.5em",
                        color: "#888",
                        marginBottom: "5px",
                      }}
                    >
                      Heat Index (Feels Like)
                    </div>
                    <strong
                      style={{ color: heatIndexBreach ? "#f44336" : "#FF9800" }}
                    >
                      {calculateHeatIndex(
                        latestReading.temperature,
                        latestReading.humidity,
                      ).toFixed(1)}
                      °C
                    </strong>
                    {calculateHeatIndex(
                      latestReading.temperature,
                      latestReading.humidity,
                    ) >
                      latestReading.temperature + 1 && (
                      <div
                        style={{
                          fontSize: "0.4em",
                          color: "#f44336",
                          marginTop: "5px",
                        }}
                      >
                        +
                        {(
                          calculateHeatIndex(
                            latestReading.temperature,
                            latestReading.humidity,
                          ) - latestReading.temperature
                        ).toFixed(1)}
                        °C warmer
                      </div>
                    )}
                  </div>
                )}

              {/* Thresholds */}
              {device.thresholdMin && device.thresholdMax && (
                <div>
                  <div style={{ fontSize: "0.5em", color: "#888" }}>
                    Threshold Range
                  </div>
                  <div
                    style={{
                      color: "#fff",
                      marginTop: "5px",
                      fontSize: "0.7em",
                    }}
                  >
                    {device.thresholdMin}°C - {device.thresholdMax}°C
                  </div>
                  {(isInBreach || heatIndexBreach) && (
                    <div
                      style={{
                        color: "#f44336",
                        marginTop: "10px",
                        fontWeight: "bold",
                        fontSize: "0.5em",
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

        {/* Time Range Selector */}
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

        {/* Dual-Axis Chart */}
        <div
          style={{
            width: "100%",
            height: 450,
            backgroundColor: "#1a1a1a",
            borderRadius: "15px",
            padding: "20px",
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: "15px", color: "#fff" }}>
            Temperature, Humidity & Heat Index Over Time
          </h3>

          <ResponsiveContainer>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />

              {/* X-Axis: Time */}
              <XAxis
                dataKey="time"
                stroke="#888"
                style={{ fontSize: "0.85em" }}
              />

              {/* LEFT Y-AXIS: Temperature & Heat Index (°C) */}
              <YAxis
                yAxisId="left"
                domain={["auto", "auto"]}
                stroke="#888"
                label={{
                  value: "Temperature (°C)",
                  angle: -90,
                  position: "insideLeft",
                  style: { fill: "#888", fontSize: "0.9em" },
                }}
                style={{ fontSize: "0.85em" }}
              />

              {/* RIGHT Y-AXIS: Humidity (%) */}
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 100]}
                stroke="#888"
                label={{
                  value: "Humidity (%)",
                  angle: 90,
                  position: "insideRight",
                  style: { fill: "#888", fontSize: "0.9em" },
                }}
                style={{ fontSize: "0.85em" }}
              />

              {/* Custom Tooltip */}
              <Tooltip content={<CustomTooltip />} />

              <Legend wrapperStyle={{ paddingTop: "10px" }} iconType="line" />

              {/* Comfort Zone Reference Area (optional) */}
              {device.thresholdMin && device.thresholdMax && (
                <ReferenceArea
                  yAxisId="left"
                  y1={device.thresholdMin}
                  y2={device.thresholdMax}
                  stroke="#4CAF50"
                  strokeOpacity={0.3}
                  fill="#4CAF50"
                  fillOpacity={0.05}
                />
              )}

              {/* Temperature Line (Green, Solid) */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="temperature"
                stroke="#4CAF50"
                strokeWidth={3}
                dot={{ r: 4, fill: "#4CAF50" }}
                activeDot={{ r: 6 }}
                name="Temperature (°C)"
              />

              {/* Heat Index Line (Orange, Dashed) */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="heatIndex"
                stroke="#FF9800"
                strokeWidth={2.5}
                strokeDasharray="8 4"
                dot={{ r: 3, fill: "#FF9800" }}
                name="Heat Index (Feels Like)"
              />

              {/* Humidity Line (Blue, Solid) */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="humidity"
                stroke="#2196F3"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#9370db" }}
                name="Humidity (%)"
                connectNulls
              />

              {/* Max Threshold Line (Red, Dashed) */}
              {device.thresholdMax && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey={() => device.thresholdMax}
                  stroke="#f44336"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Max Threshold"
                />
              )}

              {/* Min Threshold Line (Light Blue, Dashed) */}
              {device.thresholdMin && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey={() => device.thresholdMin}
                  stroke="#03A9F4"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Min Threshold"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Chart Legend Explanation */}
        <div
          style={{
            marginTop: "15px",
            padding: "15px",
            backgroundColor: "#1a1a1a",
            borderRadius: "10px",
            fontSize: "0.85em",
            color: "#888",
          }}
        >
          <strong style={{ color: "#fff" }}>Chart Guide:</strong>
          <div style={{ marginTop: "8px" }}>
            🟢 <strong style={{ color: "#4CAF50" }}>Green line</strong> = Actual
            temperature (left axis)
          </div>
          <div style={{ marginTop: "5px" }}>
            🟠 <strong style={{ color: "#FF9800" }}>Orange dashed</strong> =
            Heat index / "Feels like" temperature (left axis)
          </div>
          <div style={{ marginTop: "5px" }}>
            🔵 <strong style={{ color: "#9370db" }}>Purple line</strong> =
            Humidity percentage (right axis)
          </div>
          {device.thresholdMin && device.thresholdMax}
        </div>

        {/* Recent Readings Table */}
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
                  padding: "12px",
                  borderBottom:
                    index < temperatureData.length - 1
                      ? "1px solid #333"
                      : "none",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr 1fr",
                  gap: "10px",
                  alignItems: "center",
                }}
              >
                <span style={{ fontWeight: "bold" }}>
                  {item.temperature.toFixed(1)}°C
                </span>
                {item.humidity !== null && item.humidity !== undefined && (
                  <span style={{ color: "#9370db" }}>
                    {item.humidity.toFixed(0)}% RH
                  </span>
                )}
                {item.humidity !== null && item.humidity !== undefined && (
                  <span style={{ color: "#FF9800" }}>
                    Feels:{" "}
                    {calculateHeatIndex(
                      item.temperature,
                      item.humidity,
                    ).toFixed(1)}
                    °C
                  </span>
                )}
                <span style={{ color: "#888", textAlign: "right" }}>
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
