import React from "react";
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

function DeviceChart({ chartData, device, CustomTooltip }) {
  return (
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
          <XAxis dataKey="time" stroke="#888" style={{ fontSize: "0.85em" }} />
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
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: "10px" }} iconType="line" />
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
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="humidity"
            stroke="#e0ffff "
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#e0ffff" }}
            name="Humidity (%)"
            connectNulls
          />
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
  );
}

export default DeviceChart;
