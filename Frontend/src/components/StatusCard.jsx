// ...existing code...
import React from "react";

function StatusCard({ latestReading, device, isInBreach }) {
  if (!latestReading) return null;
  return (
    <div
      style={{
        fontSize: "2em",
        margin: "20px 0",
        padding: "30px",
        backgroundColor: isInBreach ? "#3d1616" : "#1a1a1a",
        borderRadius: "15px",
        border: isInBreach ? "2px solid #f44336" : "2px solid transparent",
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
            style={{ fontSize: "0.5em", color: "#888", marginBottom: "5px" }}
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
              <strong style={{ color: "#e0ffff " }}>
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
              <strong style={{ color: "#FF9800" }}>
                {device
                  .calculateHeatIndex(
                    latestReading.temperature,
                    latestReading.humidity,
                  )
                  .toFixed(1)}
                °C
              </strong>
              {device.calculateHeatIndex(
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
                    device.calculateHeatIndex(
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
            <div style={{ color: "#fff", marginTop: "5px", fontSize: "0.7em" }}>
              {device.thresholdMin}°C - {device.thresholdMax}°C
            </div>
            {isInBreach && (
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
  );
}

export default StatusCard;
