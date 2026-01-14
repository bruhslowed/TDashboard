const express = require("express");
const cors = require("cors");
const mqtt = require("mqtt");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Temperature data storage (in RAM)
let temperatureData = [];

// Connect to MQTT broker
const mqttClient = mqtt.connect("mqtt://localhost:1883");

mqttClient.on("connect", () => {
  console.log("✅ Connected to MQTT broker");

  // Subscribe to temperature topic
  mqttClient.subscribe("sensor/temperature", (err) => {
    if (err) {
      console.error("❌ Failed to subscribe:", err);
    } else {
      console.log("✅ Subscribed to sensor/temperature topic");
    }
  });
});

mqttClient.on("error", (err) => {
  console.error("❌ MQTT Error:", err);
});

// Handle incoming MQTT messages
mqttClient.on("message", (topic, message) => {
  try {
    console.log(message);
    const data = JSON.parse(message.toString());
    const tempReading = {
      temperature: parseFloat(data.temperature),
      timestamp: Date.now(),
    };

    // Add to RAM storage
    temperatureData.push(tempReading);

    // Keep only last 50 readings in RAM
    if (temperatureData.length > 50) {
      temperatureData.shift();
    }

    console.log(`📊 New temperature: ${tempReading.temperature}°C`);

    // Log to CSV file
    logToCSV(tempReading);
  } catch (err) {
    console.error("❌ Error parsing MQTT message:", err);
  }
});

// Function to log data to CSV
function logToCSV(reading) {
  const csvPath = path.join(__dirname, "data", "temperature_log.csv");
  const csvLine = `${new Date(reading.timestamp).toISOString()},${
    reading.temperature
  }\n`;

  // Create data directory if it doesn't exist
  if (!fs.existsSync(path.join(__dirname, "data"))) {
    fs.mkdirSync(path.join(__dirname, "data"));
  }

  // Create CSV with headers if it doesn't exist
  if (!fs.existsSync(csvPath)) {
    fs.writeFileSync(csvPath, "timestamp,temperature\n");
  }

  // Append data
  fs.appendFile(csvPath, csvLine, (err) => {
    if (err) {
      console.error("❌ Error writing to CSV:", err);
    }
  });
}

// API endpoint to get temperature data
app.get("/api/temperature", (req, res) => {
  res.json(temperatureData);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});
