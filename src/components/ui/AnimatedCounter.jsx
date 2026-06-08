import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

export function AnimatedCounter({ value, prefix = "", suffix = "" }) {
  const numeric = typeof value === "number" ? value : parseFloat(String(value).replace(/[^\d.]/g, "")) || 0;
  const spring = useSpring(0, { stiffness: 80, damping: 20 });
  const display = useTransform(spring, (v) => `${prefix}${Math.round(v).toLocaleString("en-IN")}${suffix}`);

  useEffect(() => {
    spring.set(numeric);
  }, [numeric, spring]);

  return <motion.span>{display}</motion.span>;
}
