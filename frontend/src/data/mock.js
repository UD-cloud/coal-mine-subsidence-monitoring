export const nodes = [
  {id:"SG-021", x:18, y:26, status:"safe", tilt:0.42, displacement:1.8, crack:0.4, vibration:0.18, risk:18},
  {id:"SG-022", x:34, y:22, status:"safe", tilt:0.51, displacement:2.1, crack:0.5, vibration:0.21, risk:23},
  {id:"SG-023", x:51, y:27, status:"watch", tilt:1.22, displacement:3.8, crack:0.9, vibration:0.38, risk:46},
  {id:"SG-024", x:70, y:24, status:"warning", tilt:1.78, displacement:5.9, crack:1.6, vibration:0.61, risk:67},
  {id:"SG-025", x:83, y:38, status:"safe", tilt:0.61, displacement:2.4, crack:0.6, vibration:0.22, risk:26},
  {id:"SG-026", x:65, y:45, status:"critical", tilt:2.41, displacement:8.2, crack:3.1, vibration:0.88, risk:87},
  {id:"SG-027", x:42, y:48, status:"warning", tilt:1.64, displacement:5.1, crack:1.4, vibration:0.57, risk:62},
  {id:"SG-028", x:23, y:55, status:"safe", tilt:0.39, displacement:1.6, crack:0.3, vibration:0.17, risk:16},
  {id:"SG-029", x:76, y:67, status:"critical", tilt:2.18, displacement:7.4, crack:2.6, vibration:0.82, risk:81},
  {id:"SG-030", x:52, y:70, status:"watch", tilt:1.09, displacement:3.2, crack:0.8, vibration:0.35, risk:42},
  {id:"SG-031", x:33, y:76, status:"safe", tilt:0.47, displacement:1.9, crack:0.4, vibration:0.19, risk:20},
  {id:"SG-032", x:86, y:80, status:"warning", tilt:1.73, displacement:5.6, crack:1.5, vibration:0.59, risk:65}
];

export const trend = [
  {time:"10:00", risk:31, tilt:.72, displacement:2.2},
  {time:"10:30", risk:34, tilt:.81, displacement:2.5},
  {time:"11:00", risk:39, tilt:.94, displacement:2.9},
  {time:"11:30", risk:43, tilt:1.08, displacement:3.3},
  {time:"12:00", risk:49, tilt:1.21, displacement:3.8},
  {time:"12:30", risk:56, tilt:1.38, displacement:4.5},
  {time:"13:00", risk:64, tilt:1.59, displacement:5.1},
  {time:"13:30", risk:72, tilt:1.82, displacement:6.2},
  {time:"14:00", risk:78, tilt:2.04, displacement:7.0}
];

export const alerts = [
  {id:1, type:"critical", title:"Rapid deformation detected", zone:"Panel P-12 / Zone 4", time:"2 min ago", detail:"SG-026 and SG-029 show correlated displacement acceleration."},
  {id:2, type:"warning", title:"Crack growth above baseline", zone:"Panel P-12 / Zone 3", time:"8 min ago", detail:"Crack width increased 0.7 mm in the last 30 minutes."},
  {id:3, type:"watch", title:"Tilt trend rising", zone:"Panel P-11 / Zone 7", time:"16 min ago", detail:"Four neighboring nodes crossed the watch threshold."}
];