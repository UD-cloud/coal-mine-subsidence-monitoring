import React, { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Polygon,
  Polyline,
  Tooltip,
  Popup,
  useMap,
} from "react-leaflet";
import { AlertTriangle, AlertCircle, CheckCircle2, MapPin, Waves, Ruler } from "lucide-react";

export const mines = [
    { id: "UG-07", name: "Raniganj Underground Colliery", district: "Paschim Bardhaman, WB", mineral: "Coal", lat: 23.6167, lng: 87.1167, status: "safe", alert: "Ventilation and gas readings stable — no anomalies detected", seed: 63 },
  { id: "UG-06", name: "Jharia Underground Colliery", district: "Dhanbad, JH", mineral: "Coal", lat: 23.7398, lng: 86.4147, status: "critical", alert: "Underground fire front advancing toward an active panel — access restricted", seed: 58 },
  { id: "UG-08", name: "Chirmiri Underground Colliery", district: "Koriya, CG", mineral: "Coal", lat: 23.2167, lng: 82.3667, status: "warning", alert: "Methane concentration above threshold in the return airway", seed: 66 },
  { id: "UG-09", name: "Singareni RG-2 Incline", district: "Kothagudem, TG", mineral: "Coal", lat: 17.5500, lng: 80.6167, status: "warning", alert: "Water seepage increasing at the working face — pumping capacity doubled", seed: 71 },
  { id: "UG-10", name: "Moonidih Colliery", district: "Dhanbad, JH", mineral: "Coal", lat: 23.6667, lng: 86.4667, status: "safe", alert: "Roof bolting and gas monitoring within normal range", seed: 47 },
  { id: "UG-11", name: "Pandaveswar Underground Mine", district: "Paschim Bardhaman, WB", mineral: "Coal", lat: 23.6500, lng: 87.2500, status: "warning", alert: "Strata movement detected near an old goaf area — monitoring intensified", seed: 82 },
  { id: "UG-12", name: "Adriyala Longwall Project", district: "Peddapalli, TG", mineral: "Coal", lat: 18.7500, lng: 79.4800, status: "safe", alert: "Longwall face advancing on schedule — no anomalies", seed: 39 },
  { id: "UG-13", name: "Kargali Underground Mine", district: "Bokaro, JH", mineral: "Coal", lat: 23.8000, lng: 85.9500, status: "critical", alert: "Spontaneous heating detected in a sealed-off district — evacuation of nearby panels underway", seed: 91 },
];

const statusColor = { critical: "#f87171", warning: "#fbbf24", safe: "#34d399" };
const statusLabel = { critical: "Critical", warning: "Warning", safe: "Normal" };
const StatusIcon = { critical: AlertTriangle, warning: AlertCircle, safe: CheckCircle2 };

const glowConfig = {
  critical: { radius: 32, opacity: 0.4 },
  warning: { radius: 34, opacity: 0.4 },
  safe: { radius: 16, opacity: 0.12 },
};

const driftPalette = ["#fde047", "#fb923c", "#60a5fa", "#4ade80", "#b91c1c"];
const driftNames = ["Drift 1", "Drift 2", "Drift 3", "Drift 4", "Drift 5"];

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function jitter(rand, lat, lng, maxDeg) {
  return [lat + (rand() - 0.5) * maxDeg, lng + (rand() - 0.5) * maxDeg];
}

function buildSiteDetails(mine) {
  const rand = mulberry32(mine.seed);
  const { lat, lng } = mine;
  const R = 0.013;

  const boundary = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2;
    const r = R * (0.75 + rand() * 0.35);
    return [lat + Math.sin(a) * r, lng + Math.cos(a) * r * 1.15];
  });

  const entrances = [
    { id: `${mine.id}-ent-1`, label: "Main Entrance", pos: jitter(rand, lat, lng, R * 0.5) },
    { id: `${mine.id}-ent-2`, label: "Shaft Entrance", pos: jitter(rand, lat, lng, R * 0.6) },
  ];

  const boreholeCount = 4 + Math.floor(rand() * 3);
  const boreholes = Array.from({ length: boreholeCount }, (_, i) => ({
    id: `${mine.id}-bh-${i + 1}`,
    pos: jitter(rand, lat, lng, R * 0.9),
  }));

  const driftCount = 2 + Math.floor(rand() * 2);
  const idxOrder = [0, 1, 2, 3, 4].sort(() => rand() - 0.5).slice(0, driftCount);
  const drifts = idxOrder.map((idx) => {
    let cur = entrances[idx % 2].pos;
    const path = [cur];
    const segs = 3 + Math.floor(rand() * 3);
    for (let s = 0; s < segs; s++) {
      cur = jitter(rand, cur[0], cur[1], R * 0.35);
      path.push(cur);
    }
    return { id: `${mine.id}-drift-${idx}`, name: driftNames[idx], color: driftPalette[idx], path };
  });
  drifts.unshift(
    (() => {
      let cur = entrances[0].pos;
      const path = [cur];
      for (let s = 0; s < 5; s++) {
        cur = jitter(rand, cur[0], cur[1], R * 0.4);
        path.push(cur);
      }
      return { id: `${mine.id}-drift-main`, name: "New Drift", color: "#94a3b8", path };
    })()
  );

  const wfCenter = jitter(rand, lat, lng, R * 0.3);
  const workingFace = Array.from({ length: 4 }, (_, i) => {
    const a = (i / 4) * Math.PI * 2 + rand();
    const r = R * 0.12;
    return [wfCenter[0] + Math.sin(a) * r, wfCenter[1] + Math.cos(a) * r * 1.4];
  });

  const levelCount = 6 + Math.floor(rand() * 4);
  let lp = jitter(rand, lat, lng, R * 0.8);
  const levelingPoints = [];
  for (let i = 0; i < levelCount; i++) {
    lp = jitter(rand, lp[0], lp[1], R * 0.22);
    levelingPoints.push({ id: `${mine.id}-lp-${i + 1}`, pos: lp });
  }

  let subsidenceBoundary = null;
  if (mine.status !== "safe") {
    const sc = jitter(rand, wfCenter[0], wfCenter[1], R * 0.15);
    subsidenceBoundary = Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2;
      const r = R * 0.22 * (0.8 + rand() * 0.4);
      return [sc[0] + Math.sin(a) * r, sc[1] + Math.cos(a) * r * 1.2];
    });
  }

  return { boundary, entrances, boreholes, drifts, workingFace, levelingPoints, subsidenceBoundary };
}

function FitToMines({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points.length) {
      map.fitBounds(points, { padding: [40, 40], maxZoom: 8 });
    }
  }, [map, points]);
  return null;
}

function FlyTo({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], target.zoom, { duration: 0.9 });
    }
  }, [target, map]);
  return null;
}

export default function MapPanel({ height = "600px", compact = false, onExpand }) {
  const [activeId, setActiveId] = useState(null);
  const [highlightId, setHighlightId] = useState(null);
  const [focus, setFocus] = useState(null);

  const points = mines.map((m) => [m.lat, m.lng]);
  const bounds = [
    [6.0, 66.0],
    [38.5, 98.0],
  ];
  const activeMine = mines.find((m) => m.id === activeId) || null;
  const details = useMemo(() => (activeMine ? buildSiteDetails(activeMine) : null), [activeMine]);

  const selectMine = (m) => {
    setActiveId(m.id);
    setHighlightId(null);
    setFocus({ lat: m.lat, lng: m.lng, zoom: 15 });
  };

  const focusPoint = (id, pos) => {
    setHighlightId((h) => (h === id ? null : id));
    setFocus({ lat: pos[0], lng: pos[1], zoom: 17 });
  };

  return (
    <div className="glass overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60">
      <div className="flex flex-col md:flex-row">
        {/* LEFT: site details for the active mine */}
        {!compact && (
          <div
            className="order-2 w-full shrink-0 overflow-y-auto border-t border-white/10 bg-slate-950/40 p-3 md:order-1 md:w-72 md:border-r md:border-t-0"
            style={{ maxHeight: height }}
          >
            <div className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-500">
              {activeMine ? `${activeMine.name} — site details` : "Site details"}
            </div>

            {!activeMine && (
              <div className="px-1 py-6 text-center text-[11px] leading-relaxed text-slate-500">
                Select a mine from the list to view its entrances, boreholes, drifts and survey points.
              </div>
            )}

            {activeMine && details && (
              <>
                <div className="mb-3 flex items-center gap-2 text-[11px]">
                  {(() => {
                    const Icon = StatusIcon[activeMine.status];
                    return <Icon className="h-3.5 w-3.5" style={{ color: statusColor[activeMine.status] }} />;
                  })()}
                  <span style={{ color: statusColor[activeMine.status] }}>{statusLabel[activeMine.status]}</span>
                  <span className="text-slate-500">· {activeMine.district}</span>
                </div>

                <DetailSection title="Mine entrances">
                  {details.entrances.map((e) => (
                    <DetailRow key={e.id} active={highlightId === e.id} onClick={() => focusPoint(e.id, e.pos)}>
                      <MapPin className="h-3 w-3 text-slate-300" />
                      {e.label}
                    </DetailRow>
                  ))}
                </DetailSection>

                <DetailSection title="Boreholes">
                  {details.boreholes.map((b, i) => (
                    <DetailRow key={b.id} active={highlightId === b.id} onClick={() => focusPoint(b.id, b.pos)}>
                      <span className="h-2 w-2 rounded-full bg-pink-500" />
                      Borehole {i + 1}
                    </DetailRow>
                  ))}
                </DetailSection>

                <DetailSection title="Mine drift">
                  {details.drifts.map((d) => (
                    <DetailRow key={d.id} active={highlightId === d.id} onClick={() => focusPoint(d.id, d.path[0])}>
                      <Waves className="h-3 w-3" style={{ color: d.color }} />
                      {d.name}
                    </DetailRow>
                  ))}
                </DetailSection>

                <DetailSection title="Working face">
                  <DetailRow active={highlightId === "workingface"} onClick={() => focusPoint("workingface", details.workingFace[0])}>
                    <span className="h-2 w-3 rounded-sm bg-pink-400" />
                    Active working face
                  </DetailRow>
                </DetailSection>

                {details.subsidenceBoundary && (
                  <DetailSection title="Subsidence">
                    <DetailRow active={highlightId === "subsidence"} onClick={() => focusPoint("subsidence", details.subsidenceBoundary[0])}>
                      <AlertTriangle className="h-3 w-3" style={{ color: statusColor[activeMine.status] }} />
                      Subsidence area
                    </DetailRow>
                  </DetailSection>
                )}

                <DetailSection title="Leveling points">
                  <div className="flex items-center gap-2 px-2 py-1 text-[11px] text-slate-400">
                    <Ruler className="h-3 w-3 text-emerald-400" />
                    {details.levelingPoints.length} survey points along the monitoring line
                  </div>
                </DetailSection>
              </>
            )}
          </div>
        )}

        {/* CENTER: map */}
        <div
          className={`relative order-1 flex-1 md:order-2 ${compact && onExpand ? "cursor-pointer" : ""}`}
          onClick={compact && onExpand ? onExpand : undefined}
        >
          <MapContainer
            zoomControl={!compact}
            scrollWheelZoom={!compact}
            dragging={true}
            doubleClickZoom={!compact}
            zoomSnap={0.5}
            minZoom={4.5}
            maxZoom={18}
            maxBounds={bounds}
            maxBoundsViscosity={1.0}
            worldCopyJump={false}
            style={{ height, width: "100%", background: "#0b1220" }}
          >
            <FitToMines points={points} />
            <FlyTo target={focus} />

            <TileLayer
              className="dark-tiles"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />

            {mines.map((m) => (
              <React.Fragment key={m.id}>
                <CircleMarker
                  center={[m.lat, m.lng]}
                  radius={compact ? glowConfig[m.status].radius / 2 : glowConfig[m.status].radius}
                  pathOptions={{ color: "transparent", fillColor: statusColor[m.status], fillOpacity: glowConfig[m.status].opacity, weight: 0 }}
                  interactive={false}
                />

                {!compact && (m.status === "critical" || m.status === "warning") && (
                  <CircleMarker
                    center={[m.lat, m.lng]}
                    radius={20}
                    pathOptions={{ color: statusColor[m.status], fillColor: "transparent", weight: 1.5, opacity: 0.5 }}
                    interactive={false}
                  />
                )}

                <CircleMarker
                  center={[m.lat, m.lng]}
                  radius={compact ? 5 : activeId === m.id ? 13 : 10}
                  pathOptions={{
                    color: activeId === m.id ? "#38bdf8" : "#fff",
                    fillColor: statusColor[m.status],
                    fillOpacity: 0.9,
                    weight: compact ? 1 : activeId === m.id ? 3 : 2,
                  }}
                  eventHandlers={{ click: () => selectMine(m) }}
                >
                  {!compact && (
                    <Tooltip permanent direction="top" offset={[0, -12]} className={`mine-label mine-label-${m.status}`}>
                      <div className="text-[11px] font-bold">{m.name}</div>
                      {m.status !== "safe" && <div className="text-[10px] opacity-80 mt-0.5">{m.alert}</div>}
                    </Tooltip>
                  )}
                  <Popup>
                    <div className="text-[12px] font-bold">{m.name}</div>
                    <div className="text-[11px] opacity-70">{m.district} — {m.mineral} (underground)</div>
                    <div className="text-[11px] mt-1">{m.alert}</div>
                  </Popup>
                </CircleMarker>
              </React.Fragment>
            ))}

            {!compact && details && (
              <>
                <Polygon
                  positions={details.boundary}
                  pathOptions={{ color: "#e2e8f0", weight: 1.5, dashArray: "6 4", fillOpacity: 0.03 }}
                />

                {details.subsidenceBoundary && (
                  <Polygon
                    positions={details.subsidenceBoundary}
                    pathOptions={{
                      color: statusColor[activeMine.status],
                      weight: highlightId === "subsidence" ? 2.5 : 1.5,
                      dashArray: activeMine.status === "warning" ? "4 3" : "0",
                      fillColor: statusColor[activeMine.status],
                      fillOpacity: 0.12,
                    }}
                    eventHandlers={{ click: () => focusPoint("subsidence", details.subsidenceBoundary[0]) }}
                  />
                )}

                <Polygon
                  positions={details.workingFace}
                  pathOptions={{
                    color: "#f472b6",
                    weight: highlightId === "workingface" ? 2.5 : 1.5,
                    fillColor: "#f472b6",
                    fillOpacity: 0.18,
                  }}
                  eventHandlers={{ click: () => focusPoint("workingface", details.workingFace[0]) }}
                />

                {details.drifts.map((d) => (
                  <Polyline
                    key={d.id}
                    positions={d.path}
                    pathOptions={{ color: d.color, weight: highlightId === d.id ? 4 : 2.5 }}
                    eventHandlers={{ click: () => focusPoint(d.id, d.path[0]) }}
                  />
                ))}

                {details.levelingPoints.length > 1 && (
                  <Polyline positions={details.levelingPoints.map((p) => p.pos)} pathOptions={{ color: "#4ade80", weight: 1.2, dashArray: "1 4" }} />
                )}
                {details.levelingPoints.map((p) => (
                  <CircleMarker
                    key={p.id}
                    center={p.pos}
                    radius={highlightId === p.id ? 5 : 3}
                    pathOptions={{ color: "#0b1220", fillColor: "#4ade80", fillOpacity: 1, weight: 1 }}
                    eventHandlers={{ click: () => focusPoint(p.id, p.pos) }}
                  />
                ))}

                {details.boreholes.map((b) => (
                  <CircleMarker
                    key={b.id}
                    center={b.pos}
                    radius={highlightId === b.id ? 6 : 4}
                    pathOptions={{ color: "#0b1220", fillColor: "#ec4899", fillOpacity: 1, weight: 1 }}
                    eventHandlers={{ click: () => focusPoint(b.id, b.pos) }}
                  />
                ))}

                {details.entrances.map((e) => (
                  <CircleMarker
                    key={e.id}
                    center={e.pos}
                    radius={highlightId === e.id ? 7 : 5}
                    pathOptions={{ color: "#f8fafc", fillColor: "#0b1220", fillOpacity: 1, weight: 2 }}
                    eventHandlers={{ click: () => focusPoint(e.id, e.pos) }}
                  >
                    <Tooltip direction="top" offset={[0, -6]}>{e.label}</Tooltip>
                  </CircleMarker>
                ))}
              </>
            )}
          </MapContainer>

          {!compact && (
            <div className="absolute bottom-4 left-4 z-[1000] max-h-[85%] overflow-y-auto rounded-xl border border-white/10 bg-slate-950/90 p-3 text-xs backdrop-blur">
              <div className="mb-2 font-bold text-slate-300">Legend</div>
              <div className="flex items-center gap-2 py-0.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: statusColor.critical }} /><span className="text-slate-400">Critical</span></div>
              <div className="flex items-center gap-2 py-0.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: statusColor.warning }} /><span className="text-slate-400">Warning</span></div>
              <div className="flex items-center gap-2 py-0.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: statusColor.safe }} /><span className="text-slate-400">Normal</span></div>

              {details && (
                <>
                  <div className="mt-2 border-t border-white/10 pt-2 font-semibold text-slate-300">Site details</div>
                  <div className="flex items-center gap-2 py-0.5"><span className="inline-block h-2.5 w-4 rounded-sm border border-dashed border-slate-300" /><span className="text-slate-400">Mining boundary</span></div>
                  {details.subsidenceBoundary && (
                    <div className="flex items-center gap-2 py-0.5"><span className="inline-block h-2.5 w-4 rounded-sm border" style={{ borderColor: statusColor[activeMine.status] }} /><span className="text-slate-400">Subsidence area</span></div>
                  )}
                  <div className="flex items-center gap-2 py-0.5"><span className="inline-block h-2.5 w-4 rounded-sm" style={{ background: "#f472b688" }} /><span className="text-slate-400">Working face</span></div>
                  <div className="flex items-center gap-2 py-0.5"><span className="h-2 w-2 rounded-full" style={{ background: "#ec4899" }} /><span className="text-slate-400">Borehole</span></div>
                  <div className="flex items-center gap-2 py-0.5"><span className="h-2 w-2 rounded-full border border-white bg-slate-950" /><span className="text-slate-400">Mine entrance</span></div>
                  <div className="flex items-center gap-2 py-0.5"><span className="h-2 w-2 rounded-full" style={{ background: "#4ade80" }} /><span className="text-slate-400">Leveling point</span></div>
                  <div className="mt-1 font-semibold text-slate-300">Mine drift</div>
                  {details.drifts.map((d) => (
                    <div key={d.id} className="flex items-center gap-2 py-0.5"><span className="h-0.5 w-4" style={{ background: d.color }} /><span className="text-slate-400">{d.name}</span></div>
                  ))}
                </>
              )}
            </div>
          )}

          {compact && (
            <div className="pointer-events-none absolute top-2 right-2 z-[1000] rounded-md border border-white/10 bg-slate-950/80 px-2 py-1 text-[10px] font-semibold text-slate-300 backdrop-blur">
              LIVE
            </div>
          )}
        </div>

        {/* RIGHT: mines list only */}
        {!compact && (
          <div
            className="order-3 w-full shrink-0 overflow-y-auto border-t border-white/10 bg-slate-950/40 p-3 md:w-64 md:border-l md:border-t-0"
            style={{ maxHeight: height }}
          >
            <div className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-500">Underground mines ({mines.length})</div>
            <div className="flex flex-col gap-1">
              {mines.map((m) => {
                const Icon = StatusIcon[m.status];
                const active = activeId === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => selectMine(m)}
                    className={`flex items-start gap-2 rounded-lg px-2 py-2 text-left transition-colors ${active ? "bg-white/10" : "hover:bg-white/5"}`}
                  >
                    <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: statusColor[m.status] }} />
                    <div className="min-w-0">
                      <div className="truncate text-xs font-semibold text-slate-200">{m.name}</div>
                      <div className="text-[10px] text-slate-500">{m.district} · {m.mineral}</div>
                      {m.status !== "safe" && <div className="mt-0.5 text-[10px] leading-snug" style={{ color: statusColor[m.status] }}>{m.alert}</div>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailSection({ title, children }) {
  return (
    <div className="mb-2.5">
      <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">{title}</div>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

function DetailRow({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-[11px] transition-colors ${active ? "bg-white/10 text-slate-100" : "text-slate-400 hover:bg-white/5"}`}
    >
      {children}
    </button>
  );
}