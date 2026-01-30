const express = require("express");
const router = express.Router();
const dbService = require("../services/dbservice");

// GET all devices
router.get("/", async (req, res) => {
  try {
    const devices = await dbService.getAllDevices();
    res.json(devices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}); //get every device possible from the device collection

// GET single device by deviceId // device id
router.get("/:deviceId", async (req, res) => {
  try {
    const device = await dbService.getDeviceById(req.params.deviceId);
    if (!device) return res.status(404).json({ error: "Device not found" });
    res.json(device);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new device
router.post("/", async (req, res) => {
  try {
    const device = await dbService.addDevice(req.body);
    res.status(201).json(device);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT update device
router.put("/:deviceId", async (req, res) => {
  try {
    const device = await dbService.updateDevice(req.params.deviceId, req.body);
    if (!device) return res.status(404).json({ error: "Device not found" });
    res.json(device);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
