import React, { useEffect, useMemo, useState } from "react";
import { WifiOff, AlertTriangle, MapPin, Clock } from "lucide-react";
import { connectLiveTelemetry } from "../api";
import { getOfflineNodes } from "./nodeData";

function formatOfflineSince(hrsAgo) {
  const offlineAt = new Date(Date.now() - hrsAgo * 60 * 60 * 1000);
  const time = offlineAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const date = offlineAt.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  return { time, date };
}

export default function DeadNodesPage() {
  const [telemetry, setTelemetry] = useState(null);

  // Subscribe to the same live WebSocket the Dashboard uses, so this page
  // stays in sync with the AUTO/NORMAL/WARNING/CRITICAL demo mode buttons —
  // e.g. when a judge forces WARNING/CRITICAL, all nodes go online and this
  // list should empty out, matching what the Dashboard shows.
  useEffect(() => {
    const socket = connectLiveTelemetry(
      (data) => setTelemetry(data),
      () => {}
    );
    return () => socket.close();
  }, []);

  const offlineNodes = useMemo(
    () => getOfflineNodes({ sim_mode: telemetry?.sim_mode }),
    [telemetry?.sim_mode]
  );

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-white space-y-6">
      <div className="flex items-center justify-between bg-slate-800 p-4 rounded-xl border border-slate-700">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-red-300">
            <WifiOff className="h-6 w-6" /> Dead Nodes
          </h1>
          <p className="text-sm text-slate-400">Nodes not reporting sensor data — signal lost or hardware fault</p>
        </div>
        <span className="grid h-10 min-w-10 place-items-center rounded-full bg-red-500/15 px-3 text-lg font-bold text-red-300">
          {offlineNodes.length}
        </span>
      </div>

      {offlineNodes.length === 0 ? (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center text-sm text-emerald-300">
          All nodes are online and reporting normally.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {offlineNodes.map((n) => {
            const { time, date } = formatOfflineSince(n.last_seen_hrs_ago);
            return (
              <div
                key={n.node_id}
                className="space-y-3 rounded-xl border border-slate-700 bg-slate-800 p-5 shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-100">{n.node_id}</h3>
                    <p className="flex items-center gap-1 text-xs text-slate-400">
                      <MapPin className="h-3 w-3" /> {n.location}
                    </p>
                  </div>
                  <span className="rounded bg-slate-600 px-2 py-1 text-xs font-bold text-slate-200">OFFLINE</span>
                </div>

                <div className="flex items-center gap-2 rounded-lg border border-dashed border-slate-600 bg-slate-900/60 px-3 py-2 text-xs text-slate-400">
                  <AlertTriangle className="h-4 w-4 flex-none text-slate-500" />
                  No readings available — signal lost {n.last_seen_hrs_ago}h ago
                </div>

                <div className="flex items-center justify-between rounded-lg bg-slate-900/40 px-3 py-2 text-[11px]">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Clock className="h-3 w-3" /> Went offline
                  </span>
                  <span className="font-semibold text-red-300">{date}, {time}</span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{n.mine_name}</span>
                  <span>Node ID: {n.node_id}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}