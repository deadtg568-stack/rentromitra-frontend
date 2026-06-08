import { motion } from "framer-motion";

export function Skeleton({ className = "" }) {
  return <div className={`skeleton ${className}`} />;
}

export function PropertyCardSkeleton() {
  return (
    <article className="panel overflow-hidden">
      <div className="skeleton h-52 w-full" />
      <motion.div className="space-y-3 p-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <motion.div className="skeleton h-5 w-3/4" />
        <motion.div className="skeleton h-4 w-1/2" />
        <motion.div className="flex gap-2">
          <div className="skeleton h-6 w-16 rounded-full" />
          <motion.div className="skeleton h-6 w-20 rounded-full" />
        </motion.div>
        <motion.div className="skeleton h-10 w-full rounded-xl" />
      </motion.div>
    </article>
  );
}
