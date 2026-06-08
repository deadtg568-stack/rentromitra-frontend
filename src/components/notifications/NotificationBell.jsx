import { Bell, CalendarCheck, CheckCircle2, Home, MessageCircle, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useNotifications } from "../../context/NotificationContext.jsx";

const typeIcons = {
  message: MessageCircle,
  booking: CalendarCheck,
  approval: CheckCircle2,
  property: Home
};

function formatTime(date) {
  if (!date) return "";
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

export function NotificationBell({ compact = false }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const notifications = useNotifications();

  useEffect(() => {
    function close(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  if (!notifications) return null;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-primary-50 hover:text-primary-700"
        onClick={() => setOpen((value) => !value)}
        aria-label="Notifications"
      >
        <Bell size={18} />
        {notifications.unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-500 px-1.5 py-0.5 text-center text-[11px] font-bold leading-none text-white">
            {notifications.unreadCount > 99 ? "99+" : notifications.unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className={`absolute right-0 z-50 mt-3 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl ${compact ? "" : ""}`}>
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <p className="font-bold text-ink">Notifications</p>
              <p className="text-xs text-slate-500">{notifications.unreadCount} unread</p>
            </div>
            <button type="button" className="text-xs font-bold text-primary-700 hover:text-primary-900" onClick={notifications.markAllRead}>
              Mark all read
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.notifications.length ? (
              notifications.notifications.slice(0, 8).map((notification) => {
                const Icon = typeIcons[notification.type] || Bell;
                return (
                  <div key={notification._id} className={`group flex gap-3 border-b border-slate-100 px-4 py-3 last:border-0 ${notification.isRead ? "bg-white" : "bg-primary-50/50"}`}>
                    <button className="flex min-w-0 flex-1 gap-3 text-left" type="button" onClick={() => { setOpen(false); notifications.openNotification(notification); }}>
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-primary-600 shadow-sm">
                        <Icon size={17} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-bold text-ink">{notification.title}</span>
                          <span className="shrink-0 text-xs text-slate-400">{formatTime(notification.createdAt)}</span>
                        </span>
                        <span className="mt-0.5 block truncate text-sm text-slate-600">{notification.body}</span>
                      </span>
                    </button>
                    <button
                      type="button"
                      className="self-start rounded-md p-1.5 text-slate-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                      onClick={() => notifications.deleteNotification(notification._id)}
                      aria-label="Delete notification"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })
            ) : (
              <p className="px-4 py-8 text-center text-sm text-slate-500">No notifications yet</p>
            )}
          </div>

          <Link className="block border-t border-slate-100 px-4 py-3 text-center text-sm font-bold text-primary-700 hover:bg-slate-50" to="/notifications" onClick={() => setOpen(false)}>
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
