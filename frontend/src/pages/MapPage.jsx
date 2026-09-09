import React, { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, Popup, useMap } from "react-leaflet";

const mines = [
  // ===== Chhattisgarh =====
  { id: "M-01", name: "Gevra Mine", district: "Korba, CG", lat: 22.35, lng: 82.57, status: "critical", alert: "Major crack detected — immediate action required" },
  { id: "M-02", name: "Kusmunda Mine", district: "Korba, CG", lat: 22.32, lng: 82.52, status: "warning", alert: "Slow structural drift observed at monitoring point" },
  { id: "M-03", name: "Dipka Opencast Mine", district: "Korba, CG", lat: 22.30, lng: 82.63, status: "warning", alert: "Settlement alert — monitoring intensified" },
  { id: "M-04", name: "Banki Mongra Mine", district: "Korba, CG", lat: 22.41, lng: 82.61, status: "safe", alert: "Sensor data nominal — no changes detected" },
  { id: "M-05", name: "Mand-Raigarh Coalfield", district: "Raigarh, CG", lat: 21.90, lng: 83.40, status: "safe", alert: "Stable condition — zero displacement" },
  { id: "M-06", name: "Bailadila Iron Ore Mine", district: "Dantewada, CG", lat: 18.65, lng: 81.20, status: "warning", alert: "Slope instability flagged on eastern bench" },
  { id: "M-07", name: "Dalli-Rajhara Iron Ore Mine", district: "Balod, CG", lat: 20.58, lng: 81.08, status: "safe", alert: "All parameters within normal range" },
  { id: "M-08", name: "Chirmiri Coalfield", district: "Koriya, CG", lat: 23.20, lng: 82.35, status: "safe", alert: "No anomalies reported" },
  { id: "M-09", name: "Hasdeo Arand Coalfield", district: "Surguja, CG", lat: 22.85, lng: 82.85, status: "warning", alert: "Vegetation & subsidence watch active" },
  { id: "M-10", name: "Bhatgaon Mine", district: "Surguja, CG", lat: 23.02, lng: 83.02, status: "safe", alert: "Sensor data nominal" },
  { id: "M-11", name: "Manikpur Block", district: "Korba, CG", lat: 22.37, lng: 82.68, status: "critical", alert: "Rapid ground displacement — evacuation zone under review" },

  // ===== Rest of India (major mines) =====
  { id: "M-12", name: "Jharia Coalfield", district: "Dhanbad, JH", lat: 23.75, lng: 86.42, status: "critical", alert: "Underground fire zone — long-term subsidence risk" },
  { id: "M-13", name: "Bokaro Coalfield", district: "Bokaro, JH", lat: 23.79, lng: 85.96, status: "safe", alert: "Stable — routine monitoring" },
  { id: "M-14", name: "Noamundi Iron Ore Mine", district: "West Singhbhum, JH", lat: 22.16, lng: 85.53, status: "safe", alert: "No changes detected" },
  { id: "M-15", name: "Joda Iron Ore Mine", district: "Keonjhar, OD", lat: 22.03, lng: 85.53, status: "warning", alert: "Bench crack under observation" },
  { id: "M-16", name: "Sukinda Chromite Mine", district: "Jajpur, OD", lat: 21.00, lng: 85.77, status: "warning", alert: "Slope monitoring intensified" },
  { id: "M-17", name: "Bellary-Hospet Iron Ore Belt", district: "Ballari, KA", lat: 15.14, lng: 76.92, status: "safe", alert: "Stable condition" },
  { id: "M-18", name: "Khetri Copper Mine", district: "Jhunjhunu, RJ", lat: 28.00, lng: 75.78, status: "safe", alert: "Nominal readings" },
  { id: "M-19", name: "Singrauli Coalfield", district: "Singrauli, MP", lat: 24.20, lng: 82.67, status: "critical", alert: "Overburden dump instability reported" },
  { id: "M-20", name: "Raniganj Coalfield", district: "Paschim Bardhaman, WB", lat: 23.62, lng: 87.13, status: "warning", alert: "Legacy fire zone under watch" },
  { id: "M-21", name: "Panandhro Lignite Mine", district: "Kutch, GJ", lat: 23.65, lng: 68.70, status: "safe", alert: "No anomalies reported" },
  { id: "M-22", name: "Goa Iron Ore Belt", district: "North Goa, GA", lat: 15.40, lng: 74.00, status: "safe", alert: "Stable — routine monitoring" },
  { id: "M-23", name: "Singareni Collieries", district: "Kothagudem, TG", lat: 17.55, lng: 80.62, status: "warning", alert: "Water seepage detected in lower seam" },
  { id: "M-24", name: "Visakhapatnam Bauxite Mine", district: "Visakhapatnam, AP", lat: 17.70, lng: 83.30, status: "safe", alert: "Sensor data nominal" },
];

const statusColor = {
  critical: "#f87171",
  warning: "#fbbf24",
  safe: "#34d399",
};

const glowConfig = {
  critical: { radius: 32, opacity: 0.4 },
  warning: { radius: 34, opacity: 0.4 },
  safe: { radius: 16, opacity: 0.12 },
};

function FitToMines({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points.length) {
      map.fitBounds(points, { padding: [40, 40], maxZoom: 8 });
    }
  }, [map, points]);
  return null;
}

/**
 * MapPanel
 * @param {string}  height    - CSS height of the map (e.g. "600px", "220px"). Default "600px".
 * @param {boolean} compact   - When true, renders a lighter-weight preview: no permanent
 *                              labels, no zoom control, no legend, scroll-zoom disabled
 *                              (so it doesn't hijack page scroll inside a small sidebar card).
 * @param {function} onExpand - Optional click handler fired when a compact map is clicked
 *                              (e.g. to open a full-size map in a modal).
 */
export default function MapPanel({ height = "600px", compact = false, onExpand }) {
  const points = mines.map((m) => [m.lat, m.lng]);
  // Bounds now cover all of India (with a little padding) since mines span the whole country
  const bounds = [
    [6.0, 66.0],
    [38.5, 98.0],
  ];

  return (
    <div
      className={`glass overflow-hidden rounded-2xl ${compact && onExpand ? "cursor-pointer" : ""}`}
      onClick={compact && onExpand ? onExpand : undefined}
    >
      <div className="relative">
        <MapContainer
          zoomControl={!compact}
          scrollWheelZoom={!compact}
          dragging={true}
          doubleClickZoom={!compact}
          zoomSnap={0.5}
          minZoom={4.5}
          maxZoom={15}
          maxBounds={bounds}
          maxBoundsViscosity={1.0}
          worldCopyJump={false}
          style={{ height, width: "100%", background: "#0b1220" }}
        >
          <FitToMines points={points} />

          <TileLayer
            className="dark-tiles"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />

          {mines.map((m) => (
            <React.Fragment key={m.id}>
              <CircleMarker
                center={[m.lat, m.lng]}
                radius={compact ? glowConfig[m.status].radius / 2 : glowConfig[m.status].radius}
                pathOptions={{
                  color: "transparent",
                  fillColor: statusColor[m.status],
                  fillOpacity: glowConfig[m.status].opacity,
                  weight: 0,
                }}
                className={`mine-glow mine-glow-${m.status}`}
                interactive={false}
              />

              {!compact && (m.status === "critical" || m.status === "warning") && (
                <CircleMarker
                  center={[m.lat, m.lng]}
                  radius={20}
                  pathOptions={{
                    color: statusColor[m.status],
                    fillColor: "transparent",
                    weight: 1.5,
                    opacity: 0.5,
                  }}
                  className={`mine-glow-ring mine-glow-ring-${m.status}`}
                  interactive={false}
                />
              )}

              <CircleMarker
                center={[m.lat, m.lng]}
                radius={compact ? 5 : 10}
                pathOptions={{
                  color: "#fff",
                  fillColor: statusColor[m.status],
                  fillOpacity: 0.9,
                  weight: compact ? 1 : 2,
                }}
              >
                {!compact && (
                  <Tooltip permanent direction="top" offset={[0, -12]} className={`mine-label mine-label-${m.status}`}>
                    <div className="text-[11px] font-bold">{m.name}</div>
                    {m.status !== "safe" && (
                      <div className="text-[10px] opacity-80 mt-0.5">{m.alert}</div>
                    )}
                  </Tooltip>
                )}
                <Popup>
                  <div className="text-[12px] font-bold">{m.name}</div>
                  <div className="text-[11px] opacity-70">{m.district}</div>
                  <div className="text-[11px] mt-1">{m.alert}</div>
                </Popup>
              </CircleMarker>
            </React.Fragment>
          ))}
        </MapContainer>

        {!compact && (
          <div className="absolute bottom-4 left-4 z-[1000] rounded-xl border border-white/10 bg-slate-950/90 p-3 text-xs backdrop-blur">
            <div className="mb-2 font-bold text-slate-300">Legend</div>
            <div className="flex items-center gap-2 py-0.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: statusColor.critical }} />
              <span className="text-slate-400">Critical</span>
            </div>
            <div className="flex items-center gap-2 py-0.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: statusColor.warning }} />
              <span className="text-slate-400">Warning</span>
            </div>
            <div className="flex items-center gap-2 py-0.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: statusColor.safe }} />
              <span className="text-slate-400">Normal</span>
            </div>
          </div>
        )}

        {compact && (
          <div className="pointer-events-none absolute top-2 right-2 z-[1000] rounded-md border border-white/10 bg-slate-950/80 px-2 py-1 text-[10px] font-semibold text-slate-300 backdrop-blur">
            LIVE
          </div>
        )}
      </div>
    </div>
  );
}