import { motion } from "framer-motion";
import { Clock, Search } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useState } from "react";

const HistoryPage = () => {
  const { scanHistory } = useUser();
  const [search, setSearch] = useState("");

  const filtered = scanHistory.filter((r) =>
    search ? r.items.some((i) => i.displayName.toLowerCase().includes(search.toLowerCase())) : true
  );

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div>
        <h1 className="text-display mb-1">Scan History</h1>
        <p className="text-sm text-muted-foreground">{scanHistory.length} total scans</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-2xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Clock className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">{search ? "No matching scans" : "No scans yet"}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((record, i) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-card shadow-soft"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {record.items.map((it) => it.displayName).join(", ")}
                </p>
                <p className="font-mono text-xs text-muted-foreground mt-0.5">
                  {record.timestamp.toLocaleDateString()} · {record.timestamp.toLocaleTimeString()}
                </p>
              </div>
              <span className="text-xs font-semibold text-success bg-success/10 px-2.5 py-1 rounded-lg shrink-0">
                +{record.pointsEarned}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
