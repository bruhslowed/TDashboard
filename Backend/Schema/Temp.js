const mongoose = require("mongoose");

const tempSchema = mongoose.Schema({
  temperature: { type: Number, required: true },
  humidity: { type: Number, required: false },

  date: { type: Date, required: true },

  deviceId: {
    type: String,
    required: true,
    ref: "Devices",
  },
});

module.exports = mongoose.model("temperature", tempSchema);
