const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose"); // for mongodb
const mqttHandler = require("./services/mqttservice.js"); // for mqtt broker
const temperatureRoutes = require("./Routes/temproutes.js"); // for api calls between front and backend
const deviceRoutes = require("./Routes/deviceroutes.js");

console.log("📁 Temperature routes loaded:", typeof temperatureRoutes); // Should say "function"

const app = express();
app.use(cors());
app.use(express.json());

// API endpoint to get temperature data
// app.get("/api/temperature", (req, res) => {
//   res.json(temperatureData);
// });
const mongoURI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/ESP8266_sensor";

mongoose
  .connect(mongoURI)
  .then(() => console.log("✅ Connected to MongoDB at:", mongoURI))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Use routes that starts with api/temperature
app.use("/api/temperature", temperatureRoutes);
app.use("/api/devices", deviceRoutes);

// Connect to MQTT
mqttHandler.connect();

// Graceful shutdown
process.on("SIGINT", () => {
  mqttHandler.disconnect();
  mongoose.connection.close();
  process.exit(0);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});
