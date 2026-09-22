const BACKEND_URL = "https://coal-mine-subsidence-monitoring.onrender.com";
const WS_URL = "wss://coal-mine-subsidence-monitoring.onrender.com/ws/live-stream";

// REST Call: Trigger backend demo modes (NORMAL, WARNING, CRITICAL, DYNAMIC)
export const triggerDemoMode = async (mode) => {
  try {
    const res = await fetch(
      `${BACKEND_URL}/api/trigger-simulation?mode=${mode}`,
      {
        method: "POST",
      }
    );

    return await res.json();
  } catch (err) {
    console.error("Failed to trigger simulation mode:", err);
  }
};

// WebSocket Hook for Live Sensors & Edge AI Data
export const connectLiveTelemetry = (onDataReceived, onError) => {
  const socket = new WebSocket(WS_URL);

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onDataReceived(data);
    } catch (e) {
      console.error("JSON Parsing Error:", e);
    }
  };

  socket.onerror = (err) => {
    if (onError) onError(err);
  };

  return socket;
};