import { api } from "./apiClient.js";

export async function getNotifications() {
  const res = await api.get("/notifications");
  return {
    notifications: res.data.notifications || [],
    unreadCount: res.data.unreadCount || 0
  };
}

export async function markNotificationRead(id) {
  const res = await api.patch(`/notifications/${id}/read`);
  return {
    notification: res.data.notification,
    unreadCount: res.data.unreadCount || 0
  };
}

export async function markAllNotificationsRead() {
  const res = await api.patch("/notifications/read-all");
  return res.data.unreadCount || 0;
}

export async function deleteNotification(id) {
  const res = await api.delete(`/notifications/${id}`);
  return res.data.unreadCount || 0;
}

export async function savePushSubscription(subscription) {
  const res = await api.post("/notifications/push-subscriptions", subscription);
  return res.data.subscription;
}
