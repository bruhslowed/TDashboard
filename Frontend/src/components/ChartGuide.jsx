import React from "react";

function ChartGuide({ device }) {
  return (
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
        🟢 <strong style={{ color: "#4CAF50" }}>Green line</strong> = Actual temperature (left axis)
      </div>
      <div style={{ marginTop: "5px" }}>
        🟠 <strong style={{ color: "#FF9800" }}>Orange dashed</strong> = Heat index / "Feels like" temperature (left axis)
      </div>
      <div style={{ marginTop: "5px" }}>
        🔵 <strong style={{ color: "#e0ffff " }}>Cyan line</strong> = Humidity percentage (right axis)
      </div>
      {device.thresholdMin && device.thresholdMax}
    </div>
  );
}

export default ChartGuide;
