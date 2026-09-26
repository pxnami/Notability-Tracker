import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { Overview } from "./pages/Overview";
import { Bugs } from "./pages/Bugs";
import { Features } from "./pages/Features";
import { Roadmap } from "./pages/Roadmap";
import { Releases } from "./pages/Releases";
import { ActivityFeed, Community, Settings, Sources } from "./pages/SimplePages";
import "./index.css";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<Overview />} />
            <Route path="/bugs" element={<Bugs />} />
            <Route path="/features" element={<Features />} />
            <Route path="/roadmap" element={<Roadmap />} />
            <Route path="/releases" element={<Releases />} />
            <Route path="/community" element={<Community />} />
            <Route path="/activity" element={<ActivityFeed />} />
            <Route path="/sources" element={<Sources />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </HashRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
