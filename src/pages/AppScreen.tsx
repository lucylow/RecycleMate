import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Scan, User } from "lucide-react";
import ScannerView from "@/components/ScannerView";
import ResultsView from "@/components/ResultsView";
import ProfileView from "@/components/ProfileView";
import OnboardingOverlay from "@/components/OnboardingOverlay";
import type { DetectedItem } from "@/context/UserContext";

type AppView = "scanner" | "results" | "profile";

const AppScreen = () => {
  const [view, setView] = useState<AppView>("scanner");
  const [detections, setDetections] = useState<DetectedItem[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const onboarded = localStorage.getItem("recyclemate_onboarded");
    if (!onboarded) setShowOnboarding(true);
  }, []);

  const handleDetection = (items: DetectedItem[]) => {
    setDetections(items);
    setView("results");
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-background max-w-md mx-auto relative overflow-hidden">
      {/* Onboarding */}
      <AnimatePresence>
        {showOnboarding && (
          <OnboardingOverlay onComplete={() => setShowOnboarding(false)} />
        )}
      </AnimatePresence>

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-semibold text-xs">R</span>
          </div>
          <span className="font-semibold tracking-tight">RecycleMate</span>
        </div>
        <span className="text-label text-muted-foreground">
          {view === "scanner" ? "Scanner" : view === "results" ? "Results" : "Profile"}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-4 pb-20 overflow-hidden">
        <AnimatePresence mode="wait">
          {view === "scanner" && (
            <ScannerView key="scanner" onDetection={handleDetection} />
          )}
          {view === "results" && (
            <ResultsView
              key="results"
              detections={detections}
              onBack={() => setView("scanner")}
            />
          )}
          {view === "profile" && (
            <ProfileView key="profile" onBack={() => setView("scanner")} />
          )}
        </AnimatePresence>
      </div>

      {/* Bottom tab bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border px-6 py-3 flex items-center justify-around">
        {[
          { id: "scanner" as const, icon: Scan, label: "Scan" },
          { id: "profile" as const, icon: User, label: "Profile" },
        ].map((tab) => {
          const active = view === tab.id || (view === "results" && tab.id === "scanner");
          return (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={`flex flex-col items-center gap-1 active-press relative ${active ? "text-primary" : "text-muted-foreground"}`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium tracking-wider uppercase">{tab.label}</span>
              {active && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute -bottom-3 w-8 h-0.5 bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AppScreen;
