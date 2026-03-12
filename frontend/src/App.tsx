import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
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
        {/* Public pages */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected app shell */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Home />} />
            <Route path="/playground" element={<Playground />} />
            <Route path="/activities" element={<Activities />} />
            <Route path="/activities/:slug" element={<ActivityDetail />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/history" element={<History />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
