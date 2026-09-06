import React, { useEffect, useState } from 'react';
import { connectLiveTelemetry, triggerDemoMode } from '../api';

export default function Dashboard() {
  const [telemetry, setTelemetry] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Live Backend WebSocket Connection
    const socket = connectLiveTelemetry(
      (data) => {
        setTelemetry(data);
        setIsConnected(true);
      },
      () => setIsConnected(false)
    );

    return () => socket.close();
  }, []);

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-white space-y-6">
      {/* Top Header Bar */}
      <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl border border-slate-700">
        <div>
          <h1 className="text-2xl font-bold text-blue-400">COSEWARS - Mine Subsidence Monitoring</h1>
          <p className="text-sm text-slate-400">Raspberry Pi Edge AI & IoT Mesh Telemetry</p>
        </div>
        
        {/* Connection Status Badge */}
        <div className="flex items-center gap-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            isConnected ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-red-500/20 text-red-400 border border-red-500/40'
          }`}>
            {isConnected ? '● LIVE MESH STREAM' : '○ DISCONNECTED'}
          </span>

          {/* Demo Mode Triggers for Judges */}
          <div className="flex gap-2">
            <button onClick={() => triggerDemoMode('NORMAL')} className="bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded text-xs">NORMAL</button>
            <button onClick={() => triggerDemoMode('WARNING')} className="bg-amber-600 hover:bg-amber-500 px-3 py-1 rounded text-xs">WARNING</button>
            <button onClick={() => triggerDemoMode('CRITICAL')} className="bg-red-600 hover:bg-red-500 px-3 py-1 rounded text-xs">CRITICAL</button>
          </div>
        </div>
      </div>

      {/* Cluster Alert Status */}
      {telemetry?.cluster_alert && (
        <div className={`p-4 rounded-xl font-bold text-center border ${
          telemetry.cluster_alert.includes("EVACUATION")
            ? "bg-red-950/80 text-red-400 border-red-600 animate-pulse"
            : "bg-slate-800 text-slate-300 border-slate-700"
        }`}>
          CLUSTER MESH STATUS: {telemetry.cluster_alert}
        </div>
      )}

      {/* Live Node Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {telemetry?.nodes ? (
          telemetry.nodes.map((node) => (
            <div key={node.node_id} className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-lg space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-slate-100">{node.node_id}</h3>
                  <p className="text-xs text-slate-400">{node.location}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  node.edge_ai.status === 'CRITICAL' ? 'bg-red-500 text-white animate-bounce' :
                  node.edge_ai.status === 'WARNING' ? 'bg-amber-500 text-slate-950' :
                  'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {node.edge_ai.status}
                </span>
              </div>

              {/* Edge AI Analytics Block */}
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/50 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">AI Risk Score:</span>
                  <span className="font-semibold text-blue-400">{node.edge_ai.anomaly_risk_score}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">AI Confidence:</span>
                  <span className="font-semibold text-emerald-400">{node.edge_ai.ai_confidence_pct}%</span>
                </div>
                {node.edge_ai.predicted_subsidence_time_hrs && (
                  <div className="flex justify-between text-red-400 font-bold">
                    <span>Est. Collapse In:</span>
                    <span>{node.edge_ai.predicted_subsidence_time_hrs} hrs</span>
                  </div>
                )}
              </div>

              {/* Hardware Sensors Stack */}
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                <div className="bg-slate-700/40 p-2 rounded">
                  <div className="text-slate-400">Tilt Pitch/Roll</div>
                  <div>{node.sensors.mpu6050_tilt.pitch_deg}° / {node.sensors.mpu6050_tilt.roll_deg}°</div>
                </div>
                <div className="bg-slate-700/40 p-2 rounded">
                  <div className="text-slate-400">Vibration</div>
                  <div>{node.sensors.sw420_vibration.seismic_vib_g} g</div>
                </div>
                <div className="bg-slate-700/40 p-2 rounded">
                  <div className="text-slate-400">UWB Displacement</div>
                  <div>{node.sensors.dwm1000_uwb.relative_displacement_mm} mm</div>
                </div>
                <div className="bg-slate-700/40 p-2 rounded">
                  <div className="text-slate-400">Settlement Drop</div>
                  <div>{node.sensors.bmp280.settlement_drop_m} m</div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-12 text-slate-500">
            Waiting for Hardware Simulator WebSocket Stream...
          </div>
        )}
      </div>
    </div>
  );
}