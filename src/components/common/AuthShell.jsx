import { Building2, ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export function AuthShell({ title, subtitle, children }) {
  return (
    <motion.section
      className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-card lg:grid-cols-[0.95fr_1.05fr]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="relative hidden overflow-hidden bg-gradient-hero p-8 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <motion.div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-accent-500/20 blur-3xl" />

        <Link to="/" className="relative inline-flex items-center gap-2 text-lg font-extrabold text-white">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15 backdrop-blur">
            <Building2 size={22} />
          </span>
          Rentomitra
        </Link>

        <div className="relative">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-accent-100 backdrop-blur">
            <ShieldCheck size={16} /> Secure access
          </p>
          <h2 className="mt-5 text-3xl font-extrabold leading-tight">Your premium rental workspace in Bhopal.</h2>
          <p className="mt-4 text-sm leading-7 text-white/80">
            JWT sessions, role-aware navigation, and guarded dashboards keep users, owners, and super admins in the right place.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {["Bookings", "Wishlist", "Owner tools"].map((item) => (
              <span key={item} className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold">
                {item}
              </span>
            ))}
          </div>
        </div>

        <p className="relative flex items-center gap-2 text-xs text-white/60">
          <Sparkles size={14} /> Trusted by students across Bhopal
        </p>
      </div>

      <div className="p-6 sm:p-10">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">{title}</h1>
          <p className="mt-2 text-sm leading-7 text-slate-600">{subtitle}</p>
        </div>
        {children}
      </div>
    </motion.section>
  );
}
