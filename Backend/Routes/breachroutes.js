// Routes/breachroutes.js
const express = require("express");
const router = express.Router();
const Breach = require("../Schema/Breach.js");

// Get all breaches for a specific device (by deviceId in URL)
router.get("/:deviceId", async (req, res) => {
  try {
    const { deviceId } = req.params; // ← Get from URL path

    const breaches = await Breach.find({ deviceId }).sort({ startTime: -1 });

    res.json({
      deviceId,
      breaches,
    });
  } catch (error) {
    console.error("Error fetching breaches:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get all breaches (with optional filters via query params)
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

module.exports = router;
