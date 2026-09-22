import { mines } from "./MapPage";

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Har node ka apna "baseline tendency" — kaun sa node zyada safe-leaning hai,
// kaun warning ya critical ki taraf — ye SLOWLY badalta hai (har ~30 sec),
// taaki demo mein natural drift dikhe lekin flicker na ho.
function getNodeBaseline(mine, nodeIndex, tick) {
  const slowBucket = Math.floor(tick / 15); // ~30 sec par ek baar hi badlega
  const rand = mulberry32(mine.seed * 101 + nodeIndex * 47 + slowBucket * 977);
  // 0 = pure safe leaning, 1 = pure critical leaning
  return rand();
}

// Fixed offline node per mine — tick pe depend NAHI karta, isliye
// ek baar "kharab" node set hone ke baad tab tak offline rahega
// jab tak forced demo mode active na ho.
function getOfflineIndex(mine) {
  const rand = mulberry32(mine.seed * 991 + 13);
  return Math.floor(rand() * 6);
}

export function generateMineNodes(mine, telemetry) {
  const tick = telemetry?.tick || 0;
  const forcedMode = telemetry?.sim_mode; // "NORMAL" | "WARNING" | "CRITICAL" | "DYNAMIC" | undefined
  const offlineIndex = getOfflineIndex(mine);

  return Array.from({ length: 6 }).map((_, i) => {
    const node_id = `${mine.id}-NODE-${String(i + 1).padStart(2, "0")}`;
    const location = `${mine.name} — Panel ${i + 1}`;

    // Offline node — sirf tab jab koi demo mode force na ho
    if (i === offlineIndex && !forcedMode) {
      // last_seen bhi thoda "grow" karega — jitna zyada waqt guzra utna zyada ghante
      const rand = mulberry32(mine.seed * 991 + 13 + i);
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
        last_seen_hrs_ago: Math.round(1 + rand() * 5 + tick / 30),
      };
    }

    // ---- Baseline tendency (slow) + live jitter (fast, har tick) ----
    const valueRand = mulberry32(mine.seed * 31 + i * 113 + 11 + tick * 53);

    let baseline;
    if (forcedMode === "CRITICAL") baseline = 0.85;
    else if (forcedMode === "WARNING") baseline = 0.5;
    else if (forcedMode === "NORMAL") baseline = 0.1;
    else baseline = getNodeBaseline(mine, i, tick); // natural drift

    // Baseline ke aas-paas chhota jitter — taaki har tick alag reading aaye
    // lekin status abrupt na palte
    const jitter = (valueRand() - 0.5) * 0.25;
    const score = Math.min(1, Math.max(0, baseline + jitter)); // 0..1 combined risk

    // ---- Status ab SCORE se derive ho raha hai (values -> status) ----
    let status;
    if (score > 0.68) status = "CRITICAL";
    else if (score > 0.35) status = "WARNING";
    else status = "SAFE";

    // ---- Sensor readings bhi usi score se scale hoti hain — consistent rehta hai ----
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