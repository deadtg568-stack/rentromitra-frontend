export function FormField({ error, label, className = "", ...inputProps }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>
      <input
        className={`input ${error ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""}`}
        {...inputProps}
      />
      {error && <span className="mt-1.5 block text-xs font-semibold text-red-600">{error}</span>}
    </label>
  );
}
