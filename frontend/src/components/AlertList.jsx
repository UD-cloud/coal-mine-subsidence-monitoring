import React from "react";
import {AlertTriangle,ShieldAlert,Eye} from "lucide-react";
import {alerts} from "../data/mock";
const icons={critical:ShieldAlert,warning:AlertTriangle,watch:Eye};
export default function AlertList({limit=3}){
 return <div className="space-y-2">{alerts.slice(0,limit).map(a=>{const I=icons[a.type]; return <div key={a.id} className="flex gap-3 rounded-xl border border-white/5 bg-white/[.018] p-3 transition hover:bg-white/[.035]"><div className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${a.type==="critical"?"bg-red-400/10 text-red-300":a.type==="warning"?"bg-orange-300/10 text-orange-200":"bg-yellow-300/10 text-yellow-200"}`}><I className="h-4 w-4"/></div><div className="min-w-0 flex-1"><div className="flex justify-between gap-3"><div className="truncate text-xs font-bold text-slate-200">{a.title}</div><span className="shrink-0 text-[9px] text-slate-600">{a.time}</span></div><div className="mt-1 text-[10px] text-slate-500">{a.zone}</div><div className="mt-2 text-[10px] leading-relaxed text-slate-600">{a.detail}</div></div></div>})}</div>
}