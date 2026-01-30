const mongoose = require("mongoose");
const Temp = require("../Schema/Temp.js");
const Device = require("../Schema/Device.js");

let db = {
  // ========== TEMPERATURE FUNCTIONS ==========
  async addTemperature(temp, currentDate, device_Name) {
    try {
      await Temp.create({
        temperature: temp,
        date: currentDate,
        deviceId: device_Name,
      });
      return `Temperature: ${temp} has been added from ${device_Name}, on ${currentDate}`;
    } catch (e) {
      console.log(e.message);
      throw new Error(`Temperature: ${temp} was not added.`);
    }
  },

  async getAllTemperatures(deviceId = null, limit = 50) {
    const query = deviceId ? { deviceId } : {};
    return await Temp.find(query).sort({ date: -1 }).limit(limit);
  },

  // ========== DEVICE FUNCTIONS ==========
  async getAllDevices() {
    return await Device.find();
  },

  async getDeviceById(deviceId) {
    return await Device.findOne({ deviceId });
  },

  async addDevice(deviceData) {
    const device = new Device(deviceData);
    return await device.save();
  },

  async updateDevice(deviceId, updateData) {
    return await Device.findOneAndUpdate(
      { deviceId },
      { ...updateData, updatedAt: Date.now() },
      { new: true }, // Returns updated document
    );
  },
};

module.exports = db;
