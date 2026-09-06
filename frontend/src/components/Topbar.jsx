import React from "react";
import { Bell, Search, Wifi, UserRound, Menu } from "lucide-react";
export default function Topbar({onMenu}){
  return <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-white/5 bg-[#07110f]/80 px-4 backdrop-blur-xl lg:ml-[252px] lg:px-8">
    <div className="flex items-center gap-3"><button onClick={onMenu} className="rounded-lg p-2 text-slate-400 hover:bg-white/5 lg:hidden"><Menu/></button><div className="hidden items-center gap-2 text-xs text-slate-500 sm:flex"><span>Mine</span><span>/</span><span className="text-slate-300">Central Operations</span></div></div>
    <div className="flex items-center gap-2 sm:gap-4">
      <div className="hidden items-center gap-2 rounded-xl border border-white/5 bg-white/[.025] px-3 py-2 text-xs text-slate-500 md:flex"><Search className="h-4 w-4"/> Search nodes, zones...</div>
      <div className="flex items-center gap-2 rounded-xl bg-emerald-300/5 px-3 py-2 text-xs text-emerald-200"><Wifi className="h-4 w-4"/> <span className="hidden sm:inline">Mesh Online</span></div>
      <button className="relative rounded-xl p-2 text-slate-400 hover:bg-white/5"><Bell className="h-5 w-5"/><span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-400"/></button>
      <div className="hidden h-8 w-px bg-white/10 sm:block"/><div className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-300"><UserRound className="h-4 w-4"/></div>
    </div>
  </header>
}