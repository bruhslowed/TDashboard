import React from "react";

function RecentReadingsTable({ temperatureData, calculateHeatIndex }) {
  return (
    <div style={{ marginTop: 40 }}>
      <h2 style={{ fontSize: "1.5em", marginBottom: "20px" }}>Recent Readings</h2>
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
              borderBottom: index < temperatureData.length - 1 ? "1px solid #333" : "none",
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr",
              gap: "10px",
              alignItems: "center",
            }}
          >
            <span style={{ fontWeight: "bold" }}>{item.temperature.toFixed(1)}°C</span>
            {item.humidity !== null && item.humidity !== undefined && (
              <span style={{ color: "#e0ffff " }}>{item.humidity.toFixed(0)}% RH</span>
            )}
            {item.humidity !== null && item.humidity !== undefined && (
              <span style={{ color: "#FF9800" }}>
                Feels: {calculateHeatIndex(item.temperature, item.humidity).toFixed(1)}°C
              </span>
            )}
            <span style={{ color: "#888", textAlign: "right" }}>{new Date(item.date).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentReadingsTable;
