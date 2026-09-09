import React, { useState } from "react";
import {
  FileText, Download, CalendarDays, ShieldCheck, Eye, ShieldAlert,
  Activity, FileDown, ChevronDown, ChevronUp
} from "lucide-react";
import { nodes } from "../data/mock";
import RiskBadge from "../components/RiskBadge";

export default function ReportsPage() {
  const total = nodes.length;
  const safe = nodes.filter(n => n.status === "safe").length;
  const watch = nodes.filter(n => n.status === "watch").length;
  const warning = nodes.filter(n => n.status === "warning").length;
  const critical = nodes.filter(n => n.status === "critical").length;
  const avgRisk = (nodes.reduce((sum, n) => sum + n.risk, 0) / total).toFixed(1);
  const safePercent = ((safe / total) * 100).toFixed(0);
  const highestRiskNode = [...nodes].sort((a, b) => b.risk - a.risk)[0];
  const trendWord = avgRisk >= 50 ? "elevated" : avgRisk >= 25 ? "moderate" : "low";

  const [range, setRange] = useState("today");
  const [activeBand, setActiveBand] = useState(null);
  const [openReport, setOpenReport] = useState(null);

  const bands = [
    { key: "low", label: "Low (0-25%)", color: "bg-emerald-300", nodes: nodes.filter(n => n.risk < 25) },
    { key: "mid", label: "Medium (25-50%)", color: "bg-amber-300", nodes: nodes.filter(n => n.risk >= 25 && n.risk < 50) },
    { key: "high", label: "High (50-75%)", color: "bg-orange-300", nodes: nodes.filter(n => n.risk >= 50 && n.risk < 75) },
    { key: "critical", label: "Critical (75-100%)", color: "bg-rose-400", nodes: nodes.filter(n => n.risk >= 75) },
  ];
  const activeBandData = bands.find(b => b.key === activeBand);

  const summary = [
    ["Total Nodes", total, Activity],
    ["Safe", safe, ShieldCheck],
    ["Watch", watch, Eye],
    ["Warning + Critical", warning + critical, ShieldAlert],
  ];

  const reportLog = [
    {
      name: "Daily safety summary",
      date: "30 Aug 2026",
      type: "PDF",
      content: (
        <p className="text-xs leading-relaxed text-slate-400">
          {safePercent}% of monitored nodes are currently reporting SAFE status.
          Average AI risk across the network is {avgRisk}%, considered{" "}
          <span className="font-bold text-slate-200">{trendWord}</span>. Node{" "}
          <span className="font-bold text-slate-200">{highestRiskNode.id}</span> shows the
          highest individual risk score at {highestRiskNode.risk}%.
          {critical > 0 && (
            <> {critical} node{critical > 1 ? "s are" : " is"} currently critical and require immediate attention.</>
          )}
        </p>
      ),
    },
    {
      name: "Panel P-12 deformation analysis",
      date: "30 Aug 2026",
      type: "PDF",
      content: (
        <div className="grid grid-cols-3 gap-3 text-center text-xs">
          <div>
            <div className="text-[10px] text-slate-500">Avg Tilt</div>
            <div className="text-sm font-bold text-white">
              {(nodes.reduce((s, n) => s + n.tilt, 0) / total).toFixed(2)}°
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500">Avg Displacement</div>
            <div className="text-sm font-bold text-white">
              {(nodes.reduce((s, n) => s + n.displacement, 0) / total).toFixed(2)} mm
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500">Avg Crack Width</div>
            <div className="text-sm font-bold text-white">
              {(nodes.reduce((s, n) => s + n.crack, 0) / total).toFixed(2)} mm
            </div>
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
            <div className="text-[10px] text-slate-500">Packet delivery</div>
            <div className="text-sm font-bold text-white">98.9%</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500">Avg battery</div>
            <div className="text-sm font-bold text-white">86%</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500">Nodes online</div>
            <div className="text-sm font-bold text-white">{total}/{total}</div>
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
          Network-wide average risk stands at {avgRisk}%. {watch} node
          {watch !== 1 ? "s are" : " is"} in watch state and {warning} in warning state,
          suggesting continued monitoring is required across affected zones this week.
        </p>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Data & Reports</h1>
        <p className="mt-1 text-sm text-slate-500">
          Historical summaries and export-ready operational reports.
        </p>
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
          <div className="text-[10px] text-slate-500">{total} nodes total</div>
        </div>
        <p className="mb-4 text-[10px] text-slate-600">Click a band to see its nodes</p>

        <div className="flex h-8 w-full overflow-hidden rounded-lg">
          {bands.map(b => {
            const pct = ((b.nodes.length / total) * 100).toFixed(0);
            return (
              <button
                key={b.key}
                onClick={() => setActiveBand(activeBand === b.key ? null : b.key)}
                className={`${b.color} ${activeBand && activeBand !== b.key ? "opacity-25" : "opacity-100"} flex items-center justify-center transition-opacity`}
                style={{ width: `${pct}%` }}
                title={`${b.label}: ${b.nodes.length} nodes`}
              >
                {pct >= 12 && (
                  <span className="text-[10px] font-black text-slate-950">{pct}%</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {bands.map(b => {
            const bandAvgRisk = b.nodes.length
              ? (b.nodes.reduce((s, n) => s + n.risk, 0) / b.nodes.length).toFixed(0)
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
              activeBandData.nodes.map(n => (
                <div key={n.id} className="flex items-center justify-between px-2 py-1.5 text-xs">
                  <span className="font-bold text-slate-200">{n.id}</span>
                  <span className="flex items-center gap-2">
                    <span className="text-slate-400">{n.risk}%</span>
                    <RiskBadge status={n.status} />
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
          {["today", "7d", "30d"].map(r => (
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
        <div className="border-b border-white/5 px-5 py-4 text-sm font-bold text-slate-200">
          Report Log
        </div>
        {reportLog.map(r => (
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
                onClick={e => { e.stopPropagation(); alert(`Downloading: ${r.name}`); }}
                className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-emerald-200"
              >
                <Download className="h-4 w-4" />
              </span>
            </button>
            {openReport === r.name && (
              <div className="px-5 pb-5 pl-[4.25rem]">{r.content}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}