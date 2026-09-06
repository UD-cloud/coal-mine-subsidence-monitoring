# Smart Mine Subsidence Monitoring - Python Backend & IoT Hardware Simulator

This backend service simulates the entire **Hardware Sensor Mesh Network + Edge AI Raspberry Pi Gateway** for your SIH Internal Hackathon presentation and live demo.

---

## 🌟 What This Backend Does:

1. **Hardware Simulation Mode:**
   - Simulates 6 low-cost ESP32 surface nodes transmitting sensor telemetry over LoRa Mesh.
   - Generates realistic real-time readings for:
     - **MPU6050:** Pitch & Roll slope tilt
     - **SW-420:** Micro-seismic vibrations
     - **DWM1000 UWB:** Centimeter displacement tracking
     - **Strain Gauge:** Soil crack expansion
     - **BMP280:** Differential vertical elevation drop
     - **NEO-M8N GPS:** Geo-coordinates

2. **Edge AI Anomaly Engine (Raspberry Pi Simulator):**
   - Processes multi-sensor telemetry using anomaly scoring models.
   - Returns real-time **SAFE**, **WARNING**, or **CRITICAL** risk predictions.

3. **Live WebSockets Stream (`/ws/live-stream`):**
   - Pushes live telemetry directly to your React / Next.js GIS frontend every 2 seconds.

---

## 🚀 How to Run the Backend (For Demo & Presentation):

### Step 1: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 2: Start the FastAPI Server
```bash
python main.py
```
The server will start at: `http://localhost:8000`

---

## 💡 Demo Controls (API Endpoints):

- **Swagger API Docs (Interactive):** `http://localhost:8000/docs`
- **Get Live Nodes Telemetry:** `GET http://localhost:8000/api/telemetry`
- **Simulate Critical Void Failure / Subsidence:**
  - Send POST or test via Swagger to `/api/trigger-simulation?mode=CRITICAL`
  - Send `/api/trigger-simulation?mode=NORMAL` to reset.

