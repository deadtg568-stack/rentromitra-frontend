import { Building2, LockKeyhole, LogIn, ShieldCheck, UserPlus, UserRound } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FormField } from "../components/common/FormField.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { validateLogin } from "../utils/authValidation.js";
import { dashboardPathForRole } from "../utils/roleRedirect.js";

const emptyLogin = { email: "", password: "" };

function LoginForm({ accent = "primary", errors, form, label, loading, onChange, onSubmit, submitText }) {
  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <FormField label="Email" type="email" placeholder={label === "Admin" ? "admin@rentomitra.com" : "you@example.com"} value={form.email} onChange={(event) => onChange("email", event.target.value)} error={errors.email} />
      <FormField label="Password" type="password" placeholder="Your password" value={form.password} onChange={(event) => onChange("password", event.target.value)} error={errors.password} />
      <button className={accent === "accent" ? "btn-accent h-11 w-full" : "btn-primary h-11 w-full"} type="submit" disabled={loading}>
        <LogIn size={17} /> {loading ? "Signing in..." : submitText}
      </button>
    </form>
  );
}

export function LoginPage() {
  const [userForm, setUserForm] = useState(emptyLogin);
  const [adminForm, setAdminForm] = useState(emptyLogin);
  const [userErrors, setUserErrors] = useState({});
  const [adminErrors, setAdminErrors] = useState({});
  const [submitting, setSubmitting] = useState("");
  const { login, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  function updateUser(field, value) {
    setUserForm((current) => ({ ...current, [field]: value }));
    setUserErrors((current) => ({ ...current, [field]: "" }));
  }

  function updateAdmin(field, value) {
    setAdminForm((current) => ({ ...current, [field]: value }));
    setAdminErrors((current) => ({ ...current, [field]: "" }));
  }

  async function submitLogin(event, type) {
    event.preventDefault();
    const form = type === "user" ? userForm : adminForm;
    const nextErrors = validateLogin(form);

    if (type === "user") setUserErrors(nextErrors);
    else setAdminErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(type);
    try {
      const signedInUser = await login(form);
      const isAdminLogin = type === "admin";
      const allowed = isAdminLogin ? ["admin", "superadmin"].includes(signedInUser.role) : signedInUser.role === "user";

      if (!allowed) {
        logout();
        throw new Error(isAdminLogin ? "This account is not an admin account" : "Please use Admin Login for admin accounts");
      }

      showToast({ type: "success", title: "Welcome back", message: `Signed in as ${signedInUser.name}` });
      navigate(location.state?.from?.pathname || dashboardPathForRole(signedInUser.role), { replace: true });
    } catch (err) {
      showToast({ type: "error", title: "Login failed", message: err.message });
    } finally {
      setSubmitting("");
    }
  }

  return (
    <section className="mx-auto max-w-6xl">
      <div className="mb-8 text-center">
        <span className="badge-primary">
          <LockKeyhole size={14} /> Secure role-based access
        </span>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-ink">Login to Rentomitra</h1>
        <p className="mx-auto mt-3 max-w-2xl text-slate-600">Choose the correct access panel. Users and admins sign in from separate panels.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.article className="glass p-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-5 flex items-start gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-50 text-primary-700">
              <UserRound size={24} />
            </span>
            <div>
              <h2 className="text-2xl font-bold">User Login / Signup</h2>
              <p className="mt-1 text-sm text-slate-600">Book rooms, view property details, wishlist stays, and manage booking history.</p>
            </div>
          </div>
          <LoginForm errors={userErrors} form={userForm} label="User" loading={submitting === "user"} onChange={updateUser} onSubmit={(event) => submitLogin(event, "user")} submitText="User Login" />
          <div className="mt-5 rounded-2xl bg-primary-50 p-4 text-sm text-primary-800">
            New user? <Link className="font-bold underline" to="/register">Create a user account</Link>
          </div>
        </motion.article>

        <motion.article className="glass p-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <div className="mb-5 flex items-start gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent-50 text-accent-600">
              <ShieldCheck size={24} />
            </span>
            <div>
              <h2 className="text-2xl font-bold">Admin Login</h2>
              <p className="mt-1 text-sm text-slate-600">For Admin accounts and the configured Super Admin.</p>
            </div>
          </div>
          <LoginForm accent="accent" errors={adminErrors} form={adminForm} label="Admin" loading={submitting === "admin"} onChange={updateAdmin} onSubmit={(event) => submitLogin(event, "admin")} submitText="Admin Login" />
          <div className="mt-5 rounded-2xl bg-accent-50 p-4 text-sm text-accent-600">
            <div className="flex gap-2">
              <Building2 size={17} className="mt-0.5 shrink-0" />
              <p>New admin? <Link className="font-bold underline" to="/register">Create an admin account</Link></p>
            </div>
          </div>
        </motion.article>
      </div>
    </section>
  );
}
