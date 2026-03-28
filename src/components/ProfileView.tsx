import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Clock, Leaf } from "lucide-react";
import { useUser } from "@/context/UserContext";
import EcoAvatar from "@/components/EcoAvatar";
import { getDailyNudge } from "@/services/featherless";
import StatsRow from "@/components/profile/StatsRow";
import LevelProgress from "@/components/profile/LevelProgress";
import BadgeGrid from "@/components/profile/BadgeGrid";
import DailyChallengeCard from "@/components/profile/DailyChallengeCard";
import StreakShield from "@/components/profile/StreakShield";
import StreakCalendar from "@/components/gamification/StreakCalendar";
import WeeklyProgressRing from "@/components/gamification/WeeklyProgressRing";
import { getImpactEquivalencies, type UserGamificationStats } from "@/services/gamificationEngine";

interface ProfileViewProps {
  onBack: () => void;
}

const ProfileView = ({ onBack }: ProfileViewProps) => {
  const { points, streak, achievements, scanHistory } = useUser();
  const totalScans = scanHistory.length;
  const totalItems = scanHistory.reduce((s, r) => s + r.items.length, 0);
  const [nudge, setNudge] = useState<string | null>(null);

  const stats: UserGamificationStats = useMemo(() => ({
    points,
    streak,
    totalScans,
    totalItems,
    uniqueMaterials: new Set(scanHistory.flatMap((r) => r.items.map((i) => i.category || i.label))).size,
    challengesCompleted: (() => {
      try { return JSON.parse(localStorage.getItem("recyclemate_claimed_challenges") || "[]").length; }
      catch { return 0; }
    })(),
  }), [points, streak, totalScans, totalItems, scanHistory]);

  const impact = useMemo(() => getImpactEquivalencies(totalItems), [totalItems]);

  useEffect(() => {
    getDailyNudge({
      points,
      streak,
      totalScans,
      recentItems: scanHistory.slice(0, 5).flatMap((r) => r.items.map((i) => i.displayName)),
    }).then((r) => setNudge(r.text)).catch(() => {});
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
        <button onClick={onBack} className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-secondary flex items-center justify-center active-press">
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
        </button>
        <span className="text-label text-muted-foreground">Profile</span>
        <div className="w-9 sm:w-10" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-4 sm:pb-6 space-y-4 sm:space-y-5">
        {/* AI Nudge */}
        {nudge && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-2xl bg-primary/10 border border-primary/20 flex items-center gap-3"
          >
            <Sparkles className="w-5 h-5 text-primary shrink-0" />
            <p className="text-sm text-foreground font-medium">{nudge}</p>
          </motion.div>
        )}

        {/* Avatar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center py-2">
          <EcoAvatar points={points} size={90} />
        </motion.div>

        {/* Stats */}
        <StatsRow points={points} streak={streak} totalScans={totalScans} />

        {/* Level */}
        <LevelProgress points={points} />

        {/* Streak Shield */}
        <StreakShield />

        {/* Daily Challenge */}
        <DailyChallengeCard />

        {/* Impact mini-summary */}
        {totalItems > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 rounded-2xl bg-success/5 border border-success/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <Leaf className="w-4 h-4 text-success" />
              <span className="text-sm font-semibold text-success">Your Impact</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: `${impact.co2Kg}kg`, label: "CO₂ saved" },
                { value: `${impact.treesEquiv}`, label: "Trees equiv." },
                { value: `${impact.showers}`, label: "Showers saved" },
                { value: `${impact.phoneCharges}`, label: "Phone charges" },
              ].map((m) => (
                <div key={m.label} className="text-center">
                  <p className="font-mono text-lg font-semibold text-success">{m.value}</p>
                  <p className="text-[10px] text-muted-foreground">{m.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Badges */}
        <BadgeGrid unlockedBadges={achievements} stats={stats} />

        {/* Recent Scans */}
        <div>
          <h3 className="text-label text-muted-foreground mb-3">Recent Scans</h3>
          {scanHistory.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">No scans yet — start scanning!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {scanHistory.slice(0, 5).map((record, i) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card"
                >
                  <Clock className="w-4 h-4 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {record.items.map((i) => i.displayName).join(", ")}
                    </p>
                    <p className="font-mono text-[10px] text-muted-foreground">
                      {record.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-success bg-success/10 px-2 py-1 rounded-lg">
                    +{record.pointsEarned}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
