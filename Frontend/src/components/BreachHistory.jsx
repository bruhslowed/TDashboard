// components/BreachHistory.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { API_URLS } from "../constants/const";

function BreachHistory({ deviceId }) {
  const [breaches, setBreaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBreaches();
  }, [deviceId]);

  const fetchBreaches = async () => {
    try {
      const response = await axios.get(`${API_URLS.BREACHES}/${deviceId}`);
      setBreaches(response.data.breaches || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching breaches:", error);
      setError(error.message);
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  if (loading) {
    return (
      <div
        style={{
          backgroundColor: "#1a1a1a",
          padding: "30px",
          borderRadius: "15px",
          textAlign: "center",
          color: "#888",
        }}
      >
        Loading breach history...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          backgroundColor: "#1a1a1a",
          padding: "30px",
          borderRadius: "15px",
          textAlign: "center",
          color: "#f44336",
        }}
      >
        Error loading breaches: {error}
      </div>
    );
  }

  return (
    <div style={{ marginTop: 40 }}>
      <h2
        style={{
          fontSize: "1.5em",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <span>⚠️ Breach History</span>
        <span
          style={{
            fontSize: "0.6em",
            backgroundColor: breaches.length > 0 ? "#f44336" : "#4CAF50",
            color: "#fff",
            padding: "4px 12px",
            borderRadius: "20px",
            fontWeight: "normal",
          }}
        >
          {breaches.length} {breaches.length === 1 ? "breach" : "breaches"}
        </span>
      </h2>

      {breaches.length === 0 ? (
        <div
          style={{
            backgroundColor: "#1a1a1a",
            padding: "40px",
            borderRadius: "15px",
            textAlign: "center",
            color: "#888",
          }}
        >
          <div style={{ fontSize: "3em", marginBottom: "10px" }}>✅</div>
          <div style={{ fontSize: "1.2em" }}>
            No threshold breaches detected
          </div>
          <div style={{ marginTop: "10px", fontSize: "0.9em" }}>
            This device has maintained temperature within acceptable range
          </div>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: "#1a1a1a",
            borderRadius: "15px",
            padding: "20px",
            maxHeight: "500px",
            overflowY: "auto",
          }}
        >
          {breaches.map((breach, index) => (
            <div
              key={breach._id || index}
              style={{
                padding: "20px",
                borderBottom:
                  index < breaches.length - 1 ? "1px solid #333" : "none",
                marginBottom: index < breaches.length - 1 ? "20px" : "0",
              }}
            >
              {/* Breach Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "15px",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "1.2em",
                      color:
                        breach.breachType === "too_hot" ? "#f44336" : "#2196F3",
                      fontWeight: "bold",
                      marginBottom: "5px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span>{breach.breachType === "too_hot" ? "🔥" : "❄️"}</span>
                    <span>
                      {breach.breachType === "too_hot" ? "HIGH" : "LOW"}{" "}
                      Temperature Breach
                    </span>
                    {!breach.isResolved && (
                      <span
                        style={{
                          fontSize: "0.7em",
                          backgroundColor: "#f44336",
                          padding: "4px 10px",
                          borderRadius: "4px",
                        }}
                      >
                        ONGOING
                      </span>
                    )}
                  </div>
                  <div style={{ color: "#666", fontSize: "0.9em" }}>
                    Breach #{breaches.length - index}
                  </div>
                </div>

                <div
                  style={{
                    fontSize: "2.5em",
                    fontWeight: "bold",
                    color:
                      breach.breachType === "too_hot" ? "#f44336" : "#2196F3",
                  }}
                >
                  {breach.peakTemperature.toFixed(1)}°C
                </div>
              </div>

              {/* Breach Details Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "15px",
                  backgroundColor: "#0f0f0f",
                  padding: "15px",
                  borderRadius: "8px",
                }}
              >
                {/* Start Time */}
                <div>
                  <div
                    style={{
                      fontSize: "0.8em",
                      color: "#888",
                      marginBottom: "5px",
                    }}
                  >
                    Started
                  </div>
                  <div style={{ color: "#fff", fontWeight: "bold" }}>
                    {formatDate(breach.startTime)}
                  </div>
                  <div
                    style={{
                      fontSize: "0.85em",
                      color: "#888",
                      marginTop: "3px",
                    }}
                  >
                    {breach.startTemperature.toFixed(1)}°C
                  </div>
                </div>

                {/* End Time */}
                {breach.isResolved && breach.endTime && (
                  <div>
                    <div
                      style={{
                        fontSize: "0.8em",
                        color: "#888",
                        marginBottom: "5px",
                      }}
                    >
                      Ended
                    </div>
                    <div style={{ color: "#fff", fontWeight: "bold" }}>
                      {formatDate(breach.endTime)}
                    </div>
                    <div
                      style={{
                        fontSize: "0.85em",
                        color: "#888",
                        marginTop: "3px",
                      }}
                    >
                      {breach.endTemperature.toFixed(1)}°C
                    </div>
                  </div>
                )}

                {/* Duration */}
                <div>
                  <div
                    style={{
                      fontSize: "0.8em",
                      color: "#888",
                      marginBottom: "5px",
                    }}
                  >
                    Duration
                  </div>
                  <div style={{ color: "#fff", fontWeight: "bold" }}>
                    {breach.duration
                      ? formatDuration(breach.duration)
                      : !breach.isResolved
                        ? "Ongoing..."
                        : "N/A"}
                  </div>
                </div>

                {/* Peak Temperature */}
                <div>
                  <div
                    style={{
                      fontSize: "0.8em",
                      color: "#888",
                      marginBottom: "5px",
                    }}
                  >
                    Peak Temperature
                  </div>
                  <div
                    style={{
                      color:
                        breach.breachType === "too_hot" ? "#f44336" : "#2196F3",
                      fontWeight: "bold",
                      fontSize: "1.2em",
                    }}
                  >
                    {breach.peakTemperature.toFixed(1)}°C
                  </div>
                </div>

                {/* Threshold Range */}
                <div>
                  <div
                    style={{
                      fontSize: "0.8em",
                      color: "#888",
                      marginBottom: "5px",
                    }}
                  >
                    Threshold Range
                  </div>
                  <div style={{ color: "#fff", fontWeight: "bold" }}>
                    {breach.thresholdMin}°C - {breach.thresholdMax}°C
                  </div>
                  <div
                    style={{
                      fontSize: "0.85em",
                      color: "#f44336",
                      marginTop: "3px",
                    }}
                  >
                    {breach.breachType === "too_hot"
                      ? `+${(breach.peakTemperature - breach.thresholdMax).toFixed(1)}°C over`
                      : `${(breach.thresholdMin - breach.peakTemperature).toFixed(1)}°C under`}
                  </div>
                </div>

                {/* Location */}
                {breach.location && (
                  <div>
                    <div
                      style={{
                        fontSize: "0.8em",
                        color: "#888",
                        marginBottom: "5px",
                      }}
                    >
                      Location
                    </div>
                    <div style={{ color: "#fff" }}>{breach.location}</div>
                  </div>
                )}
              </div>

              {/* Status Footer */}
              <div
                style={{
                  marginTop: "15px",
                  padding: "10px",
                  backgroundColor: breach.isResolved ? "#1a3d1a" : "#3d1616",
                  borderRadius: "6px",
                  fontSize: "0.9em",
                }}
              >
                <strong
                  style={{ color: breach.isResolved ? "#4CAF50" : "#f44336" }}
                >
                  Status:
                </strong>
                <span style={{ color: "#fff", marginLeft: "8px" }}>
                  {breach.isResolved
                    ? `✓ Resolved - Temperature returned to normal`
                    : `⚠ Ongoing - Temperature still out of range`}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BreachHistory;
