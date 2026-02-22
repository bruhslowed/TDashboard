const express = require("express");
const router = express.Router();
const Breach = require("../Schema/Breach.js");

// Get all breaches for a device
router.get("/", async (req, res) => {
  try {
    const { deviceId, startDate, endDate } = req.query;

    let query = {};

    if (deviceId) {
      query.deviceId = deviceId;
    }

    if (startDate && endDate) {
      query.startTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const breaches = await Breach.find(query).sort({ startTime: -1 });
    res.json(breaches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get ongoing breaches
router.get("/ongoing", async (req, res) => {
  try {
    const breaches = await Breach.find({ isResolved: false });
    res.json(breaches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
