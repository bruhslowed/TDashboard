// In DeviceCard component
import { useState, useEffect } from "react";

function DeviceCard({ device, latestReading, onClick, onEditClick }) {
  const [breachDuration, setBreachDuration] = useState(0);

  // Calculate breach duration in real-time
  useEffect(() => {
    if (device.isCurrentlyInBreach && device.breachStartTime) {
      const interval = setInterval(() => {
        const now = new Date();
        const start = new Date(device.breachStartTime);
        const durationSeconds = Math.floor((now - start) / 1000);
        setBreachDuration(durationSeconds);
      }, 1000); // Update every second

      return () => clearInterval(interval);
    } else {
      setBreachDuration(0);
    }
  }, [device.isCurrentlyInBreach, device.breachStartTime]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isInBreach = device.isCurrentlyInBreach;
  const isOnline =
    latestReading && new Date() - new Date(latestReading.date) < 30000;

  const getStatusColor = () => {
    if (!isOnline) return "#666";
    if (isInBreach) return "#f44336"; // Red for breach
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
        backgroundColor: isInBreach ? "#3d1616" : "#1a1a1a", // Dark red if breach
        borderRadius: "15px",
        padding: "25px",
        cursor: "pointer",
        transition: "all 0.3s ease",
        border: isInBreach ? "2px solid #f44336" : "2px solid transparent",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.borderColor = isInBreach ? "#f44336" : "#4CAF50";
        e.currentTarget.style.boxShadow = isInBreach
          ? "0 10px 30px rgba(244, 67, 54, 0.3)"
          : "0 10px 30px rgba(76, 175, 80, 0.3)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = isInBreach
          ? "#f44336"
          : "transparent";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Status indicator dot */}
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

      {/* BREACH TIMER - Top right corner */}
      {isInBreach && (
        <div
          style={{
            position: "absolute",
            top: "15px",
            right: "40px",
            padding: "5px 12px",
            backgroundColor: "#f44336",
            borderRadius: "15px",
            fontSize: "0.9em",
            fontWeight: "bold",
            animation: "pulse 2s infinite",
          }}
        >
          ⚠️ {formatDuration(breachDuration)}
        </div>
      )}

      <h2 style={{ fontSize: "1.5em", marginBottom: "5px", color: "#fff" }}>
        {device.name || device.deviceId}
      </h2>

      <p style={{ color: "#888", fontSize: "0.9em", marginBottom: "10px" }}>
        {device.location || "No location set"}
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
              {isInBreach && (
                <div
                  style={{
                    color: "#f44336",
                    marginTop: "5px",
                    fontWeight: "bold",
                  }}
                >
                  Breach Duration Limit: {device.breachDuration}s
                </div>
              )}
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
          display: "flex",
          gap: "10px",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            padding: "8px 15px",
            backgroundColor: isOnline
              ? "rgba(76, 175, 80, 0.1)"
              : "rgba(255, 255, 255, 0.05)",
            borderRadius: "6px",
            fontSize: "0.85em",
            color: isOnline ? "#4CAF50" : "#666",
            fontWeight: "500",
            flex: 1,
          }}
        >
          {isOnline ? "● Online" : "○ Offline"}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEditClick && onEditClick(device);
          }}
          style={{
            padding: "8px 15px",
            backgroundColor: "#2196F3",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontSize: "0.85em",
            fontWeight: "500",
            cursor: "pointer",
            transition: "background-color 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#1976D2";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#2196F3";
          }}
        >
          ✎ Edit
        </button>
      </div>
    </div>
  );
}
export default DeviceCard;
