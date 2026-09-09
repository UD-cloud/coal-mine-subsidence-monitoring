import React, { useEffect, useState } from 'react';
import { connectLiveTelemetry, triggerDemoMode } from '../api';
import MapPanel from './MapPage';

export default function Dashboard() {
  const [telemetry, setTelemetry] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [showFullMap, setShowFullMap] = useState(false);

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

      {/* Main content + sidebar layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Live Node Cards Grid */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <div className="col-span-2 text-center py-12 text-slate-500">
              Waiting for Hardware Simulator WebSocket Stream...
            </div>
          )}
        </div>

        {/* Sidebar: compact live map + notice */}
        <div className="lg:col-span-1 space-y-3">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-3 space-y-2">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-bold text-slate-200">Live Mine Map</h2>
              <span className="text-[10px] text-slate-500">Tap to expand</span>
            </div>
            <div className="rounded-lg overflow-hidden border border-slate-700/60 hover:border-blue-500/60 transition-colors">
              <MapPanel height="220px" compact onExpand={() => setShowFullMap(true)} />
            </div>
          </div>

          {/* Notice box — click importance */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setShowFullMap(true)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setShowFullMap(true)}
            className="group relative overflow-hidden rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-500/15 via-slate-800 to-slate-800 p-3.5 cursor-pointer transition-all hover:border-blue-400/60 hover:from-blue-500/25"
          >
            {/* soft glow accent */}
            <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-blue-500/20 blur-2xl transition-opacity group-hover:opacity-80" />

            <div className="relative flex items-start gap-3">
              <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-blue-500/20 text-base ring-1 ring-blue-400/40 animate-pulse">
                🗺️
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-blue-300">Click the live map to see more</p>
                <p className="mt-0.5 text-xs leading-snug text-slate-400">
                  Get the full India view, every mine's alerts, and district-wise status — all on the full map.
                </p>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-blue-400 group-hover:text-blue-300">
                  View Full Map
                  <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full-screen map modal */}
      {showFullMap && (
        <div
          className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
          onClick={() => setShowFullMap(false)}
        >
          <div
            className="w-full max-w-5xl bg-slate-900 rounded-2xl border border-slate-700 p-4 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-100">Live Mine Map — Full View</h2>
              <button
                onClick={() => setShowFullMap(false)}
                className="bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded text-xs"
              >
                Close ✕
              </button>
            </div>
            <MapPanel height="70vh" />
          </div>
        </div>
      )}
    </div>
  );
}