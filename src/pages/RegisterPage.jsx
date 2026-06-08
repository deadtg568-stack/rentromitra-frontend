import { ShieldCheck, UserPlus, UserRound } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FormField } from "../components/common/FormField.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { validateRegister } from "../utils/authValidation.js";

const emptyForm = { name: "", email: "", phone: "", city: "", password: "", confirmPassword: "" };

function SignupForm({ accent = "primary", errors, form, type, submitting, onUpdate, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <FormField label="Full name" placeholder="Your name" value={form.name} onChange={(event) => onUpdate("name", event.target.value)} error={errors.name} />
      <FormField label="Email" type="email" placeholder={type === "admin" ? "admin@rentomitra.com" : "you@example.com"} value={form.email} onChange={(event) => onUpdate("email", event.target.value)} error={errors.email} />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Phone" placeholder="+91 98765 43210" value={form.phone} onChange={(event) => onUpdate("phone", event.target.value)} error={errors.phone} />
        <FormField label="City" placeholder="Bhopal" value={form.city} onChange={(event) => onUpdate("city", event.target.value)} error={errors.city} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Password" type="password" placeholder="At least 6 characters" value={form.password} onChange={(event) => onUpdate("password", event.target.value)} error={errors.password} />
        <FormField label="Confirm password" type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={(event) => onUpdate("confirmPassword", event.target.value)} error={errors.confirmPassword} />
      </div>
      <button className={accent === "accent" ? "btn-accent h-11 w-full" : "btn-primary h-11 w-full"} type="submit" disabled={submitting === type}>
        <UserPlus size={17} /> {submitting === type ? "Creating account..." : "Register"}
      </button>
    </form>
  );
}

export function RegisterPage() {
  const [userForm, setUserForm] = useState(emptyForm);
  const [adminForm, setAdminForm] = useState(emptyForm);
  const [userErrors, setUserErrors] = useState({});
  const [adminErrors, setAdminErrors] = useState({});
  const [submitting, setSubmitting] = useState("");
  const { adminSignup, register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  function update(type, field, value) {
    const setForm = type === "admin" ? setAdminForm : setUserForm;
    const setErrors = type === "admin" ? setAdminErrors : setUserErrors;
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  }

  async function handleSubmit(event, type) {
    event.preventDefault();
    const form = type === "admin" ? adminForm : userForm;
    const nextErrors = validateRegister(form);
    if (type === "admin") setAdminErrors(nextErrors);
    else setUserErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const { confirmPassword, ...payload } = form;
    setSubmitting(type);
    try {
      const createdUser = type === "admin" ? await adminSignup(payload) : await register(payload);
      showToast({ type: "success", title: "Account created", message: "Your Rentomitra dashboard is ready." });
      navigate(createdUser.role === "admin" ? "/admin/dashboard" : "/user/dashboard");
    } catch (err) {
      showToast({ type: "error", title: "Registration failed", message: err.message });
    } finally {
      setSubmitting("");
    }
  }

  return (
    <section className="mx-auto max-w-6xl">
      <div className="mb-8 text-center">
        <span className="badge-primary">
          <UserPlus size={14} /> Role-based signup
        </span>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-ink">Create your Rentomitra account</h1>
        <p className="mx-auto mt-3 max-w-2xl text-slate-600">Choose the correct signup panel for your role.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.article className="glass p-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-5 flex items-start gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-50 text-primary-700">
              <UserRound size={24} />
            </span>
            <div>
              <h2 className="text-2xl font-bold">User Signup</h2>
              <p className="mt-1 text-sm text-slate-600">Explore approved properties and book available stays.</p>
            </div>
          </div>
          <SignupForm errors={userErrors} form={userForm} type="user" submitting={submitting} onUpdate={(field, value) => update("user", field, value)} onSubmit={(event) => handleSubmit(event, "user")} />
        </motion.article>

        <motion.article className="glass p-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <div className="mb-5 flex items-start gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent-50 text-accent-600">
              <ShieldCheck size={24} />
            </span>
            <div>
              <h2 className="text-2xl font-bold">Admin Signup</h2>
              <p className="mt-1 text-sm text-slate-600">Create an admin account and submit properties for approval.</p>
            </div>
          </div>
          <SignupForm accent="accent" errors={adminErrors} form={adminForm} type="admin" submitting={submitting} onUpdate={(field, value) => update("admin", field, value)} onSubmit={(event) => handleSubmit(event, "admin")} />
        </motion.article>
      </div>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already registered? <Link className="font-semibold text-primary" to="/login">Login</Link>
      </p>
    </section>
  );
}
