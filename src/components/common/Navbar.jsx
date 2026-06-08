import { Building2, Heart, LogIn, LogOut, Menu, MessageCircle, ShieldCheck, UserPlus, UserRound, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { NotificationBell } from "../notifications/NotificationBell.jsx";

const navLinkClass = ({ isActive }) =>
  `relative rounded-xl px-4 py-2 text-sm font-semibold transition ${
    isActive ? "text-primary-700" : "text-slate-600 hover:text-ink"
  }`;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleLogout() {
    logout();
    setOpen(false);
    navigate("/");
  }

  const transparentHero = isHome && !scrolled;

  const roleLinks = (
    <>
      <NavLink className={navLinkClass} to="/" onClick={() => setOpen(false)} end>
        Explore
      </NavLink>
      {user?.role === "superadmin" && (
        <NavLink className={navLinkClass} to="/superadmin/dashboard" onClick={() => setOpen(false)}>
          Super Admin
        </NavLink>
      )}
      {user?.role === "admin" && (
        <NavLink className={navLinkClass} to="/admin/dashboard" onClick={() => setOpen(false)}>
          Admin
        </NavLink>
      )}
      {user?.role === "admin" && (
        <NavLink className={navLinkClass} to="/admin/add-property" onClick={() => setOpen(false)}>
          Add Property
        </NavLink>
      )}
      {user && (
        <NavLink className={navLinkClass} to="/chat" onClick={() => setOpen(false)}>
          <MessageCircle size={16} className="inline" /> Chat
        </NavLink>
      )}
      {user && (
        <NavLink
          className={navLinkClass}
          to={user.role === "superadmin" ? "/superadmin/dashboard" : user.role === "admin" ? "/admin/dashboard" : "/user/dashboard"}
          onClick={() => setOpen(false)}
        >
          Dashboard
        </NavLink>
      )}
    </>
  );

  const accountActions = user ? (
    <button className="btn-muted" type="button" onClick={handleLogout}>
      <LogOut size={16} /> Logout
    </button>
  ) : (
    <>
      <Link className="btn-ghost" to="/login" onClick={() => setOpen(false)}>
        <LogIn size={16} /> Login
      </Link>
      <Link className="btn-primary" to="/register" onClick={() => setOpen(false)}>
        <UserPlus size={16} /> Register
      </Link>
    </>
  );

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        transparentHero
          ? "border-transparent bg-transparent"
          : "border-b border-slate-200/80 bg-white/80 shadow-sm backdrop-blur-xl"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-6">
        <Link to="/" className="group flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <motion.span
            className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-primary text-white shadow-soft"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Building2 size={22} />
          </motion.span>
          <span className={`text-lg font-extrabold tracking-tight ${transparentHero ? "text-white" : "gradient-text"}`}>
            Rentomitra
          </span>
        </Link>

        <div className={`hidden items-center gap-1 md:flex ${transparentHero ? "[&_a]:text-white/90 [&_a:hover]:text-white" : ""}`}>
          {roleLinks}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {user && <NotificationBell compact />}
          {user && (
            <span className="hidden items-center gap-2 rounded-xl border border-slate-200/80 bg-white/90 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm lg:inline-flex">
              {user.role === "user" ? <Heart size={16} className="text-accent-500" /> : user.role === "superadmin" ? <ShieldCheck size={16} className="text-primary-600" /> : <UserRound size={16} />}
              {user.name}
            </span>
          )}
          {accountActions}
        </div>

        <button
          type="button"
          className={`rounded-xl p-2.5 md:hidden ${transparentHero ? "text-white hover:bg-white/10" : "text-slate-700 hover:bg-slate-100"}`}
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            className="border-t border-slate-200 bg-white px-4 py-4 md:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="mx-auto grid max-w-7xl gap-2">
              {roleLinks}
              {user && (
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <span className="text-sm font-semibold text-slate-700">Notifications</span>
                  <NotificationBell compact />
                </div>
              )}
              <motion.div className="mt-3 grid grid-cols-2 gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {accountActions}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
