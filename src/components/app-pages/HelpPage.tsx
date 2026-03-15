import { motion } from "framer-motion";
import { HelpCircle, ChevronDown } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    q: "How does RecycleMate detect items?",
    a: "RecycleMate uses a MobileNetV2 SSD object detection model running directly on your device. It identifies waste items through your camera and classifies them into categories like plastic, paper, glass, and more.",
  },
  {
    q: "Does it work offline?",
    a: "Core detection works without internet. However, location-based disposal rules require an internet connection to fetch your municipality's specific guidelines.",
  },
  {
    q: "How accurate is the detection?",
    a: "Our model achieves over 95% accuracy on common waste items. Accuracy may vary with lighting conditions and unusual items. We continuously improve the model with new training data.",
  },
  {
    q: "How are points calculated?",
    a: "You earn 10 points for each item you correctly identify and confirm disposal. Bonus points are awarded for consecutive-day streaks.",
  },
  {
    q: "What do I do if the item isn't recognized?",
    a: "If RecycleMate can't identify an item, check your local municipality's website for disposal guidelines. You can also try scanning from a different angle or with better lighting.",
  },
  {
    q: "Is my camera data private?",
    a: "Yes. All image processing happens on your device. No photos are sent to any server. Your privacy is our priority.",
  },
];

const HelpPage = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div>
        <h1 className="text-display mb-1">Help & FAQ</h1>
        <p className="text-sm text-muted-foreground">Common questions answered</p>
      </div>

      <div className="space-y-2">
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-2xl border border-border bg-card overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex items-center gap-3 p-4 text-left active-press"
              >
                <HelpCircle className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm font-medium flex-1">{faq.q}</span>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </motion.div>
              </button>
              <motion.div
                initial={false}
                animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
                className="overflow-hidden"
              >
                <p className="px-4 pb-4 pl-12 text-sm text-muted-foreground leading-relaxed">
                  {faq.a}
                </p>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default HelpPage;
