# TDashboard - Docker Deployment Guide

## Quick Start on Raspberry Pi 5

### Prerequisites

- Docker & Docker Compose installed
- Raspberry Pi running 64-bit OS (arm64)

### Run on Pi

```bash
cd /home/pi/TDashboard
docker compose up -d --build
```

### Access the System

- **Frontend:** `http://raspberrypi.local:5173` or `http://<PI_IP>:5173`
- **Backend API:** `http://<PI_IP>:3001`
- **MongoDB:** `mongodb://<PI_IP>:27017/ESP8266_sensor`
- **MQTT Broker:** `mqtt://<PI_IP>:1883`

### Useful Commands

Check container status:

```bash
docker compose ps
```

View logs:

```bash
docker compose logs -f backend      # Backend
docker compose logs -f frontend     # Frontend
docker compose logs -f mosquitto    # MQTT Broker
docker compose logs -f mongo        # Database
```

Rebuild a single service:

```bash
docker compose up -d --build backend
```

Stop everything:

```bash
docker compose down
```

Stop and remove all data (warning: deletes DB):

```bash
docker compose down -v
```

### Architecture

- **MongoDB** (`mongo:27017`) — stores device configs, temperatures, breaches
- **Mosquitto** (`mosquitto:1883`) — MQTT broker for IoT sensors
- **Backend** (`backend:3001`) — Node.js + Express API, connects to MongoDB & MQTT
- **Frontend** (`frontend:80`) — React app served by Nginx, proxies `/api` to backend

All services communicate via Docker network `iot_network`.

### Environment Variables

Set in `docker-compose.yml`:

- `MONGODB_URI` — MongoDB connection (default: `mongodb://mongo:27017/ESP8266_sensor`)
- `MQTT_BROKER` — MQTT broker URL (default: `mqtt://mosquitto:1883`)
- `PORT` — Backend port (default: `3001`)

### Persistence

- **MongoDB data:** `mongo_data` volume
- **MQTT data:** `mosquitto_data` volume
- **MQTT logs:** `mosquitto_log` volume

Data persists across container restarts; use `docker compose down -v` to wipe.

### Troubleshooting

**Backend can't connect to MongoDB:**

```bash
docker compose logs mongo
```

Ensure MongoDB is running and healthy.

**Frontend shows API errors:**
Check that Nginx is routing `/api` to backend correctly. View `Frontend/nginx.conf`.

**MQTT not connecting:**

```bash
docker exec iot_mosquitto mosquitto_sub -h localhost -t 'temperature/data'
```

### Production Notes

- Add `.env` file for sensitive configs (not committed to repo)
- Use reverse proxy (nginx) with TLS for production
- Enable Mosquitto authentication in `mosquitto/config/mosquitto.conf`
- Set up automated MongoDB backups
- Monitor disk space (sensor data can grow large)
