import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

const AboutPage = () => {
  const links = [
    { label: "TACO Dataset", url: "http://tacodataset.org", desc: "Trash Annotations in Context" },
    { label: "TensorFlow OD API", url: "https://github.com/tensorflow/models", desc: "Object Detection API" },
    { label: "World Bank Report", url: "https://openknowledge.worldbank.org/handle/10986/30317", desc: "What a Waste 2.0" },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div>
        <h1 className="text-display mb-1">About RecycleMate</h1>
        <p className="text-sm text-muted-foreground">AI-powered waste sorting for a cleaner planet</p>
      </div>

      {/* App info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-3xl border border-border bg-card shadow-soft text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
          <span className="text-primary-foreground font-bold text-2xl">R</span>
        </div>
        <h2 className="text-xl font-semibold tracking-tight">RecycleMate</h2>
        <p className="font-mono text-xs text-muted-foreground mt-1">Version 1.0.0</p>
        <p className="text-sm text-muted-foreground mt-4 leading-relaxed max-w-sm mx-auto">
          An intelligent application designed to tackle improper waste sorting through
          on-device computer vision and location-aware disposal instructions.
        </p>
      </motion.div>

      {/* SDG */}
      <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20">
        <p className="text-label text-primary mb-2">UN SDG 12</p>
        <p className="text-sm font-semibold mb-1">Responsible Consumption & Production</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Target 12.5: By 2030, substantially reduce waste generation through prevention,
          reduction, recycling, and reuse.
        </p>
      </div>

      {/* Tech stack */}
      <div>
        <p className="text-label text-muted-foreground mb-3">Technology Stack</p>
        <div className="flex flex-wrap gap-2">
          {["MobileNetV2 SSD", "TensorFlow Lite", "React", "PostGIS", "Python/Flask"].map((tech) => (
            <span key={tech} className="px-3 py-1.5 rounded-lg bg-secondary text-xs font-medium text-secondary-foreground">
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* References */}
      <div>
        <p className="text-label text-muted-foreground mb-3">References</p>
        <div className="space-y-2">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-card hover:bg-secondary/50 transition-colors"
            >
              <div className="flex-1">
                <p className="text-sm font-medium">{link.label}</p>
                <p className="text-xs text-muted-foreground">{link.desc}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </a>
          ))}
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-muted-foreground pt-4">
        © 2026 RecycleMate · Built for the 2030 AI Challenge
      </p>
    </div>
  );
};

export default AboutPage;
