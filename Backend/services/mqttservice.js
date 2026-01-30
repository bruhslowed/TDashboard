const mqtt = require("mqtt");
const dbService = require("../services/dbservice");
const { message } = require("statuses");

class mqttHandler {
  constructor() {
    this.client = null;
  }
  connect(brokerUrl = "mqtt://localhost:1883") {
    this.client = mqtt.connect(brokerUrl);
    this.client.on("connect", () => {
      console.log("Connected to MQTT Broker");
      this.subscribe();
    });

    this.client.on("error", (err) => {
      console.error("MQTT error", err);
    });
    this.client.on("message", async (topic, message) => {
      await this.handleMessage(topic, message);
    });
  }
  subscribe() {
    this.client.subscribe("temperature/data", (err) => {
      if (err) {
        console.error("failed to subscribe", err);
      } else {
        console.log("Subscribed to sensor_temperature");
      }
    });
  }
  async handleMessage(topic, message) {
    try {
      const data = JSON.parse(message.toString());
      console.log(parseFloat(data.temperature));
      await dbService.addTemperature(
        parseFloat(data.temperature),
        Date.now(),
        data.deviceId,
      );
    } catch (error) {
      console.error("failed to send data to dbservice later", error);
    }
  }
  disconnect() {
    if (this.client) {
      this.client.end();
      console.log("Disconnected from MQTT Broker");
    }
  }
}

module.exports = new mqttHandler();
