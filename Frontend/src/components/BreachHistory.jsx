// components/BreachHistory.jsx - Simplified Version
import { useState, useEffect } from "react";
import axios from "axios";
import { API_URLS } from "../constants/const";

function BreachHistory({ deviceId }) {
  const [breaches, setBreaches] = useState([]);
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) return <div style={{ color: "#888" }}>Loading breaches...</div>;

  return (
    <div style={{ marginTop: 40 }}>
      <h2 style={{ fontSize: "1.5em", marginBottom: "20px" }}>
        Breach History ({breaches.length})
      </h2>

      {breaches.length === 0 ? (
        <div
          style={{
            backgroundColor: "#1a1a1a",
            padding: "30px",
            borderRadius: "10px",
            textAlign: "center",
            color: "#888",
          }}
        >
          No breaches detected
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {breaches.map((breach, index) => (
            <div
              key={breach._id || index}
              style={{
                backgroundColor: "#1a1a1a",
                padding: "20px",
                borderRadius: "10px",
                borderLeft: `4px solid ${breach.breachType === "too_hot" ? "#f44336" : "#2196F3"}`,
              }}
            >
              {/* Header */}
              <div
                style={{
                  fontSize: "1.1em",
                  fontWeight: "bold",
                  marginBottom: "15px",
                  color:
                    breach.breachType === "too_hot" ? "#f44336" : "#2196F3",
                }}
              >
                {breach.breachType === "too_hot" ? "🔥 HIGH" : "❄️ LOW"}{" "}
                Temperature Breach
                {!breach.isResolved && (
                  <span
                    style={{
                      marginLeft: "10px",
                      fontSize: "0.7em",
                      backgroundColor: "#f44336",
                      padding: "3px 8px",
                      borderRadius: "4px",
                      color: "#fff",
                    }}
                  >
                    ONGOING
                  </span>
                )}
              </div>

              {/* Info Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "15px",
                  fontSize: "0.9em",
                }}
              >
                <div>
                  <div style={{ color: "#888", marginBottom: "5px" }}>
                    Started:
                  </div>
                  <div style={{ color: "#fff" }}>
                    {formatDate(breach.startTime)}
                  </div>
                </div>

                {breach.isResolved && breach.endTime && (
                  <div>
                    <div style={{ color: "#888", marginBottom: "5px" }}>
                      Ended:
                    </div>
                    <div style={{ color: "#fff" }}>
                      {formatDate(breach.endTime)}
                    </div>
                  </div>
                )}

                <div>
                  <div style={{ color: "#888", marginBottom: "5px" }}>
                    Duration:
                  </div>
                  <div style={{ color: "#fff" }}>
                    {breach.duration
                      ? formatDuration(breach.duration)
                      : "Ongoing"}
                  </div>
                </div>

                <div>
                  <div style={{ color: "#888", marginBottom: "5px" }}>
                    Peak Temp:
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

                <div>
                  <div style={{ color: "#888", marginBottom: "5px" }}>
                    Threshold:
                  </div>
                  <div style={{ color: "#fff" }}>
                    {breach.thresholdMin}°C - {breach.thresholdMax}°C
                  </div>
                </div>

                <div>
                  <div style={{ color: "#888", marginBottom: "5px" }}>
                    Status:
                  </div>
                  <div
                    style={{ color: breach.isResolved ? "#4CAF50" : "#f44336" }}
                  >
                    {breach.isResolved ? "✓ Resolved" : "⚠ Ongoing"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BreachHistory;
