import { useState } from "react";
import axios from "axios";
import { API_URLS } from "../constants/const";

function EditDeviceModal({ device, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: device.name || "",
    location: device.location || "",
    thresholdMin: device.thresholdMin || "",
    thresholdMax: device.thresholdMax || "",
    breachDuration: device.breachDuration || "",
    email: device.email || "",
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await axios.put(API_URLS.getDevice(device.deviceId), {
        name: formData.name,
        location: formData.location,
        thresholdMin: parseFloat(formData.thresholdMin) || null,
        thresholdMax: parseFloat(formData.thresholdMax) || null,
        breachDuration: parseInt(formData.breachDuration) || null,
        email: formData.email,
      });

      onSave(); // Refresh data
      onClose(); // Close modal
    } catch (error) {
      console.error("Error updating device:", error);
      alert("Failed to update device. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#1a1a1a",
          padding: "30px",
          borderRadius: "15px",
          maxWidth: "500px",
          width: "90%",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginBottom: "20px", fontSize: "1.8em" }}>Edit Device</h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#888",
                fontSize: "0.9em",
              }}
            >
              Device Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Living Room Sensor"
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#2a2a2a",
                border: "1px solid #444",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "1em",
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#888",
                fontSize: "0.9em",
              }}
            >
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Building A, Floor 2"
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#2a2a2a",
                border: "1px solid #444",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "1em",
              }}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "15px",
              marginBottom: "20px",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "#888",
                  fontSize: "0.9em",
                }}
              >
                Min Threshold (°C)
              </label>
              <input
                type="number"
                name="thresholdMin"
                value={formData.thresholdMin}
                onChange={handleChange}
                placeholder="e.g., 18"
                step="0.1"
                style={{
                  width: "100%",
                  padding: "12px",
                  backgroundColor: "#2a2a2a",
                  border: "1px solid #444",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "1em",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "#888",
                  fontSize: "0.9em",
                }}
              >
                Max Threshold (°C)
              </label>
              <input
                type="number"
                name="thresholdMax"
                value={formData.thresholdMax}
                onChange={handleChange}
                placeholder="e.g., 30"
                step="0.1"
                style={{
                  width: "100%",
                  padding: "12px",
                  backgroundColor: "#2a2a2a",
                  border: "1px solid #444",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "1em",
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#888",
                fontSize: "0.9em",
              }}
            >
              Breach Duration (seconds)
            </label>
            <input
              type="number"
              name="breachDuration"
              value={formData.breachDuration}
              onChange={handleChange}
              placeholder="e.g., 60"
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#2a2a2a",
                border: "1px solid #444",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "1em",
              }}
            />
            <p style={{ color: "#666", fontSize: "0.8em", marginTop: "5px" }}>
              How long (in seconds) the temperature must be out of range before
              triggering an alert
            </p>
          </div>

          <div style={{ marginBottom: "25px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#888",
                fontSize: "0.9em",
              }}
            >
              Email for Alerts
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g., alerts@example.com"
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#2a2a2a",
                border: "1px solid #444",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "1em",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "flex-end",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              style={{
                padding: "12px 24px",
                backgroundColor: "#2a2a2a",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: saving ? "not-allowed" : "pointer",
                fontSize: "1em",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: "12px 24px",
                backgroundColor: "#4CAF50",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: saving ? "not-allowed" : "pointer",
                fontSize: "1em",
              }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditDeviceModal;
