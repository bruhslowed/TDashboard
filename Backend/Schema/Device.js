const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, unique: true }, //Mac address from iot device
  name: { type: String, required: true }, // Name of iot device
  location: String, //location of iot device
  thresholdMin: Number,
  thresholdMax: Number,
  breachDuration: Number,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Device", deviceSchema);
