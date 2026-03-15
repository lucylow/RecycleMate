import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Moon, MapPin, Smartphone, RotateCcw } from "lucide-react";

interface ToggleProps {
  enabled: boolean;
  onChange: (v: boolean) => void;
}

const Toggle = ({ enabled, onChange }: ToggleProps) => (
  <button
    onClick={() => onChange(!enabled)}
    className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? "bg-primary" : "bg-secondary"}`}
  >
    <motion.div
      animate={{ x: enabled ? 20 : 2 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="absolute top-1 w-4 h-4 rounded-full bg-background shadow-sm"
    />
  </button>
);

const SettingsPage = () => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [locationTracking, setLocationTracking] = useState(true);
  const [haptics, setHaptics] = useState(true);

  const handleReset = () => {
    if (confirm("Reset all app data? This cannot be undone.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const settings = [
    { icon: <Bell className="w-5 h-5" />, label: "Notifications", desc: "Daily reminders to scan and sort", value: notifications, onChange: setNotifications },
    { icon: <Moon className="w-5 h-5" />, label: "Dark Mode", desc: "Switch to dark theme", value: darkMode, onChange: setDarkMode },
    { icon: <MapPin className="w-5 h-5" />, label: "Location Tracking", desc: "Get localised disposal rules", value: locationTracking, onChange: setLocationTracking },
    { icon: <Smartphone className="w-5 h-5" />, label: "Haptic Feedback", desc: "Vibration on interactions", value: haptics, onChange: setHaptics },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div>
        <h1 className="text-display mb-1">Settings</h1>
        <p className="text-sm text-muted-foreground">Customize your experience</p>
      </div>

      <div className="space-y-2">
        {settings.map((setting, i) => (
          <motion.div
            key={setting.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-card"
          >
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground shrink-0">
              {setting.icon}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{setting.label}</p>
              <p className="text-xs text-muted-foreground">{setting.desc}</p>
            </div>
            <Toggle enabled={setting.value} onChange={setting.onChange} />
          </motion.div>
        ))}
      </div>

      {/* Danger zone */}
      <div className="pt-4 border-t border-border">
        <p className="text-label text-destructive mb-3">Danger Zone</p>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-destructive/20 text-destructive text-sm font-medium active-press w-full"
        >
          <RotateCcw className="w-4 h-4" />
          Reset All Data
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
