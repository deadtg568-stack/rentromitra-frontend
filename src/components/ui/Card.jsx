import { motion } from "framer-motion";

export function Card({ children, className = "", glass = false, hover = false, ...motionProps }) {
  const base = glass ? "glass" : "panel";

  if (hover) {
    return (
      <motion.div
        className={`${base} ${className}`}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        {...motionProps}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div className={`${base} ${className}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} {...motionProps}>
      {children}
    </motion.div>
  );
}
