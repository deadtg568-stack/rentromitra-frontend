import { Building2, Heart, Mail, MapPin, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="relative mt-16 border-t border-slate-200/80 bg-white">
      <div className="pointer-events-none absolute inset-0 bg-gradient-mesh opacity-50" />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-[1.4fr_1fr_1fr] lg:px-6">
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <Link to="/" className="inline-flex items-center gap-2.5 text-lg font-extrabold">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary text-white">
              <Building2 size={20} />
            </span>
            <span className="gradient-text">Rentomitra</span>
          </Link>
          <p className="mt-4 max-w-md text-sm leading-7 text-slate-600">
            Hyperlocal PG, hostel, and room booking for Bhopal — built for students and working professionals who want clarity before they move in.
          </p>
          <p className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary-600">
            Made with <Heart size={12} className="fill-accent-500 text-accent-500" /> in Bhopal
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.05 }}>
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink">Explore</h2>
          <div className="mt-4 grid gap-2.5 text-sm text-slate-600">
            <Link className="font-medium transition hover:text-primary-600" to="/">Properties</Link>
            <Link className="font-medium transition hover:text-primary-600" to="/login">Login</Link>
            <Link className="font-medium transition hover:text-primary-600" to="/register">Register</Link>
            <Link className="font-medium transition hover:text-primary-600" to="/dashboard">Dashboard</Link>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink">Contact</h2>
          <div className="mt-4 grid gap-3 text-sm text-slate-600">
            <span className="inline-flex items-center gap-2"><MapPin size={16} className="text-primary-500" /> Bhopal, Madhya Pradesh</span>
            <span className="inline-flex items-center gap-2"><Phone size={16} className="text-primary-500" /> Owner support</span>
            <span className="inline-flex items-center gap-2"><Mail size={16} className="text-primary-500" /> hello@rentomitra.com</span>
          </div>
        </motion.div>
      </div>
      <motion.div className="relative border-t border-slate-100 px-4 py-5 text-center text-xs text-slate-500">
        © 2026 Rentomitra. Premium rental discovery for Bhopal.
      </motion.div>
    </footer>
  );
}
