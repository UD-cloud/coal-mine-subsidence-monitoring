import React from "react";
import { ShieldCheck } from "lucide-react";
export default function Logo(){
  return <div className="flex items-center gap-3">
    <div className="relative grid h-10 w-10 place-items-center rounded-xl border border-emerald-300/20 bg-emerald-300/10">
      <ShieldCheck className="h-5 w-5 text-emerald-200"/>
      <span className="absolute inset-0 rounded-xl border border-emerald-200/10 pulse-ring"/>
    </div>
    <div><div className="font-black tracking-tight text-white"> <span className="text-emerald-300">COSEWARS</span></div><div className="text-[9px] font-semibold uppercase tracking-[.28em] text-slate-500">Mine Safety Intelligence</div></div>
  </div>
}