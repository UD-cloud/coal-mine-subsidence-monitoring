import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Search, Wifi, UserRound, Menu, X, WifiOff } from "lucide-react";
import { getAllNodes } from "../pages/nodeData";

export default function Topbar({ onMenu, mines = [], onSelectResult, onAlertsClick }) {
  const navigate = useNavigate();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);

  const allNodes = useMemo(() => getAllNodes(), []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const mineMatches = mines
      .filter((m) => m.id.toLowerCase().includes(q) || m.name.toLowerCase().includes(q))
      .map((m) => ({ type: "mine", mine: m }));

    // "UG-07" type karte hi uske saare nodes match ho jaate hain (node_id prefix match)
    const nodeMatches = allNodes
      .filter((n) => n.node_id.toLowerCase().includes(q) || n.mine_name.toLowerCase().includes(q))
      .map((n) => ({ type: "node", node: n, mine: mines.find((m) => m.id === n.mine_id) }));

    return [...mineMatches, ...nodeMatches].slice(0, 8);
  }, [query, mines, allNodes]);

  const pickResult = (r) => {
    if (r.type === "mine") {
      onSelectResult?.(r.mine);
      setQuery(`${r.mine.id} — ${r.mine.name}`);
      setSelectedNode(null);
    } else {
      onSelectResult?.(r.mine, r.node.node_id);
      setQuery(r.node.node_id);
      setSelectedNode(r.node);
    }
    setShowResults(false);
    setMobileSearchOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && results[0]) pickResult(results[0]);
    if (e.key === "Escape") {
      setShowResults(false);
      setMobileSearchOpen(false);
    }
  };

  const goToAlerts = () => {
    onAlertsClick?.();
    navigate("/alerts");
  };

  const renderResultRow = (r) => (
    <button
      key={r.type === "mine" ? r.mine.id : r.node.node_id}
      onMouseDown={() => pickResult(r)}
      className="flex w-full flex-col items-start px-3 py-2 text-left text-xs hover:bg-white/5"
    >
      {r.type === "mine" ? (
        <>
          <span className="font-semibold text-slate-200">{r.mine.id} — {r.mine.name}</span>
          {r.mine.district && <span className="text-[10px] text-slate-500">{r.mine.district}</span>}
        </>
      ) : (
        <>
          <span className="font-semibold text-slate-200">{r.node.node_id}</span>
          <span className="text-[10px] text-slate-500">
            {r.node.mine_name} · {r.node.offline ? "Offline" : r.node.edge_ai.status}
          </span>
        </>
      )}
    </button>
  );

  return (
    <>
      <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-white/5 bg-[#07110f]/80 px-4 backdrop-blur-xl lg:ml-[252px] lg:px-8">
        <div className={`flex items-center gap-3 ${mobileSearchOpen ? "hidden sm:flex" : "flex"}`}>
          <button onClick={onMenu} className="rounded-lg p-2 text-slate-400 hover:bg-white/5 lg:hidden">
            <Menu />
          </button>
          <div className="hidden items-center gap-2 text-xs text-slate-500 sm:flex">
            <span>Mine</span>
            <span>/</span>
            <span className="text-slate-300">Central Operations</span>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2 sm:gap-4">
          <div className="relative hidden md:block">
            <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[.025] px-3 py-2 text-xs text-slate-500 focus-within:border-emerald-300/30 focus-within:text-slate-300">
              <Search className="h-4 w-4 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setShowResults(true); }}
                onFocus={() => setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 120)}
                onKeyDown={handleKeyDown}
                placeholder="Search nodes, zones..."
                className="w-40 bg-transparent text-xs text-slate-200 placeholder:text-slate-500 outline-none lg:w-56"
              />
            </div>
            {showResults && results.length > 0 && (
              <div className="absolute left-0 top-full z-40 mt-1 w-full overflow-hidden rounded-xl border border-white/10 bg-[#0b1a17] shadow-lg">
                {results.map(renderResultRow)}
              </div>
            )}
          </div>

          <div className="relative flex items-center md:hidden">
            {mobileSearchOpen ? (
              <div className="flex w-full items-center gap-2 rounded-xl border border-emerald-300/20 bg-white/[.04] px-3 py-2 text-xs text-slate-200">
                <Search className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setShowResults(true); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Search nodes, zones..."
                  className="w-full bg-transparent text-xs text-slate-200 placeholder:text-slate-500 outline-none"
                />
                <button onClick={() => setMobileSearchOpen(false)} className="shrink-0 text-slate-500 hover:text-slate-300">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button onClick={() => setMobileSearchOpen(true)} className="rounded-xl p-2 text-slate-400 hover:bg-white/5" aria-label="Search">
                <Search className="h-5 w-5" />
              </button>
            )}
            {mobileSearchOpen && showResults && results.length > 0 && (
              <div className="absolute left-0 top-full z-40 mt-1 w-full overflow-hidden rounded-xl border border-white/10 bg-[#0b1a17] shadow-lg">
                {results.map(renderResultRow)}
              </div>
            )}
          </div>

          {!mobileSearchOpen && (
            <>
              <div className="hidden items-center gap-2 rounded-xl bg-emerald-300/5 px-3 py-2 text-xs text-emerald-200 sm:flex">
                <Wifi className="h-4 w-4" /> <span className="hidden sm:inline">Mesh Online</span>
              </div>

              <button onClick={goToAlerts} className="relative rounded-xl p-2 text-slate-400 hover:bg-white/5" aria-label="View alerts">
                <Bell className="h-5 w-5" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-400" />
              </button>

              <div className="hidden h-8 w-px bg-white/10 sm:block" />
              <div className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-300">
                <UserRound className="h-4 w-4" />
              </div>
            </>
          )}
        </div>
      </header>

      {/* Floating node quick-view — fixed/overlay, never shifts page layout */}
      {selectedNode && (
        <div className="fixed right-4 top-[80px] z-50 w-72 rounded-xl border border-white/10 bg-[#0b1a17] shadow-2xl sm:right-6">
          <div className="flex items-center justify-between border-b border-white/5 px-3 py-2">
            <div className="flex items-center gap-2">
              <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                selectedNode.offline ? "bg-slate-600 text-slate-200" :
                selectedNode.edge_ai.status === "CRITICAL" ? "bg-red-500 text-white" :
                selectedNode.edge_ai.status === "WARNING" ? "bg-amber-500 text-slate-950" :
                "bg-emerald-500/20 text-emerald-300"
              }`}>
                {selectedNode.offline ? "OFFLINE" : selectedNode.edge_ai.status}
              </span>
              <span className="text-xs font-semibold text-slate-200">{selectedNode.node_id}</span>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="rounded-lg p-1 text-slate-500 hover:bg-white/5 hover:text-slate-300"
              aria-label="Close node preview"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-1.5 px-3 py-3 text-xs">
            <div className="text-[10px] text-slate-500">{selectedNode.location}</div>

            {selectedNode.offline ? (
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-dashed border-slate-600 bg-slate-900/60 px-2.5 py-2 text-[11px] text-slate-400">
                <WifiOff className="h-3.5 w-3.5 flex-none text-slate-500" />
                No readings — last seen {selectedNode.last_seen_hrs_ago}h ago
              </div>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                <div className="rounded-lg bg-slate-800/60 px-2 py-1.5">
                  <div className="text-[9px] text-slate-500">Risk</div>
                  <div className="font-semibold text-blue-400">{selectedNode.edge_ai.anomaly_risk_score}</div>
                </div>
                <div className="rounded-lg bg-slate-800/60 px-2 py-1.5">
                  <div className="text-[9px] text-slate-500">Confidence</div>
                  <div className="font-semibold text-emerald-400">{selectedNode.edge_ai.ai_confidence_pct}%</div>
                </div>
                <div className="rounded-lg bg-slate-800/60 px-2 py-1.5">
                  <div className="text-[9px] text-slate-500">Tilt</div>
                  <div className="font-semibold text-slate-300">{selectedNode.sensors.mpu6050_tilt.pitch_deg}° / {selectedNode.sensors.mpu6050_tilt.roll_deg}°</div>
                </div>
                <div className="rounded-lg bg-slate-800/60 px-2 py-1.5">
                  <div className="text-[9px] text-slate-500">Vibration</div>
                  <div className="font-semibold text-slate-300">{selectedNode.sensors.sw420_vibration.seismic_vib_g} g</div>
                </div>
                <div className="rounded-lg bg-slate-800/60 px-2 py-1.5">
                  <div className="text-[9px] text-slate-500">Displacement</div>
                  <div className="font-semibold text-slate-300">{selectedNode.sensors.dwm1000_uwb.relative_displacement_mm} mm</div>
                </div>
                <div className="rounded-lg bg-slate-800/60 px-2 py-1.5">
                  <div className="text-[9px] text-slate-500">Settlement</div>
                  <div className="font-semibold text-slate-300">{selectedNode.sensors.bmp280.settlement_drop_m} m</div>
                </div>
                {selectedNode.edge_ai.predicted_subsidence_time_hrs && (
                  <div className="col-span-2 rounded-lg bg-red-500/10 px-2 py-1.5 text-red-400">
                    <div className="text-[9px] text-red-400/70">Est. collapse in</div>
                    <div className="font-bold">{selectedNode.edge_ai.predicted_subsidence_time_hrs} hrs</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}