const express = require("express");
const router = express.Router();
const dbService = require("../services/dbservice");

router.use(express.urlencoded({ extended: true })); // ✅ Correct
router.get("/test", (req, res) => {
  console.log("🧪 TEST ROUTE HIT!");
  res.json({ message: "Test route works!" });
});

router.get("/get_temperatures", async (req, res) => {
  try {
    console.log("📥 GET /get_temperatures called");
    console.log("Query params:", req.query);

    const { deviceId, limit } = req.query;

    console.log("Fetching from DB...");
    const data = await dbService.getAllTemperatures(
      deviceId,
      limit ? parseInt(limit) : 50,
    );

    console.log(`✅ Found ${data.length} records`);
    res.json(data);
  } catch (error) {
    console.error("❌ Error in get_temperatures:", error);
    res.status(500).json({ error: error.message });
  }
});
// No add temperature here because it happens directly at backend

module.exports = router;
