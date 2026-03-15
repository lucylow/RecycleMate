import { motion } from "framer-motion";
import { Leaf, Droplets, TreePine, Recycle } from "lucide-react";
import { useUser } from "@/context/UserContext";

const ProgressBar = ({ value, max, color = "bg-primary" }: { value: number; max: number; color?: string }) => {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
        className={`h-full rounded-full ${color}`}
      />
    </div>
  );
};

const ImpactPage = () => {
  const { scanHistory, points } = useUser();
  const totalItems = scanHistory.reduce((sum, r) => sum + r.items.length, 0);

  // Mock environmental calculations
  const co2Saved = (totalItems * 0.157).toFixed(1);
  const waterSaved = Math.round(totalItems * 7.6);
  const treesEquiv = (totalItems * 0.02).toFixed(2);
  const monthlyGoal = 200;

  const stats = [
    { icon: <Recycle className="w-5 h-5" />, value: totalItems, label: "Items Recycled", color: "text-primary" },
    { icon: <Leaf className="w-5 h-5" />, value: `${co2Saved} kg`, label: "CO₂ Saved", color: "text-success" },
    { icon: <Droplets className="w-5 h-5" />, value: `${waterSaved} L`, label: "Water Saved", color: "text-primary" },
    { icon: <TreePine className="w-5 h-5" />, value: treesEquiv, label: "Trees Equivalent", color: "text-success" },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div>
        <h1 className="text-display mb-1">Your Impact</h1>
        <p className="text-sm text-muted-foreground">Environmental contribution tracker</p>
      </div>

      {/* Monthly goal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-3xl border border-border bg-card shadow-soft"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold">Monthly Goal</span>
          <span className="font-mono text-xs text-muted-foreground">{totalItems} / {monthlyGoal} items</span>
        </div>
        <ProgressBar value={totalItems} max={monthlyGoal} />
        <p className="text-xs text-muted-foreground mt-2">
          {monthlyGoal - totalItems > 0
            ? `${monthlyGoal - totalItems} more items to reach your monthly goal`
            : "Monthly goal achieved! 🎉"}
        </p>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="p-5 rounded-2xl border border-border bg-card shadow-soft text-center"
          >
            <div className={`mx-auto mb-2 ${stat.color}`}>{stat.icon}</div>
            <p className={`font-mono text-2xl font-semibold tracking-tighter ${stat.color}`}>{stat.value}</p>
            <p className="text-label text-muted-foreground mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Info card */}
      <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20">
        <p className="text-sm text-foreground/80 leading-relaxed">
          <strong>How we calculate:</strong> Each correctly recycled item saves approximately 0.157 kg of CO₂,
          7.6 litres of water, and contributes to the equivalent of 0.02 trees preserved annually.
        </p>
      </div>
    </div>
  );
};

export default ImpactPage;
