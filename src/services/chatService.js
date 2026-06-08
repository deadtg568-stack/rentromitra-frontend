import { api } from "./apiClient.js";

export async function getChatMessages(room) {
  const res = await api.get("/chat/messages", { params: room ? { room } : {} });
  return res.data.messages || [];
}

export async function getOrCreateConversation(propertyId) {
  const res = await api.post("/chat/conversations", { propertyId });
  return res.data.conversation;
}

export async function getUserConversations() {
  const res = await api.get("/chat/conversations");
  return res.data.conversations || [];
}

export async function getConversationMessages(conversationId) {
  const res = await api.get(`/chat/conversations/${conversationId}/messages`);
  return res.data.messages || [];
}

export async function sendConversationMessage(conversationId, message) {
  const res = await api.post(`/chat/conversations/${conversationId}/messages`, { message });
  return res.data.message;
}

export async function markConversationRead(conversationId) {
  await api.patch(`/chat/conversations/${conversationId}/read`);
}
