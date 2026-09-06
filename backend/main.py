import asyncio
import random
import math
import time
from typing import List, Dict, Any
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

app = FastAPI(
    title="Jala Vedha - Smart Mine Subsidence Monitoring Backend & Hardware Simulator",
    description="Simulates low-cost IoT sensor mesh nodes (ESP32/LoRa) and Edge Pi Gateway with AI Anomaly Detection.",
    version="2.0.0"
)

# Enable CORS for React / Vite Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dynamic Nodes Setup (6 Surface Panel Smart Nodes)
NODES = [
    {"id": "NODE-01", "location": "Panel A - West Flank", "lat": 23.5204, "lng": 87.2801, "base_alt": 112.5},
    {"id": "NODE-02", "location": "Panel A - North Center", "lat": 23.5218, "lng": 87.2815, "base_alt": 110.2},
    {"id": "NODE-03", "location": "Panel A - East Flank", "lat": 23.5210, "lng": 87.2830, "base_alt": 115.8},
    {"id": "NODE-04", "location": "Panel B - South Pillar", "lat": 23.5185, "lng": 87.2790, "base_alt": 108.4},
    {"id": "NODE-05", "location": "Panel B - Void Center", "lat": 23.5192, "lng": 87.2820, "base_alt": 105.1},
    {"id": "NODE-06", "location": "Panel B - Roof Zone", "lat": 23.5175, "lng": 87.2845, "base_alt": 114.0},
]

# Global state to keep track of continuous simulation & sensor velocity history
simulation_state = {
    "subsidence_severity": "NORMAL",  # NORMAL, WARNING, CRITICAL, DYNAMIC
    "ticks": 0,
    "last_telemetry": {}  # Stores previous readings for Rate-of-Change (Velocity AI)
}

class AlertMessage(BaseModel):
    node_id: str
    severity: str
    message: str
    timestamp: str

def run_edge_ai_prediction(
    node_id: str, 
    pitch: float, 
    roll: float, 
    vibration: float, 
    displacement: float, 
    alt_drop: float
) -> tuple[str, float, float | None, float]:
    """
    Advanced Edge AI Simulator (Isolation Forest + LSTM Hybrid):
    1. Evaluates absolute sensor bounds.
    2. Calculates Velocity / Rate of Change against last known state.
    3. Computes Dynamic Time-to-Failure (TTF) based on severity.
    4. Calculates Model Confidence metric.
    """
    prev = simulation_state["last_telemetry"].get(node_id, {})
    
    # 1. Rate of Change / Velocity Calculation
    prev_pitch = prev.get("pitch", pitch)
    prev_disp = prev.get("displacement", displacement)
    
    delta_tilt_velocity = abs(pitch - prev_pitch)  # deg per cycle
    delta_disp_velocity = abs(displacement - prev_disp)  # mm per cycle
    
    # Save current values for next cycle
    simulation_state["last_telemetry"][node_id] = {
        "pitch": pitch,
        "displacement": displacement
    }

    # 2. Weighted Feature Scores
    tilt_score = min(1.0, math.sqrt(pitch**2 + roll**2) / 12.0)
    vib_score = min(1.0, vibration / 8.0)
    disp_score = min(1.0, displacement / 25.0)
    velocity_score = min(1.0, (delta_tilt_velocity * 0.4) + (delta_disp_velocity * 0.3))
    
    # Combined Anomaly Score (Weights: Tilt 30%, Vib 20%, Disp 30%, Velocity 20%)
    risk_score = (tilt_score * 0.30) + (vib_score * 0.20) + (disp_score * 0.30) + (velocity_score * 0.20)
    risk_score = round(min(1.0, risk_score), 2)
    
    # 3. Status Evaluation
    if risk_score > 0.68:
        status = "CRITICAL"
    elif risk_score > 0.35:
        status = "WARNING"
    else:
        status = "SAFE"
        
    # 4. Dynamic Time-to-Failure (TTF) Prediction
    if status != "SAFE":
        # Inversely proportional to risk score (Higher risk = Faster predicted collapse)
        predicted_ttf_hrs = round(max(0.2, (1.0 - risk_score) * 7.5), 1)
    else:
        predicted_ttf_hrs = None
        
    # 5. AI Confidence Score
    confidence = round(random.uniform(92.4, 98.9), 1)
        
    return status, risk_score, predicted_ttf_hrs, confidence

def generate_hardware_telemetry(node: Dict[str, Any], sim_mode: str = "NORMAL") -> Dict[str, Any]:
    """
    Simulates raw sensor stack from MPU6050, SW-420, DWM1000 UWB, Strain Gauge, BMP280, & NEO-M8N GPS.
    """
    simulation_state["ticks"] += 1
    t = simulation_state["ticks"]
    
    # Dynamic Hardware Simulation Modes
    if sim_mode == "CRITICAL" or (sim_mode == "DYNAMIC" and t % 15 in [10, 11, 12]):
        pitch = round(random.uniform(5.5, 14.2), 2)
        roll = round(random.uniform(4.0, 11.8), 2)
        vibration = round(random.uniform(4.5, 9.2), 2)
        strain = round(random.uniform(450, 1200), 2)
        displacement = round(random.uniform(12.0, 32.5), 2)
        alt_drop = round(random.uniform(0.8, 2.4), 2)
    elif sim_mode == "WARNING" or (sim_mode == "DYNAMIC" and t % 15 in [7, 8, 9]):
        pitch = round(random.uniform(2.1, 4.8), 2)
        roll = round(random.uniform(1.8, 3.9), 2)
        vibration = round(random.uniform(1.8, 3.8), 2)
        strain = round(random.uniform(180, 420), 2)
        displacement = round(random.uniform(4.0, 11.5), 2)
        alt_drop = round(random.uniform(0.2, 0.7), 2)
    else: # NORMAL
        pitch = round(random.uniform(0.05, 1.2), 2)
        roll = round(random.uniform(0.02, 0.9), 2)
        vibration = round(random.uniform(0.1, 0.8), 2)
        strain = round(random.uniform(15, 95), 2)
        displacement = round(random.uniform(0.1, 2.2), 2)
        alt_drop = round(random.uniform(0.0, 0.15), 2)

    status, risk_score, ttf_hrs, confidence = run_edge_ai_prediction(
        node["id"], pitch, roll, vibration, displacement, alt_drop
    )
    
    return {
        "node_id": node["id"],
        "location": node["location"],
        "timestamp": time.strftime("%H:%M:%S"),
        "gps": {"lat": node["lat"], "lng": node["lng"]},
        "mesh_route": f"{node['id']} -> NODE-02 (Relay) -> Raspberry Pi Gateway",
        "sensors": {
            "mpu6050_tilt": {"pitch_deg": pitch, "roll_deg": roll},
            "sw420_vibration": {"seismic_vib_g": vibration},
            "dwm1000_uwb": {"relative_displacement_mm": displacement},
            "strain_gauge": {"microstrain": strain},
            "bmp280": {"altitude_m": round(node["base_alt"] - alt_drop, 2), "settlement_drop_m": alt_drop},
        },
        "edge_ai": {
            "model_type": "IsolationForest + LSTM Hybrid",
            "status": status,
            "anomaly_risk_score": risk_score,
            "ai_confidence_pct": confidence,
            "predicted_subsidence_time_hrs": ttf_hrs
        }
    }

# Connection Manager for WebSockets
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        await websocket.send_json(message)

manager = ConnectionManager()

@app.get("/")
def read_root():
    return {
        "project": "Jala Vedha - SIH Smart Mine Subsidence Monitoring Platform",
        "system": "Raspberry Pi Edge AI & IoT Mesh Simulator",
        "status": "Online",
        "active_nodes": len(NODES),
        "endpoints": ["/api/nodes", "/api/telemetry", "/api/trigger-simulation", "/ws/live-stream"]
    }

@app.get("/api/nodes")
def get_nodes():
    return {"status": "success", "nodes": NODES}

@app.get("/api/telemetry")
def get_current_telemetry():
    nodes_data = [generate_hardware_telemetry(node, simulation_state["subsidence_severity"]) for node in NODES]
    
    # Calculate Cluster Risk Level across all surface nodes
    critical_count = sum(1 for n in nodes_data if n["edge_ai"]["status"] == "CRITICAL")
    overall_cluster_status = "CRITICAL EVACUATION ALERT" if critical_count >= 2 else "MONITORING"

    return {
        "status": "success",
        "edge_gateway": "Raspberry Pi 4 (Master Edge Node)",
        "mesh_protocol": "LoRaWAN / ESP-NOW Hybrid Mesh",
        "cluster_alert": overall_cluster_status,
        "node_data": nodes_data
    }

@app.post("/api/trigger-simulation")
def trigger_simulation(mode: str):
    mode_upper = mode.upper()
    if mode_upper in ["NORMAL", "WARNING", "CRITICAL", "DYNAMIC"]:
        simulation_state["subsidence_severity"] = mode_upper
        return {"status": "success", "message": f"Hardware simulation mode updated to {mode_upper}"}
    return {"status": "error", "message": "Invalid mode. Choose NORMAL, WARNING, CRITICAL, or DYNAMIC"}

@app.websocket("/ws/live-stream")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            nodes_data = [generate_hardware_telemetry(node, simulation_state["subsidence_severity"]) for node in NODES]
            critical_count = sum(1 for n in nodes_data if n["edge_ai"]["status"] == "CRITICAL")
            
            telemetry_payload = {
                "timestamp": time.strftime("%X"),
                "cluster_alert": "EVACUATION REQUIRED" if critical_count >= 2 else "STABLE MESH",
                "nodes": nodes_data
            }
            await manager.send_personal_message(telemetry_payload, websocket)
            await asyncio.sleep(2.0)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)