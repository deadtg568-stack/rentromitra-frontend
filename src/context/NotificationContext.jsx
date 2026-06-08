import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import { useSocket } from "./SocketContext.jsx";
import { useToast } from "./ToastContext.jsx";
import {
  deleteNotification as deleteNotificationRequest,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead
} from "../services/notificationService.js";
import { registerPushNotifications } from "../utils/pushNotifications.js";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const socket = useSocket();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    loadNotifications();
    registerPushNotifications().catch(() => {});
  }, [user, loadNotifications]);

  useEffect(() => {
    const realtime = socket?.notificationEvents;
    if (!realtime?.length) return;
    const latest = realtime[realtime.length - 1];
    if (!latest?.notification) return;

    setNotifications((current) => {
      if (current.some((item) => item._id === latest.notification._id)) return current;
      return [latest.notification, ...current].slice(0, 50);
    });
    setUnreadCount(latest.unreadCount ?? ((count) => count + 1));
    showToast({
      type: "info",
      title: latest.notification.title,
      message: latest.notification.body
    });

    if ("Notification" in window && Notification.permission === "granted" && document.hidden) {
      navigator.serviceWorker?.ready
        ?.then((registration) => {
          registration.showNotification(latest.notification.title, {
            body: latest.notification.body,
            data: { link: latest.notification.link || "/" }
          });
        })
        .catch(() => {});
    }
  }, [socket?.notificationEvents, showToast]);

  useEffect(() => {
    const counts = socket?.notificationCounts;
    if (!counts?.length) return;
    const latest = counts[counts.length - 1];
    if (typeof latest?.unreadCount === "number") setUnreadCount(latest.unreadCount);
  }, [socket?.notificationCounts]);

  async function openNotification(notification) {
    if (!notification) return;
    if (!notification.isRead) {
      const data = await markNotificationRead(notification._id);
      setNotifications((current) => current.map((item) => (item._id === notification._id ? data.notification : item)));
      setUnreadCount(data.unreadCount);
    }
    navigate(notification.link || "/");
  }

  async function markAllRead() {
    const nextCount = await markAllNotificationsRead();
    setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
    setUnreadCount(nextCount);
  }

  async function deleteNotification(notificationId) {
    const nextCount = await deleteNotificationRequest(notificationId);
    setNotifications((current) => current.filter((item) => item._id !== notificationId));
    setUnreadCount(nextCount);
  }

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      loading,
      loadNotifications,
      openNotification,
      markAllRead,
      deleteNotification
    }),
    [notifications, unreadCount, loading, loadNotifications]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  return useContext(NotificationContext);
}
