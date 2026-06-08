import { motion } from "framer-motion";
import { AnimatedCounter } from "../ui/AnimatedCounter.jsx";

export function StatCard({ label, value, icon: Icon, accent = false, delay = 0 }) {
  const isNumeric = typeof value === "number" || (typeof value === "string" && /^\d+$/.test(String(value).replace(/,/g, "")));

  return (
    <motion.div
      className={`glass p-5 ${accent ? "border-primary-200/60 bg-gradient-to-br from-primary-50/80 to-white" : ""}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        {Icon && (
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-50 text-primary-600">
            <Icon size={18} />
          </span>
        )}
      </div>
      <p className="mt-3 text-3xl font-extrabold tracking-tight text-ink">
        {isNumeric ? <AnimatedCounter value={typeof value === "number" ? value : parseInt(String(value).replace(/\D/g, ""), 10)} /> : value}
      </p>
    </motion.div>
  );
}
