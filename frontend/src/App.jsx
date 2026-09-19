import React from "react";
import {Routes,Route} from "react-router-dom";
import {AnimatePresence,motion} from "framer-motion";
import AppLayout from "./layouts/AppLayout";
import Dashboard from "./pages/Dashboard";
import MapPage from "./pages/MapPage";
import AIPage from "./pages/AIPage";
import AlertsPage from "./pages/AlertsPage";
import SensorsPage from "./pages/SensorsPage";
import DeadNodesPage from "./pages/DeadNodesPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";

function Page({children}){return <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:.25}}>{children}</motion.div>}
export default function App(){
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Page><Dashboard/></Page>}/>
        <Route path="/map" element={<Page><MapPage/></Page>}/>
        <Route path="/ai" element={<Page><AIPage/></Page>}/>
        <Route path="/alerts" element={<Page><AlertsPage/></Page>}/>
        <Route path="/sensors" element={<Page><SensorsPage/></Page>}/>
        <Route path="/dead-nodes" element={<Page><DeadNodesPage/></Page>}/>
        <Route path="/reports" element={<Page><ReportsPage/></Page>}/>
        <Route path="/settings" element={<Page><SettingsPage/></Page>}/>
      </Routes>
    </AppLayout>
  );
}