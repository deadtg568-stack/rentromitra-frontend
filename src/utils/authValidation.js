const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[0-9+\-\s()]{8,15}$/;

export function validateLogin(form) {
  const errors = {};

  if (!form.email.trim()) errors.email = "Email is required";
  else if (!emailPattern.test(form.email)) errors.email = "Enter a valid email";

  if (!form.password) errors.password = "Password is required";

  return errors;
}

export function validateRegister(form) {
  const errors = {};

  if (!form.name.trim()) errors.name = "Full name is required";
  if (!form.email.trim()) errors.email = "Email is required";
  else if (!emailPattern.test(form.email)) errors.email = "Enter a valid email";

  if (form.phone && !phonePattern.test(form.phone)) errors.phone = "Enter a valid phone number";
  if (!form.password) errors.password = "Password is required";
  else if (form.password.length < 6) errors.password = "Password must be at least 6 characters";
  if (form.confirmPassword !== form.password) errors.confirmPassword = "Passwords do not match";

  return errors;
}

export function validateForgotPassword(form) {
  const errors = {};

  if (!form.email.trim()) errors.email = "Email is required";
  else if (!emailPattern.test(form.email)) errors.email = "Enter a valid email";

  return errors;
}
