import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Playground from "@/pages/Playground";
import Activities from "@/pages/Activities";
import ActivityDetail from "@/pages/ActivityDetail";
import Compare from "@/pages/Compare";
import History from "@/pages/History";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public landing page — no sidebar */}
        <Route path="/" element={<Landing />} />

        {/* App shell with sidebar */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Home />} />
          <Route path="/playground" element={<Playground />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/activities/:slug" element={<ActivityDetail />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/history" element={<History />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
