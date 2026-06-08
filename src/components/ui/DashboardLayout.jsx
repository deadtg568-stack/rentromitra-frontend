import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

function SidebarNav({ tabs, activeTab, onTabChange }) {
  return (
    <nav className="grid gap-1 p-3">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all ${
              active
                ? "bg-gradient-primary text-white shadow-soft"
                : "text-slate-600 hover:bg-primary-50 hover:text-primary-700"
            }`}
            onClick={() => onTabChange(tab.id)}
          >
            <Icon size={18} />
            {tab.label}
            {tab.count != null && (
              <span className={`ml-auto rounded-full px-2 py-0.5 text-xs ${active ? "bg-white/20" : "bg-slate-100"}`}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

export function DashboardLayout({
  sidebarHeader,
  sidebarFooter,
  tabs,
  activeTab,
  onTabChange,
  title,
  subtitle,
  badge,
  actions,
  children
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  function selectTab(id) {
    onTabChange(id);
    setMobileOpen(false);
  }

  return (
    <motion.div className="grid gap-6 lg:grid-cols-[280px_1fr]" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <aside className="panel hidden h-fit overflow-hidden lg:block">
        <motion.div className="bg-gradient-hero p-6 text-white">{sidebarHeader}</motion.div>
        <SidebarNav tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />
        {sidebarFooter}
      </aside>

      <div className="lg:hidden">
        <button type="button" className="btn-muted w-full justify-between" onClick={() => setMobileOpen(true)} aria-label="Open menu">
          <Menu size={18} />
          Menu — {tabs.find((t) => t.id === activeTab)?.label}
        </button>
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
              />
              <motion.aside
                className="fixed inset-y-0 left-0 z-50 w-[min(300px,85vw)] overflow-y-auto bg-white shadow-2xl"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 300 }}
              >
                <div className="flex items-center justify-between border-b p-4">
                  <span className="font-bold text-ink">Dashboard</span>
                  <button type="button" className="rounded-xl p-2 hover:bg-slate-100" onClick={() => setMobileOpen(false)}>
                    <X size={20} />
                  </button>
                </div>
                <div className="bg-gradient-hero p-5 text-white">{sidebarHeader}</div>
                <SidebarNav tabs={tabs} activeTab={activeTab} onTabChange={selectTab} />
                {sidebarFooter}
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>

      <main className="min-w-0 space-y-6">
        <section className="flex flex-wrap items-start justify-between gap-4">
          <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}>
            {badge && <p className="text-sm font-bold uppercase tracking-wide text-primary-600">{badge}</p>}
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-slate-600">{subtitle}</p>}
          </motion.div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </section>
        {children}
      </main>
    </motion.div>
  );
}
