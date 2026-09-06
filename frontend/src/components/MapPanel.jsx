import React,{useState} from "react";
import {motion} from "framer-motion";
import {Crosshair, Layers, ZoomIn, ZoomOut, Maximize2, MapPin} from "lucide-react";
import {nodes} from "../data/mock";
import RiskBadge from "./RiskBadge";

const dot={safe:"bg-emerald-300 shadow-[0_0_16px_rgba(143,240,192,.8)]",watch:"bg-yellow-300 shadow-[0_0_16px_rgba(253,224,71,.7)]",warning:"bg-orange-300 shadow-[0_0_16px_rgba(251,146,60,.8)]",critical:"bg-red-400 shadow-[0_0_18px_rgba(248,113,113,.9)]"};
export default function MapPanel({compact=false}){
 const [selected,setSelected]=useState(nodes[5]);
 return <div className={`glass relative overflow-hidden rounded-2xl ${compact?"h-[460px]":"min-h-[600px]"}`}>
   <div className="absolute inset-0 grid-bg opacity-80"/>
   <div className="absolute inset-[8%] rounded-[40%] border border-emerald-300/5 bg-emerald-300/[.018]"/>
   <div className="absolute left-[15%] top-[20%] h-[55%] w-[70%] rounded-[45%] bg-orange-400/[.025] blur-2xl"/>
   <svg className="absolute inset-[12%] h-[76%] w-[76%] opacity-25"><path d="M0 35 L160 20 L330 85 L500 40 L700 180" fill="none" stroke="currentColor" strokeWidth="1" className="text-emerald-200"/><path d="M40 250 L180 160 L350 300 L520 210 L700 330" fill="none" stroke="currentColor" strokeWidth="1" className="text-emerald-200"/></svg>
   <div className="absolute left-5 top-5 z-10"><div className="text-sm font-bold text-white">Live deformation map</div><div className="mt-1 text-[11px] text-slate-500">Central Coalfield · Panel P-12</div></div>
   <div className="absolute right-4 top-4 z-10 flex gap-1.5"><button className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-black/30 text-slate-400"><Layers className="h-4 w-4"/></button><button className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-black/30 text-slate-400"><Crosshair className="h-4 w-4"/></button><button className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-black/30 text-slate-400"><Maximize2 className="h-4 w-4"/></button></div>
   {nodes.map(n=><button key={n.id} onClick={()=>setSelected(n)} style={{left:`${n.x}%`,top:`${n.y}%`}} className="absolute z-10 -translate-x-1/2 -translate-y-1/2 group">
      {n.status==="critical"&&<span className="absolute -inset-3 rounded-full border border-red-300/30 pulse-ring"/>}
      <span className={`block h-3.5 w-3.5 rounded-full border-2 border-[#07110f] ${dot[n.status]}`}/>
      <span className="pointer-events-none absolute left-1/2 top-5 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-[9px] font-bold text-white opacity-0 transition group-hover:opacity-100">{n.id}</span>
   </button>)}
   <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
     <div className="flex gap-2 rounded-xl border border-white/10 bg-black/40 p-2 backdrop-blur"><div className="flex items-center gap-1.5 px-2 text-[9px] text-slate-400"><span className="h-2 w-2 rounded-full bg-emerald-300"/>Safe</div><div className="flex items-center gap-1.5 px-2 text-[9px] text-slate-400"><span className="h-2 w-2 rounded-full bg-yellow-300"/>Watch</div><div className="flex items-center gap-1.5 px-2 text-[9px] text-slate-400"><span className="h-2 w-2 rounded-full bg-orange-300"/>Warning</div><div className="flex items-center gap-1.5 px-2 text-[9px] text-slate-400"><span className="h-2 w-2 rounded-full bg-red-400"/>Critical</div></div>
     {selected&&<motion.div key={selected.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="w-full rounded-xl border border-white/10 bg-[#07110f]/90 p-3 backdrop-blur-xl sm:w-[260px]">
       <div className="flex items-center justify-between"><div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-emerald-200"/><span className="text-xs font-bold text-white">{selected.id}</span></div><RiskBadge status={selected.status}/></div>
       <div className="mt-3 grid grid-cols-3 gap-2 text-center"><div><div className="text-sm font-bold text-white">{selected.tilt}°</div><div className="text-[9px] text-slate-500">Tilt</div></div><div><div className="text-sm font-bold text-white">{selected.displacement}</div><div className="text-[9px] text-slate-500">mm disp.</div></div><div><div className="text-sm font-bold text-white">{selected.risk}%</div><div className="text-[9px] text-slate-500">AI risk</div></div></div>
     </motion.div>}
   </div>
 </div>
}