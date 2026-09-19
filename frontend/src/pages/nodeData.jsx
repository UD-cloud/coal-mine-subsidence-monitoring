import { mines } from "./MapPage";

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}


export function generateMineNodes(mine) {
  const rand = mulberry32(mine.seed * 13 + 7);
  const statuses = ["safe", "safe", "warning", "warning", "critical", "critical"];
  for (let i = statuses.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [statuses[i], statuses[j]] = [statuses[j], statuses[i]];
  }

  const offlineIndex = Math.floor(rand() * statuses.length);

  return statuses.map((status, i) => {
    const node_id = `${mine.id}-NODE-${String(i + 1).padStart(2, "0")}`;
    const location = `${mine.name} — Panel ${i + 1}`;

    if (i === offlineIndex) {
      return {
        node_id,
        location,
        mine_id: mine.id,
        mine_name: mine.name,
        offline: true,
        edge_ai: {
          status: "OFFLINE",
          anomaly_risk_score: null,
          ai_confidence_pct: null,
          predicted_subsidence_time_hrs: null,
        },
        sensors: null,
        last_seen_hrs_ago: Math.round(1 + rand() * 11),
      };
    }

    const riskBase = status === "critical" ? 80 : status === "warning" ? 50 : 15;
    const risk = Math.round(riskBase + rand() * 15);
    const confidence = Math.round(80 + rand() * 18);

    return {
      node_id,
      location,
      mine_id: mine.id,
      mine_name: mine.name,
      offline: false,
      edge_ai: {
        status: status.toUpperCase(),
        anomaly_risk_score: risk,
        ai_confidence_pct: confidence,
        predicted_subsidence_time_hrs: status === "critical" ? Math.round(4 + rand() * 20) : null,
      },
      sensors: {
        mpu6050_tilt: {
          pitch_deg: (status === "safe" ? rand() * 1.5 : status === "warning" ? 2 + rand() * 3 : 5 + rand() * 6).toFixed(2),
          roll_deg: (status === "safe" ? rand() * 1.5 : status === "warning" ? 2 + rand() * 3 : 5 + rand() * 6).toFixed(2),
        },
        sw420_vibration: {
          seismic_vib_g: (status === "safe" ? 0.01 + rand() * 0.02 : status === "warning" ? 0.05 + rand() * 0.05 : 0.15 + rand() * 0.15).toFixed(3),
        },
        dwm1000_uwb: {
          relative_displacement_mm: Math.round(status === "safe" ? rand() * 3 : status === "warning" ? 5 + rand() * 10 : 20 + rand() * 30),
        },
        bmp280: {
          settlement_drop_m: (status === "safe" ? rand() * 0.02 : status === "warning" ? 0.05 + rand() * 0.1 : 0.2 + rand() * 0.3).toFixed(3),
        },
      },
    };
  });
}

export function getAllNodes() {
  return mines.flatMap((mine) => generateMineNodes(mine));
}

export function getOfflineNodes() {
  return getAllNodes().filter((n) => n.offline);
}