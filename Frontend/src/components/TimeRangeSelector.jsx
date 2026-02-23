import React from "react";

function TimeRangeSelector({ timeRange, setTimeRange }) {
  return (
    <div
      style={{
        marginBottom: "20px",
        display: "flex",
        gap: "10px",
        flexWrap: "wrap",
      }}
    >
      {["20", "50", "100", "150", "200"].map((range) => (
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
  );
}

export default TimeRangeSelector;
