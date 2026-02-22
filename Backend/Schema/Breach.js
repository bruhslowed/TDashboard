const mongoose = require("mongoose");

const breachSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  deviceName: String,
  location: String,
  startTime: { type: Date, required: true },
  endTime: { type: Date, default: null },
  startTemperature: Number,
  endTemperature: Number,
  peakTemperature: Number,
  thresholdMin: Number,
  thresholdMax: Number,
  breachType: { type: String, enum: ["too_hot", "too_cold"] },
  duration: Number,
  isResolved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Breach", breachSchema);
