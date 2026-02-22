import { useState, useEffect } from "react";
import axios from "axios";
import { API_URLS } from "./constants/const";
import HomePage from "./components/Homepage";
import DeviceDashboard from "./components/DeviceDashboard";

function App() {
  const [currentView, setCurrentView] = useState("home");
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await axios.get(API_URLS.DEVICES);
      setDevices(response.data);
    } catch (error) {
      console.error("Error fetching devices:", error);
    }
  };

  const openDeviceDashboard = (device) => {
    setSelectedDevice(device);
    setCurrentView("device");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        backgroundColor: "#0f0f0f",
        color: "#fff",
        margin: 0,
        padding: 0,
        boxSizing: "border-box",
      }}
    >
      {currentView === "home" && (
        <HomePage devices={devices} onDeviceClick={openDeviceDashboard} />
      )}
      {currentView === "device" && selectedDevice && (
        <DeviceDashboard
          device={selectedDevice}
          onBack={() => setCurrentView("home")}
        />
      )}
    </div>
  );
}

export default App;
