// services/mqttservice.js
const mqtt = require("mqtt");
const dbService = require("./dbservice");
const Device = require("../Schema/Device.js");
const Breach = require("../Schema/Breach.js");
// MQTT Service to handle incoming temperature data and check for breaches
let client;

module.exports = {
  connect() {
    const mqttBroker = process.env.MQTT_BROKER || "mqtt://mosquitto:1883";
    client = mqtt.connect(mqttBroker);

    client.on("connect", () => {
      console.log("✅ Connected to MQTT broker at:", mqttBroker);
      client.subscribe("temperature/data");
    });

    client.on("error", (err) => {
      console.error("❌ MQTT connection error:", err);
    });

    client.on("message", async (topic, message) => {
      if (topic === "temperature/data") {
        const data = JSON.parse(message.toString());

        // Save temperature
        await dbService.addTemperature(
          data.temperature,
          data.humidity || null,
          new Date(),
          data.deviceId,
        );

        // Check for breach
        await checkThreshold(data.deviceId, data.temperature);
      }
    });
  },

  disconnect() {
    if (client) client.end();
  },
};

async function checkThreshold(deviceId, currentTemp) {
  // Check if the current temperature breaches the device's thresholds
  try {
    const device = await Device.findOne({ deviceId });

    if (!device || !device.thresholdMin || !device.thresholdMax) {
      return; // No thresholds configured
    }

    const isBreached =
      currentTemp < device.thresholdMin || currentTemp > device.thresholdMax;

    if (isBreached) {
      await handleBreach(device, currentTemp); // Handle breach logic (start or update breach)
    } else {
      await handleNormalTemp(device, currentTemp); // Handle logic when temperature returns to normal (end breach if ongoing)
    }
  } catch (error) {
    console.error("Error in checkThreshold:", error);
  }
}

async function handleBreach(device, currentTemp) {
  const now = new Date();

  if (!device.isCurrentlyInBreach) {
    console.log(`⚠️ BREACH STARTED: ${device.name} - ${currentTemp}°C`);

    // DEBUG: Check all values
    console.log("DEBUG - Device data:", {
      deviceId: device.deviceId,
      name: device.name,
      location: device.location,
      thresholdMin: device.thresholdMin,
      thresholdMax: device.thresholdMax,
    });

    console.log("DEBUG - Current temp:", currentTemp);
    console.log("DEBUG - Breach model:", Breach);
    console.log("DEBUG - Breach collection:", Breach.collection.name);

    device.isCurrentlyInBreach = true;
    device.breachStartTime = now;
    await device.save();
    console.log("✅ Device saved");

    const breachType =
      currentTemp > device.thresholdMax ? "too_hot" : "too_cold";

    console.log("DEBUG - Breach type:", breachType);

    const breachData = {
      deviceId: device.deviceId,
      deviceName: device.name,
      location: device.location,
      startTime: now,
      startTemperature: currentTemp,
      peakTemperature: currentTemp,
      thresholdMin: device.thresholdMin,
      thresholdMax: device.thresholdMax,
      breachType: breachType,
      isResolved: false,
    };

    console.log("DEBUG - Breach data to create:", breachData);

    try {
      const breach = new Breach(breachData);
      const result = await breach.save({ writeConcern: { w: 1 } });
      console.log("✅✅✅ BREACH CREATED:", result);
      console.log("Breach saved to DB, ID:", result._id);
    } catch (error) {
      console.error("❌❌❌ BREACH CREATE FAILED:", error);
      console.error("Error details:", error.message);
      console.error("Error stack:", error.stack);
    }
  } else {
    // BREACH ONGOING - Update peak temperature
    const breach = await Breach.findOne({
      deviceId: device.deviceId,
      isResolved: false,
    }).sort({ startTime: -1 });

    if (breach) {
      // Update peak temperature
      const breachType = breach.breachType;
      if (breachType === "too_hot" && currentTemp > breach.peakTemperature) {
        breach.peakTemperature = currentTemp;
        await breach.save();
      } else if (
        breachType === "too_cold" &&
        currentTemp < breach.peakTemperature
      ) {
        breach.peakTemperature = currentTemp;
        await breach.save();
      }

      // Calculate duration
      const durationSeconds = (now - device.breachStartTime) / 1000;

      console.log(
        `🔥 BREACH ONGOING: ${device.name} - ${currentTemp}°C (${Math.floor(durationSeconds)}s)`,
      );
    }
  }
}

async function handleNormalTemp(device, currentTemp) {
  if (device.isCurrentlyInBreach) {
    // BREACH ENDED
    const now = new Date();
    const durationSeconds = (now - device.breachStartTime) / 1000;

    console.log(
      `✅ BREACH ENDED: ${device.name} - Duration: ${Math.floor(durationSeconds)}s`,
    );

    // Update breach document
    const breach = await Breach.findOne({
      deviceId: device.deviceId,
      isResolved: false,
    }).sort({ startTime: -1 });

    if (breach) {
      breach.endTime = now;
      breach.endTemperature = currentTemp;
      breach.duration = durationSeconds;
      breach.isResolved = true;
      await breach.save();
    }

    // Reset device breach state
    device.isCurrentlyInBreach = false;
    device.breachStartTime = null;
    await device.save();
  }
}
