import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

const toastStyles = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-red-200 bg-red-50 text-red-800",
  info: "border-slate-200 bg-white text-slate-800"
};

const toastIcons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type = "info", title, message }) => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { id, type, title, message }]);
      window.setTimeout(() => removeToast(id), 4000);
    },
    [removeToast]
  );

  const value = useMemo(() => ({ showToast, removeToast }), [showToast, removeToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-20 z-50 grid w-[calc(100vw-2rem)] max-w-sm gap-3">
        {toasts.map((toast) => {
          const Icon = toastIcons[toast.type] || Info;

          return (
            <div key={toast.id} className={`flex items-start gap-3 rounded-lg border p-4 shadow-lg ${toastStyles[toast.type] || toastStyles.info}`}>
              <Icon className="mt-0.5 shrink-0" size={20} />
              <div className="min-w-0 flex-1">
                <p className="font-bold">{toast.title}</p>
                {toast.message && <p className="mt-1 text-sm leading-5 opacity-85">{toast.message}</p>}
              </div>
              <button className="rounded-md p-1 opacity-70 hover:bg-black/5 hover:opacity-100" onClick={() => removeToast(toast.id)} aria-label="Dismiss notification">
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
