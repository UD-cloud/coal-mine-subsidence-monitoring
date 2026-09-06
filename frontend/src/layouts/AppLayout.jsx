import React,{useState} from "react";
import {AnimatePresence,motion} from "framer-motion";
import {X} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Logo from "../components/Logo";
export default function AppLayout({children}){
 const [open,setOpen]=useState(false);
 return <div className="min-h-screen bg-ink text-slate-200 noise">
   <Sidebar/><AnimatePresence>{open&&<motion.div initial={{x:-300}} animate={{x:0}} exit={{x:-300}} className="fixed inset-y-0 left-0 z-50 w-[280px] border-r border-white/10 bg-[#07110f] p-5 lg:hidden"><div className="flex items-center justify-between"><Logo/><button onClick={()=>setOpen(false)} className="text-slate-400"><X/></button></div><div className="mt-8"><Sidebar/></div></motion.div>}</AnimatePresence>
   <Topbar onMenu={()=>setOpen(true)}/>
   <main className="lg:ml-[252px]">{children}</main>
 </div>
}