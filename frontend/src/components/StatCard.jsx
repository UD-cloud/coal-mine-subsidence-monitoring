import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion } from "framer-motion";
export default function StatCard({label,value,unit,delta,icon:Icon,negative=false}){
 return <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="glass group rounded-2xl p-5 shadow-glow transition hover:-translate-y-0.5 hover:border-emerald-300/20">
   <div className="flex items-start justify-between"><div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-300/10 text-emerald-200"><Icon className="h-5 w-5"/></div><span className={`flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${negative?"bg-red-400/10 text-red-300":"bg-emerald-300/10 text-emerald-200"}`}>{negative?<ArrowUpRight className="h-3 w-3"/>:<ArrowDownRight className="h-3 w-3"/>}{delta}</span></div>
   <div className="mt-5 text-xs text-slate-500">{label}</div><div className="mt-1 text-2xl font-black tracking-tight text-white">{value} <span className="text-sm font-medium text-slate-500">{unit}</span></div>
 </motion.div>
}