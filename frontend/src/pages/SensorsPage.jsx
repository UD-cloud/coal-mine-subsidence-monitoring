import React from "react";
import { RadioTower, Battery, Signal, Cpu, WifiOff } from "lucide-react";
import { getAllNodes } from "./nodeData";
import RiskBadge from "../components/RiskBadge";

export default function SensorsPage() {
  const nodes = getAllNodes();
  const total = nodes.length;
  const offline = nodes.filter((n) => n.offline).length;
  const online = total - offline;
  const onlineNodes = nodes.filter((n) => !n.offline);
  const avgConfidence = onlineNodes.length
    ? Math.round(onlineNodes.reduce((s, n) => s + n.edge_ai.ai_confidence_pct, 0) / onlineNodes.length)
    : 0;
  const mineCount = new Set(nodes.map((n) => n.mine_id)).size;

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Sensor Network</h1>
        <p className="mt-1 text-sm text-slate-500">Health, telemetry and AI risk state of deployed nodes.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [`${online}/${total}`, "Nodes online", RadioTower],
          [`${offline}`, "Nodes offline", WifiOff],
          [`${avgConfidence}%`, "Avg. AI confidence", Signal],
          [`${mineCount}`, "Mines monitored", Cpu],
        ].map(([v, l, I]) => (
          <div className="glass rounded-2xl p-5" key={l}>
            <I className="h-5 w-5 text-emerald-200" />
            <div className="mt-4 text-2xl font-black text-white">{v}</div>
            <div className="mt-1 text-[10px] text-slate-500">{l}</div>
          </div>
        ))}
      </div>

      <div className="glass mt-4 overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
            <thead className="border-b border-white/5 bg-white/[.02] text-[9px] uppercase tracking-wider text-slate-600">
              <tr>
                <th className="px-5 py-4">Node</th>
                <th>Mine</th>
                <th>Risk</th>
                <th>Tilt</th>
                <th>Displacement</th>
                <th>Vibration</th>
                <th>State</th>
              </tr>
            </thead>
            <tbody>
              {nodes.map((n) => (
                <tr className="border-b border-white/5 text-xs hover:bg-white/[.018]" key={n.node_id}>
                  <td className="px-5 py-4 font-bold text-slate-200">{n.node_id}</td>
                  <td className="text-slate-400">{n.mine_name}</td>
                  {n.offline ? (
                    <>
                      <td className="text-slate-600">—</td>
                      <td className="text-slate-600">—</td>
                      <td className="text-slate-600">—</td>
                      <td className="text-slate-600">—</td>
                    </>
                  ) : (
                    <>
                      <td>{n.edge_ai.anomaly_risk_score}%</td>
                      <td>{n.sensors.mpu6050_tilt.pitch_deg}°</td>
                      <td>{n.sensors.dwm1000_uwb.relative_displacement_mm} mm</td>
                      <td>{n.sensors.sw420_vibration.seismic_vib_g} g</td>
                    </>
                  )}
                  <td>
                    <RiskBadge status={n.offline ? "offline" : n.edge_ai.status.toLowerCase()} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}