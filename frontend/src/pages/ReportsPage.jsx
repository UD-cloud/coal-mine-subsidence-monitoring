import React, { useState } from "react";
import {
  FileText, Download, CalendarDays, ShieldCheck, Eye, ShieldAlert,
  Activity, FileDown, ChevronDown, ChevronUp, WifiOff
} from "lucide-react";
import { getAllNodes } from "./nodeData";
import RiskBadge from "../components/RiskBadge";

export default function ReportsPage() {
  const allNodes = getAllNodes();
  const total = allNodes.length;
  const offlineNodes = allNodes.filter((n) => n.offline);
  const onlineNodes = allNodes.filter((n) => !n.offline);

  const safe = onlineNodes.filter((n) => n.edge_ai.status === "SAFE").length;
  const warning = onlineNodes.filter((n) => n.edge_ai.status === "WARNING").length;
  const critical = onlineNodes.filter((n) => n.edge_ai.status === "CRITICAL").length;
  const offline = offlineNodes.length;

  const avgRisk = onlineNodes.length
    ? (onlineNodes.reduce((sum, n) => sum + n.edge_ai.anomaly_risk_score, 0) / onlineNodes.length).toFixed(1)
    : "0.0";
  const safePercent = onlineNodes.length ? ((safe / onlineNodes.length) * 100).toFixed(0) : "0";
  const highestRiskNode = onlineNodes.length
    ? [...onlineNodes].sort((a, b) => b.edge_ai.anomaly_risk_score - a.edge_ai.anomaly_risk_score)[0]
    : null;
  const trendWord = avgRisk >= 50 ? "elevated" : avgRisk >= 25 ? "moderate" : "low";

  const [range, setRange] = useState("today");
  const [activeBand, setActiveBand] = useState(null);
  const [openReport, setOpenReport] = useState(null);

  const bands = [
    { key: "low", label: "Low (0-25%)", color: "bg-emerald-300", nodes: onlineNodes.filter((n) => n.edge_ai.anomaly_risk_score < 25) },
    { key: "mid", label: "Medium (25-50%)", color: "bg-amber-300", nodes: onlineNodes.filter((n) => n.edge_ai.anomaly_risk_score >= 25 && n.edge_ai.anomaly_risk_score < 50) },
    { key: "high", label: "High (50-75%)", color: "bg-orange-300", nodes: onlineNodes.filter((n) => n.edge_ai.anomaly_risk_score >= 50 && n.edge_ai.anomaly_risk_score < 75) },
    { key: "critical", label: "Critical (75-100%)", color: "bg-rose-400", nodes: onlineNodes.filter((n) => n.edge_ai.anomaly_risk_score >= 75) },
  ];
  const activeBandData = bands.find((b) => b.key === activeBand);

  const summary = [
    ["Total Nodes", total, Activity],
    ["Safe", safe, ShieldCheck],
    ["Warning + Critical", warning + critical, ShieldAlert],
    ["Offline", offline, WifiOff],
  ];

  const avgTilt = onlineNodes.length
    ? (onlineNodes.reduce((s, n) => s + Number(n.sensors.mpu6050_tilt.pitch_deg), 0) / onlineNodes.length).toFixed(2)
    : "0.00";
  const avgDisplacement = onlineNodes.length
    ? (onlineNodes.reduce((s, n) => s + n.sensors.dwm1000_uwb.relative_displacement_mm, 0) / onlineNodes.length).toFixed(2)
    : "0.00";
  const avgSettlement = onlineNodes.length
    ? (onlineNodes.reduce((s, n) => s + Number(n.sensors.bmp280.settlement_drop_m), 0) / onlineNodes.length).toFixed(3)
    : "0.000";

  const reportLog = [
    {
      name: "Daily safety summary",
      date: "30 Aug 2026",
      type: "PDF",
      content: (
        <p className="text-xs leading-relaxed text-slate-400">
          {safePercent}% of monitored nodes are currently reporting SAFE status.
          Average AI risk across the network is {avgRisk}%, considered{" "}
          <span className="font-bold text-slate-200">{trendWord}</span>.
          {highestRiskNode && (
            <> Node <span className="font-bold text-slate-200">{highestRiskNode.node_id}</span> ({highestRiskNode.mine_name}) shows the highest individual risk score at {highestRiskNode.edge_ai.anomaly_risk_score}%.</>
          )}
          {critical > 0 && (
            <> {critical} node{critical > 1 ? "s are" : " is"} currently critical and require immediate attention.</>
          )}
          {offline > 0 && (
            <> {offline} node{offline > 1 ? "s are" : " is"} currently offline with no readings.</>
          )}
        </p>
      ),
    },
    {
      name: "Ground deformation analysis",
      date: "30 Aug 2026",
      type: "PDF",
      content: (
        <div className="grid grid-cols-3 gap-3 text-center text-xs">
          <div>
            <div className="text-[10px] text-slate-500">Avg Tilt</div>
            <div className="text-sm font-bold text-white">{avgTilt}°</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500">Avg Displacement</div>
            <div className="text-sm font-bold text-white">{avgDisplacement} mm</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500">Avg Settlement Drop</div>
            <div className="text-sm font-bold text-white">{avgSettlement} m</div>
          </div>
        </div>
      ),
    },
    {
      name: "Sensor health & network uptime",
      date: "29 Aug 2026",
      type: "CSV",
      content: (
        <div className="grid grid-cols-3 gap-3 text-center text-xs">
          <div>
            <div className="text-[10px] text-slate-500">Nodes online</div>
            <div className="text-sm font-bold text-white">{onlineNodes.length}/{total}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500">Nodes offline</div>
            <div className="text-sm font-bold text-white">{offline}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500">Uptime</div>
            <div className="text-sm font-bold text-white">{((onlineNodes.length / total) * 100).toFixed(1)}%</div>
          </div>
        </div>
      ),
    },
    {
      name: "Weekly AI risk assessment",
      date: "29 Aug 2026",
      type: "PDF",
      content: (
        <p className="text-xs leading-relaxed text-slate-400">
          Network-wide average risk stands at {avgRisk}%. {warning} node
          {warning !== 1 ? "s are" : " is"} in warning state and {critical} in critical state,
          suggesting continued monitoring is required across affected zones this week.
        </p>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Data & Reports</h1>
        <p className="mt-1 text-sm text-slate-500">Historical summaries and export-ready operational reports.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map(([label, value, Icon]) => (
          <div className="glass rounded-2xl p-5" key={label}>
            <Icon className="h-5 w-5 text-emerald-200" />
            <div className="mt-4 text-2xl font-black text-white">{value}</div>
            <div className="mt-1 text-[10px] text-slate-500">{label}</div>
          </div>
        ))}
      </div>

      <div className="glass mt-6 rounded-2xl p-5">
        <div className="mb-1 flex items-center justify-between">
          <div className="text-sm font-bold text-slate-200">Risk Distribution</div>
          <div className="text-[10px] text-slate-500">{onlineNodes.length} online nodes</div>
        </div>
        <p className="mb-4 text-[10px] text-slate-600">Click a band to see its nodes</p>

        <div className="flex h-8 w-full overflow-hidden rounded-lg">
          {bands.map((b) => {
            const pct = onlineNodes.length ? ((b.nodes.length / onlineNodes.length) * 100).toFixed(0) : 0;
            return (
              <button
                key={b.key}
                onClick={() => setActiveBand(activeBand === b.key ? null : b.key)}
                className={`${b.color} ${activeBand && activeBand !== b.key ? "opacity-25" : "opacity-100"} flex items-center justify-center transition-opacity`}
                style={{ width: `${pct}%` }}
                title={`${b.label}: ${b.nodes.length} nodes`}
              >
                {pct >= 12 && <span className="text-[10px] font-black text-slate-950">{pct}%</span>}
              </button>
            );
          })}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {bands.map((b) => {
            const bandAvgRisk = b.nodes.length
              ? (b.nodes.reduce((s, n) => s + n.edge_ai.anomaly_risk_score, 0) / b.nodes.length).toFixed(0)
              : "–";
            const isActive = activeBand === b.key;
            return (
              <button
                key={b.key}
                onClick={() => setActiveBand(activeBand === b.key ? null : b.key)}
                className={`rounded-xl border p-3 text-left transition-colors ${
                  isActive ? "border-white/20 bg-white/[.04]" : "border-white/5 bg-white/[.02] hover:bg-white/[.03]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${b.color}`} />
                  <span className="text-[10px] text-slate-500">{b.label}</span>
                </div>
                <div className="mt-2 flex items-end justify-between">
                  <div className="text-xl font-black text-white">{b.nodes.length}</div>
                  <div className="text-[10px] text-slate-500">avg {bandAvgRisk}%</div>
                </div>
              </button>
            );
          })}
        </div>

        {activeBandData && (
          <div className="mt-4 space-y-1 rounded-xl border border-white/5 bg-white/[.02] p-3">
            {activeBandData.nodes.length === 0 ? (
              <div className="px-2 py-1 text-[10px] text-slate-600">No nodes in this range</div>
            ) : (
              activeBandData.nodes.map((n) => (
                <div key={n.node_id} className="flex items-center justify-between px-2 py-1.5 text-xs">
                  <span className="font-bold text-slate-200">{n.node_id}</span>
                  <span className="flex items-center gap-2">
                    <span className="text-slate-400">{n.edge_ai.anomaly_risk_score}%</span>
                    <RiskBadge status={n.edge_ai.status.toLowerCase()} />
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="glass mt-6 rounded-2xl p-5">
        <div className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-200">
          <FileDown className="h-4 w-4 text-emerald-200" /> Export Center
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {["today", "7d", "30d"].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-lg px-3 py-2 text-xs font-bold ${
                range === r ? "bg-emerald-300/20 text-emerald-200" : "text-slate-400 hover:bg-white/5"
              }`}
            >
              {r === "today" ? "Today" : r === "7d" ? "Last 7 days" : "Last 30 days"}
            </button>
          ))}
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => alert(`Exporting ${range} data as PDF`)}
              className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 hover:bg-white/5"
            >
              <FileText className="h-4 w-4" /> PDF
            </button>
            <button
              onClick={() => alert(`Exporting ${range} data as CSV`)}
              className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 hover:bg-white/5"
            >
              <Download className="h-4 w-4" /> CSV
            </button>
          </div>
        </div>
      </div>

      <div className="glass mt-6 overflow-hidden rounded-2xl">
        <div className="border-b border-white/5 px-5 py-4 text-sm font-bold text-slate-200">Report Log</div>
        {reportLog.map((r) => (
          <div key={r.name} className="border-b border-white/5 last:border-0">
            <button
              onClick={() => setOpenReport(openReport === r.name ? null : r.name)}
              className="flex w-full items-center gap-4 p-5 text-left"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-300/10 text-emerald-200">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold text-slate-200">{r.name}</div>
                <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-600">
                  <CalendarDays className="h-3 w-3" />{r.date} · {r.type}
                </div>
              </div>
              {openReport === r.name ? (
                <ChevronUp className="h-4 w-4 text-slate-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-500" />
              )}
              <span
                onClick={(e) => { e.stopPropagation(); alert(`Downloading: ${r.name}`); }}
                className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-emerald-200"
              >
                <Download className="h-4 w-4" />
              </span>
            </button>
            {openReport === r.name && <div className="px-5 pb-5 pl-[4.25rem]">{r.content}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}