const variants = {
  primary: "btn-primary",
  accent: "btn-accent",
  muted: "btn-muted",
  ghost: "btn-ghost"
};

const sizes = {
  sm: "px-3 py-2 text-xs rounded-lg",
  md: "",
  lg: "px-6 py-3 text-base rounded-2xl"
};

export function Button({ variant = "primary", size = "md", className = "", children, ...props }) {
  return (
    <button className={`${variants[variant] || variants.primary} ${sizes[size] || ""} ${className}`} {...props}>
      {children}
    </button>
  );
}
