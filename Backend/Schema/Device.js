// models/Device.js
const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  location: String,
  thresholdMin: Number,
  thresholdMax: Number,
  breachduration: Number,
  email: String,

  breachStartTime: { type: Date, default: null },
  isCurrentlyInBreach: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Device", deviceSchema);
