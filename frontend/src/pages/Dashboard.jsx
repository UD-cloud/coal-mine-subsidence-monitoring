import React, { useEffect, useMemo, useRef, useState } from 'react';
import { connectLiveTelemetry, triggerDemoMode } from '../api';
import MapPanel, { mines } from './MapPage';
import { generateMineNodes, getOfflineNodes } from './nodeData';
import { Menu, X, AlertTriangle, AlertCircle, CheckCircle2, WifiOff } from 'lucide-react';

const statusColor = { critical: "#f87171", warning: "#fbbf24", safe: "#34d399" };
const statusLabel = { critical: "Critical", warning: "Warning", safe: "Normal" };
const StatusIcon = { critical: AlertTriangle, warning: AlertCircle, safe: CheckCircle2 };

export default function Dashboard() {
  const [telemetry, setTelemetry] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [showFullMap, setShowFullMap] = useState(false);
  const [selectedMineId, setSelectedMineId] = useState(mines[0].id);
  const [menuOpen, setMenuOpen] = useState(false);
  const [highlightNodeId, setHighlightNodeId] = useState(null);
  const menuRef = useRef(null);

  // Local ticking clock — drives sensor value changes every 2s,
  // independent of whether the WebSocket telemetry is flowing or not.
  const [localTick, setLocalTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLocalTick((t) => t + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

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

  // close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // clear the highlight ring a few seconds after jumping to a node
  useEffect(() => {
    if (!highlightNodeId) return;
    const t = setTimeout(() => setHighlightNodeId(null), 4000);
    return () => clearTimeout(t);
  }, [highlightNodeId]);

  const selectedMine = mines.find((m) => m.id === selectedMineId) || mines[0];

  const mineNodes = useMemo(
    () => generateMineNodes(selectedMine, { tick: localTick, sim_mode: telemetry?.sim_mode }),
    [selectedMine, localTick, telemetry?.sim_mode]
  );

  const offlineNodes = useMemo(
    () => getOfflineNodes({ tick: localTick, sim_mode: telemetry?.sim_mode }),
    [localTick, telemetry?.sim_mode]
  );

  const jumpToNode = (node) => {
    setSelectedMineId(node.mine_id);
    setHighlightNodeId(node.node_id);
    setTimeout(() => {
      document.getElementById(`node-${node.node_id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 60);
  };

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

      {/* Cluster Alert Status + Mine picker menu */}
      <div className="space-y-2">
        {(() => {
          const clusterStyles = {
            critical: {
              box: "bg-red-950/80 text-red-400 border-red-600 animate-pulse",
              text: `EVACUATION REQUIRED`,
            },
            warning: {
              box: "bg-amber-950/60 text-amber-400 border-amber-600",
              text: `ELEVATED RISK`,
            },
            safe: {
              box: "bg-emerald-950/40 text-emerald-400 border-emerald-600",
              text: `STABLE MESH`,
            },
          };
          const style = clusterStyles[selectedMine.status];
          return (
            <div className={`p-4 rounded-xl font-bold text-center border transition-colors ${style.box}`}>
              CLUSTER MESH STATUS: {style.text}
            </div>
          );
        })()}

        {/* hamburger row — click to reveal mine list */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 hover:border-blue-500/60 hover:bg-slate-800/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              {menuOpen ? <X className="h-4 w-4 text-blue-400" /> : <Menu className="h-4 w-4 text-blue-400" />}
              <span className="text-sm font-semibold text-slate-200">Mines</span>
              <span className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="h-2 w-2 rounded-full" style={{ background: statusColor[selectedMine.status] }} />
                {selectedMine.name}
              </span>
            </div>
            <span className="text-[10px] text-slate-500">Tap to switch</span>
          </button>

          {menuOpen && (
            <div className="absolute left-0 right-0 z-30 mt-1.5 max-h-72 overflow-y-auto rounded-xl border border-slate-700 bg-slate-800 shadow-2xl">
              {mines.map((m) => {
                const Icon = StatusIcon[m.status];
                const active = m.id === selectedMineId;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedMineId(m.id);
                      setMenuOpen(false);
                    }}
                    className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors ${
                      active ? "bg-blue-500/10" : "hover:bg-slate-700/50"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-100 truncate">{m.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">{m.district}</div>
                    </div>
                    <div className="flex flex-none items-center gap-1.5 text-[11px] font-semibold" style={{ color: statusColor[m.status] }}>
                      <Icon className="h-3.5 w-3.5" />
                      {statusLabel[m.status]}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main content + sidebar layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Live Node Cards Grid — scoped to selected mine */}
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-slate-300">{selectedMine.name} — Node Telemetry</h2>
            <span className="text-[11px] text-slate-500">{selectedMine.district}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mineNodes.map((node) => (
              <div
                key={node.node_id}
                id={`node-${node.node_id}`}
                className={`bg-slate-800 p-5 rounded-xl border shadow-lg space-y-4 transition-colors ${
                  node.offline
                    ? "border-slate-600/60 opacity-90"
                    : highlightNodeId === node.node_id
                    ? "border-blue-400 ring-2 ring-blue-400/30"
                    : "border-slate-700"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-slate-100">{node.node_id}</h3>
                    <p className="text-xs text-slate-400">{node.location}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    node.offline ? 'bg-slate-600 text-slate-300' :
                    node.edge_ai.status === 'CRITICAL' ? 'bg-red-500 text-white animate-bounce' :
                    node.edge_ai.status === 'WARNING' ? 'bg-amber-500 text-slate-950' :
                    'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {node.offline ? 'OFFLINE' : node.edge_ai.status}
                  </span>
                </div>

                {node.offline ? (
                  /* Offline node — no readings available */
                  <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-600 bg-slate-900/60 py-8 text-center">
                    <WifiOff className="h-6 w-6 text-slate-500" />
                    <p className="text-xs font-semibold text-slate-400">No readings — node unreachable</p>
                    <p className="text-[10px] text-slate-500">Last seen {node.last_seen_hrs_ago}h ago</p>
                  </div>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar: compact live map + offline nodes + notice */}
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