import { mines } from "./MapPage";

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// String se stable numeric hash — mine.seed pe depend nahi karta,
// isliye har mine (mine.id ke through) guaranteed unique aur alag hoga,
// chahe MapPage.jsx mein seed field kuch bhi ho / duplicate ho.
function hashStr(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mineHash(mine) {
  return hashStr(String(mine.id));
}

function getNodeBaseline(mine, nodeIndex, tick) {
  const slowBucket = Math.floor(tick / 15);
  const seed = mineHash(mine) * 101 + nodeIndex * 977 + slowBucket * 7919;
  const rand = mulberry32(seed);
  const raw = rand();

  const bands = {
    safe:     [0.00, 0.40],
    warning:  [0.28, 0.72],
    critical: [0.55, 0.95],
  };
  const [lo, hi] = bands[mine.status] || [0, 1];

  return lo + raw * (hi - lo);
}

function getOfflineIndex(mine) {
  const rand = mulberry32(mineHash(mine) * 991 + 13);
  return Math.floor(rand() * 6);
}

export function generateMineNodes(mine, telemetry) {
  const tick = telemetry?.tick || 0;
  const forcedMode = telemetry?.sim_mode; // "NORMAL" | "WARNING" | "CRITICAL" | "DYNAMIC" | undefined
  // Only an EXPLICIT demo override (NORMAL/WARNING/CRITICAL button) should
  // force every node online. "DYNAMIC" (AUTO / natural mode) and no mode at
  // all (undefined, before the WS connects) must both still allow the fixed
  // offline node to show — DYNAMIC is not the same as "no override".
  const isExplicitOverride =
    forcedMode === "NORMAL" || forcedMode === "WARNING" || forcedMode === "CRITICAL";
  const offlineIndex = getOfflineIndex(mine);
  const mh = mineHash(mine);

  return Array.from({ length: 6 }).map((_, i) => {
    const node_id = `${mine.id}-NODE-${String(i + 1).padStart(2, "0")}`;
    const location = `${mine.name} — Panel ${i + 1}`;

    // Offline node — sirf tab jab koi EXPLICIT demo mode force na ho
    if (i === offlineIndex && !isExplicitOverride) {
      const rand = mulberry32(mh * 991 + 13 + i);
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
        // tick-independent — fixed once per mine/node, kabhi nahi badlega
        last_seen_hrs_ago: Math.round(1 + rand() * 5),
      };
    }

    // ---- Baseline tendency (slow, unique per mine+node) + live jitter (fast, har tick) ----
    const valueRand = mulberry32(mh * 31 + i * 113 + 11 + tick * 53);

    let baseline;
    if (forcedMode === "CRITICAL") baseline = 0.85;
    else if (forcedMode === "WARNING") baseline = 0.5;
    else if (forcedMode === "NORMAL") baseline = 0.1;
    else baseline = getNodeBaseline(mine, i, tick); // natural per-mine, per-node drift

    const jitter = (valueRand() - 0.5) * 0.25;
    const score = Math.min(1, Math.max(0, baseline + jitter));

    let status;
    if (score > 0.68) status = "CRITICAL";
    else if (score > 0.35) status = "WARNING";
    else status = "SAFE";

    const pitch = (score * 12 * valueRand() + score * 3).toFixed(2);
    const roll = (score * 10 * valueRand() + score * 2.5).toFixed(2);
    const vibration = (0.05 + score * 8 * valueRand()).toFixed(3);
    const displacement = Math.round(score * 30 * (0.4 + valueRand() * 0.6));
    const settlement = (score * 0.35 * (0.4 + valueRand() * 0.6)).toFixed(3);

    const risk = Math.round(score * 100);
    const confidence = Math.round(80 + valueRand() * 18);
    const ttf = status === "CRITICAL" ? Math.round(1 + (1 - score) * 15) : null;

    return {
      node_id,
      location,
      mine_id: mine.id,
      mine_name: mine.name,
      offline: false,
      edge_ai: {
        status,
        anomaly_risk_score: risk,
        ai_confidence_pct: confidence,
        predicted_subsidence_time_hrs: ttf,
      },
      sensors: {
        mpu6050_tilt: { pitch_deg: pitch, roll_deg: roll },
        sw420_vibration: { seismic_vib_g: vibration },
        dwm1000_uwb: { relative_displacement_mm: displacement },
        bmp280: { settlement_drop_m: settlement },
      },
    };
  });
}

export function getAllNodes(telemetry) {
  return mines.flatMap((mine) => generateMineNodes(mine, telemetry));
}

export function getOfflineNodes(telemetry) {
  return getAllNodes(telemetry).filter((n) => n.offline);
}