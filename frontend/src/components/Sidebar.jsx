import React, { useMemo } from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Map, BrainCircuit, BellRing, RadioTower, Database, Settings, Activity, ChevronRight, WifiOff } from "lucide-react";
import Logo from "./Logo";
import { getOfflineNodes } from "../pages/nodeData";

const items = [
  ["Dashboard","/",LayoutDashboard],
  ["Live Map","/map",Map],
  ["AI Intelligence","/ai",BrainCircuit],
  ["Alerts","/alerts",BellRing],
  ["Sensor Network","/sensors",RadioTower],
  ["Dead Nodes","/dead-nodes",WifiOff],
  ["Data & Reports","/reports",Database]
];

export default function Sidebar(){
  const offlineCount = useMemo(() => getOfflineNodes().length, []);

  return <aside className="fixed inset-y-0 left-0 z-40 hidden w-[252px] border-r border-white/5 bg-[#07110f]/95 px-4 py-5 lg:block">
    <Logo/>
    <div className="mt-10 px-3 text-[10px] font-bold uppercase tracking-[.25em] text-slate-600">Operations</div>
    <nav className="mt-3 space-y-1">
      {items.map(([label,path,Icon])=><NavLink key={path} to={path} className={({isActive})=>`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${isActive?"bg-emerald-300/10 text-emerald-200":"text-slate-400 hover:bg-white/5 hover:text-white"}`}>
        <Icon className={`h-[18px] w-[18px]`}/>
        <span className="flex-1">{label}</span>
        {label==="Alerts"&&<span className="grid h-5 min-w-5 place-items-center rounded-full bg-red-400/15 px-1 text-[10px] text-red-300">3</span>}
        {label==="Dead Nodes"&&offlineCount>0&&<span className="grid h-5 min-w-5 place-items-center rounded-full bg-red-400/15 px-1 text-[10px] text-red-300">{offlineCount}</span>}
        <ChevronRight className="h-3 w-3 opacity-0 transition group-hover:opacity-50"/>
      </NavLink>)}
    </nav>
    <div className="mt-8 px-3 text-[10px] font-bold uppercase tracking-[.25em] text-slate-600">System</div>
    <NavLink to="/settings" className="mt-3 flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 hover:bg-white/5 hover:text-white"><Settings className="h-[18px] w-[18px]"/>Settings</NavLink>
    <div className="absolute bottom-5 left-4 right-4 rounded-2xl border border-emerald-300/10 bg-emerald-300/[.04] p-4">
      <div className="flex items-center gap-2 text-xs font-semibold text-emerald-200"><span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_#8ff0c0]"/>Network operational</div>
      <div className="mt-2 text-[11px] text-slate-500">Last sync · 18:01:42 IST</div>
    </div>
  </aside>
}