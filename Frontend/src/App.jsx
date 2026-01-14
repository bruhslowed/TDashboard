import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./App.css";

function App() {
  const [temperatureData, setTemperatureData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch data
  const fetchTemperature = () => {
    fetch("http://localhost:3000/api/temperature")
      .then((response) => response.json())
      .then((data) => {
        setTemperatureData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  // Fetch data on mount and every 5 seconds
  useEffect(() => {
    fetchTemperature(); // Initial fetch

    const interval = setInterval(() => {
      fetchTemperature();
    }, 5000); // Poll every 5 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  // Format data for the chart
  const chartData = temperatureData.map((item) => ({
    time: new Date(item.timestamp).toLocaleTimeString(),
    temperature: item.temperature,
  }));

  // Get latest reading
  const latestReading = temperatureData[temperatureData.length - 1];

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="App">
      <h1>🌡️ Temperature Dashboard</h1>

      {latestReading && (
        <div
          style={{
            fontSize: "2em",
            margin: "20px",
            padding: "20px",
            backgroundColor: "#1d1111ff",
            borderRadius: "10px",
          }}
        >
          Current Temperature: <strong>{latestReading.temperature}°C</strong>
        </div>
      )}

      <div style={{ width: "100%", height: 400, marginTop: 20 }}>
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis domain={["dataMin - 1", "dataMax + 1"]} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="temperature"
              stroke="#8884d8"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ marginTop: 40 }}>
        <h2>Recent Readings:</h2>
        {temperatureData
          .slice()
          .reverse()
          .map((item, index) => (
            <div key={index} style={{ padding: "5px" }}>
              Temperature: {item.temperature}°C - Time:{" "}
              {new Date(item.timestamp).toLocaleTimeString()}
            </div>
          ))}
      </div>
    </div>
  );
}

export default App;
