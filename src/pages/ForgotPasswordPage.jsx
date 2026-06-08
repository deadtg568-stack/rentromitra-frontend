import { MailCheck } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { AuthShell } from "../components/common/AuthShell.jsx";
import { FormField } from "../components/common/FormField.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { validateForgotPassword } from "../utils/authValidation.js";

export function ForgotPasswordPage() {
  const [form, setForm] = useState({ email: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  function update(value) {
    setForm({ email: value });
    setErrors({});
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateForgotPassword(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    window.setTimeout(() => {
      showToast({
        type: "info",
        title: "Reset request captured",
        message: "Password reset email delivery needs a backend endpoint before messages can be sent."
      });
      setSubmitting(false);
    }, 500);
  }

  return (
    <AuthShell title="Forgot password" subtitle="Enter your registered email. The screen is ready for a backend reset endpoint when email delivery is added.">
      <form onSubmit={handleSubmit} className="grid gap-4">
        <FormField label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={(event) => update(event.target.value)} error={errors.email} />
        <button className="btn-primary h-11 w-full" type="submit" disabled={submitting}>
          <MailCheck size={17} /> {submitting ? "Checking..." : "Request reset link"}
        </button>
        <p className="text-center text-sm text-slate-600">
          Remembered your password? <Link className="font-semibold text-primary" to="/login">Back to login</Link>
        </p>
      </form>
    </AuthShell>
  );
}
