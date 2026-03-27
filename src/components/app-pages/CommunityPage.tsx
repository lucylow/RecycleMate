import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Users, TrendingUp, Globe, TreePine, Leaf, Droplets, MapPin, Trophy, Crown } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { getLevel } from "@/services/gamificationEngine";

interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  level: number;
  emoji: string;
}

const NEIGHBOURHOOD_DATA = [
  { name: "Downtown", items: 24_310 },
  { name: "Westside", items: 18_920 },
  { name: "Harbour", items: 15_440 },
  { name: "Northgate", items: 12_870 },
  { name: "Eastpark", items: 11_230 },
  { name: "Southvale", items: 9_540 },
];

const communityChartConfig: ChartConfig = {
  items: { label: "Items Recycled", color: "hsl(var(--primary))" },
};

const RANK_EMOJI = ["🥇", "🥈", "🥉"];

const CommunityPage = () => {
  const { points, scanHistory } = useUser();
  const userItems = scanHistory.reduce((sum, r) => sum + r.items.length, 0);
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from("profiles")
          .select("display_name, points")
          .order("points", { ascending: false })
          .limit(10);

        if (data) {
          setLeaders(
            data.map((p, i) => {
              const lvl = getLevel(p.points);
              return {
                rank: i + 1,
                name: p.display_name || `Recycler ${i + 1}`,
                points: p.points,
                level: lvl.level,
                emoji: lvl.emoji,
              };
            })
          );
        }
      } catch {
        // Use fallback
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const userRank = useMemo(() => {
    if (leaders.length === 0) return "?";
    const idx = leaders.findIndex((l) => points >= l.points);
    return idx === -1 ? leaders.length + 1 : idx + 1;
  }, [points, leaders]);

  const userLevel = getLevel(points);

  const totalCommunityItems = 156_432 + userItems;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div>
        <h1 className="text-display mb-1">Community</h1>
        <p className="text-sm text-muted-foreground">Compete, climb, and recycle together</p>
      </div>

      {/* Your rank card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-3xl bg-primary text-primary-foreground"
      >
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-primary-foreground/15 flex items-center justify-center">
            <Crown className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-primary-foreground/70">Your Rank</p>
            <p className="text-3xl font-bold tracking-tight">#{userRank}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{points}</p>
            <p className="text-xs text-primary-foreground/70">
              Lv.{userLevel.level} {userLevel.emoji}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Impact stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: <Users className="w-5 h-5" />, value: "2,847+", label: "Active Users", color: "text-primary" },
          { icon: <Globe className="w-5 h-5" />, value: totalCommunityItems.toLocaleString(), label: "Items Recycled", color: "text-success" },
          { icon: <Leaf className="w-5 h-5" />, value: "24.6t", label: "CO₂ Saved", color: "text-success" },
          { icon: <TreePine className="w-5 h-5" />, value: "3,129", label: "Trees Saved", color: "text-primary" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="p-4 rounded-2xl border border-border bg-card shadow-soft text-center"
          >
            <div className={`mx-auto mb-1.5 ${stat.color}`}>{stat.icon}</div>
            <p className={`font-mono text-xl font-semibold tracking-tighter ${stat.color}`}>{stat.value}</p>
            <p className="text-label text-muted-foreground mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-3xl border border-border bg-card shadow-soft overflow-hidden"
      >
        <div className="p-5 pb-3 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-warning" />
          <h3 className="text-sm font-semibold">Leaderboard</h3>
          <span className="ml-auto text-[10px] text-muted-foreground font-mono">LIVE</span>
        </div>
        <div className="divide-y divide-border">
          {loading ? (
            <div className="p-6 text-center text-sm text-muted-foreground">Loading...</div>
          ) : leaders.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">Be the first on the board!</div>
          ) : (
            leaders.map((user, i) => (
              <motion.div
                key={user.rank}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.03 }}
                className="flex items-center gap-3 px-5 py-3"
              >
                <span className="font-mono text-sm font-bold w-6 text-center">
                  {i < 3 ? RANK_EMOJI[i] : `#${user.rank}`}
                </span>
                <span className="text-lg">{user.emoji}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium truncate block">{user.name}</span>
                  <span className="text-[10px] text-muted-foreground">Lv.{user.level}</span>
                </div>
                <span className="font-mono text-xs text-muted-foreground">
                  {user.points.toLocaleString()} pts
                </span>
              </motion.div>
            ))
          )}
          {/* User row */}
          <div className="flex items-center gap-3 px-5 py-3 bg-primary/5">
            <span className="font-mono text-sm font-bold w-6 text-center text-primary">#{userRank}</span>
            <span className="text-lg">{userLevel.emoji}</span>
            <div className="flex-1">
              <span className="text-sm font-medium text-primary">You</span>
              <span className="text-[10px] text-muted-foreground ml-2">Lv.{userLevel.level}</span>
            </div>
            <span className="font-mono text-xs text-primary">{points.toLocaleString()} pts</span>
          </div>
        </div>
      </motion.div>

      {/* Neighbourhood chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="p-5 rounded-3xl border border-border bg-card shadow-soft"
      >
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">By Neighbourhood</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-4">Items recycled this month</p>
        <ChartContainer config={communityChartConfig} className="aspect-[2/1] w-full">
          <BarChart data={NEIGHBOURHOOD_DATA} layout="vertical" margin={{ top: 0, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={70} />
            <Tooltip content={<ChartTooltipContent />} />
            <Bar dataKey="items" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartContainer>
      </motion.div>
    </div>
  );
};

export default CommunityPage;
