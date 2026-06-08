import { Bell, CalendarCheck, CheckCircle2, Home, MessageCircle, Trash2 } from "lucide-react";
import { PageTransition } from "../../components/ui/PageTransition.jsx";
import { useNotifications } from "../../context/NotificationContext.jsx";

const icons = {
  message: MessageCircle,
  booking: CalendarCheck,
  approval: CheckCircle2,
  property: Home
};

function formatDate(date) {
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function NotificationsPage() {
  const notifications = useNotifications();

  return (
    <PageTransition>
      <section className="mx-auto max-w-3xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold uppercase text-primary">Notifications</p>
            <h1 className="mt-1 text-3xl font-bold text-ink">Recent activity</h1>
          </div>
          <button className="btn-muted" type="button" onClick={notifications?.markAllRead}>
            Mark all read
          </button>
        </div>

        <div className="panel overflow-hidden">
          {notifications?.notifications?.length ? (
            notifications.notifications.map((notification) => {
              const Icon = icons[notification.type] || Bell;
              return (
                <article key={notification._id} className={`flex gap-4 border-b border-slate-100 p-4 last:border-0 ${notification.isRead ? "bg-white" : "bg-primary-50/50"}`}>
                  <button className="flex min-w-0 flex-1 gap-4 text-left" type="button" onClick={() => notifications.openNotification(notification)}>
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-primary-600 shadow-sm">
                      <Icon size={20} />
                    </span>
                    <span className="min-w-0">
                      <span className="font-bold text-ink">{notification.title}</span>
                      <span className="mt-1 block text-sm leading-6 text-slate-600">{notification.body}</span>
                      <span className="mt-2 block text-xs font-semibold text-slate-400">{formatDate(notification.createdAt)}</span>
                    </span>
                  </button>
                  <button className="h-9 rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" type="button" onClick={() => notifications.deleteNotification(notification._id)} aria-label="Delete notification">
                    <Trash2 size={16} />
                  </button>
                </article>
              );
            })
          ) : (
            <div className="p-10 text-center">
              <Bell className="mx-auto text-slate-300" size={36} />
              <p className="mt-3 font-bold text-slate-600">No notifications yet</p>
            </div>
          )}
        </div>
      </section>
    </PageTransition>
  );
}
