import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MessageCircle, MoreVertical, Search, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PageTransition } from "../../components/ui/PageTransition.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useSocket } from "../../context/SocketContext.jsx";
import {
  getConversationMessages,
  getUserConversations,
  markConversationRead,
  sendConversationMessage
} from "../../services/chatService.js";

function formatTime(date) {
  if (!date) return "";
  const d = new Date(date);
  const now = new Date();
  const diff = now - d;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  if (days === 1) return "Yesterday";
  if (days < 7) return d.toLocaleDateString("en-IN", { weekday: "short" });
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

function formatMessageTime(date) {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function formatMessageDate(date) {
  if (!date) return "";
  const d = new Date(date);
  const now = new Date();
  const diff = now - d;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
}

function ConversationListItem({ conversation, active, userId, onlineUsers, onClick }) {
  const other = conversation.participants?.find((p) => (p._id || p.id) !== userId);
  const otherId = other?._id || other?.id;
  const isOnline = onlineUsers?.some((u) => u.id === otherId);
  const property = conversation.property;

  return (
    <button
      className={`flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-primary-50/50 ${
        active ? "bg-primary-50" : ""
      }`}
      onClick={onClick}
    >
      <div className="relative shrink-0">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-primary text-sm font-bold text-white">
          {other?.name?.[0]?.toUpperCase() || "U"}
        </div>
        <span
          className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white ${
            isOnline ? "bg-emerald-500" : "bg-slate-400"
          }`}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-bold text-ink">{other?.name || "User"}</p>
          <span className="shrink-0 text-xs text-slate-400">{formatTime(conversation.lastMessageAt || conversation.updatedAt)}</span>
        </div>
        {property && (
          <p className="truncate text-xs text-primary-600 font-medium">{property.title}</p>
        )}
        <p className="mt-0.5 truncate text-sm text-slate-500">{conversation.lastMessage || "Start a conversation"}</p>
      </div>
    </button>
  );
}

function ChatView({ conversation, messages, typingUser, userId, onlineUsers, onBack, onSend, socket }) {
  const bottomRef = useRef(null);
  const [text, setText] = useState("");
  const other = conversation?.participants?.find((p) => (p._id || p.id) !== userId);
  const otherId = other?._id || other?.id;
  const isOnline = onlineUsers?.some((u) => u.id === otherId);
  const property = conversation?.property;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    const nextText = text;
    setText("");
    await onSend(nextText);
    socket?.sendTyping({ conversationId: conversation._id, isTyping: false });
  }

  function groupMessagesByDate(msgs) {
    const groups = [];
    let currentDate = null;
    for (const msg of msgs) {
      const dateLabel = formatMessageDate(msg.createdAt);
      if (dateLabel !== currentDate) {
        currentDate = dateLabel;
        groups.push({ type: "date", label: dateLabel });
      }
      groups.push({ type: "message", message: msg });
    }
    return groups;
  }

  const grouped = groupMessagesByDate(messages);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
        <button className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" onClick={onBack}>
          <ArrowLeft size={20} />
        </button>
        <div className="relative shrink-0">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-primary text-sm font-bold text-white">
            {other?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${isOnline ? "bg-emerald-500" : "bg-slate-400"}`} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-ink">{other?.name || "User"}</p>
          {property && (
            <p className="truncate text-xs text-primary-600">{property.title}</p>
          )}
          <p className="text-[11px] font-medium text-slate-400">{isOnline ? "Online" : "Offline"}{other?.email ? ` - ${other.email}` : ""}</p>
        </div>
        <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
          <MoreVertical size={18} />
        </button>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto bg-gradient-to-b from-slate-50 to-white p-4">
        {grouped.map((item, i) => {
          if (item.type === "date") {
            return (
              <div key={i} className="flex justify-center py-2">
                <span className="rounded-full bg-slate-200/70 px-3 py-1 text-xs font-medium text-slate-500">
                  {item.label}
                </span>
              </div>
            );
          }
          const msg = item.message;
          const mine = (msg.sender?._id || msg.sender?.id || msg.sender) === userId;
          return (
            <div key={msg._id || i} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                  mine
                    ? "bg-gradient-primary text-white rounded-br-md"
                    : "bg-white text-slate-800 shadow-sm border border-slate-100 rounded-bl-md"
                }`}
              >
                <p className="leading-relaxed">{msg.message}</p>
                <p className={`mt-1 text-right text-[10px] ${mine ? "text-white/70" : "text-slate-400"}`}>
                  {formatMessageTime(msg.createdAt)}
                  {mine && (
                    <span className="ml-1">{msg.readAt ? "✓✓" : "✓"}</span>
                  )}
                </p>
              </div>
            </div>
          );
        })}
        {typingUser && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-sm border border-slate-100">
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-slate-200 bg-white px-4 py-3">
        <input
          className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-5 py-2.5 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-primary-400 focus:bg-white focus:ring-4 focus:ring-primary-100"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            socket?.sendTyping({ conversationId: conversation._id, isTyping: Boolean(e.target.value) });
          }}
          placeholder="Type a message..."
        />
        <button
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-primary text-white shadow-soft transition hover:shadow-glow active:scale-95 disabled:opacity-50"
          type="submit"
          disabled={!text.trim()}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}

export function ChatPage() {
  const { user } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const userId = user?._id || user?.id;

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const openConvId = location.state?.conversationId || new URLSearchParams(location.search).get("conversation");

  useEffect(() => {
    async function load() {
      try {
        const data = await getUserConversations();
        setConversations(data);
        if (openConvId) {
          const found = data.find((c) => c._id === openConvId);
          if (found) {
            setActiveConv(found);
            setSidebarOpen(false);
          }
        }
      } catch (err) {
        console.error("Failed to load conversations", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (!activeConv) return;
    setMessages([]);
    getConversationMessages(activeConv._id)
      .then(setMessages)
      .catch(() => {});
    markConversationRead(activeConv._id).catch(() => {});
    socket?.joinRoom(activeConv._id);

    return () => {
      socket?.leaveRoom(activeConv._id);
    };
  }, [activeConv?._id]);

  useEffect(() => {
    if (!socket?.messages?.length) return;
    const newMsg = socket.messages[socket.messages.length - 1];
    if (newMsg?.room === activeConv?._id) {
      setMessages((prev) => {
        if (prev.some((m) => m._id === newMsg._id)) return prev;
        return [...prev, newMsg];
      });
    }
    if (newMsg?.room) {
      setConversations((prev) => prev.map((c) => {
        if (c._id === newMsg.room) {
          return {
            ...c,
            lastMessage: newMsg.message,
            lastMessageAt: newMsg.createdAt,
            lastSender: newMsg.sender?._id
          };
        }
        return c;
      }));
    }
  }, [socket?.messages]);

  useEffect(() => {
    if (!socket?.conversationUpdates?.length) return;
    const update = socket.conversationUpdates[socket.conversationUpdates.length - 1];
    setConversations((prev) => prev.map((conv) => (conv._id === update._id ? { ...conv, ...update } : conv)));
  }, [socket?.conversationUpdates]);

  async function handleSendMessage(message) {
    if (!activeConv) return;

    if (socket?.connected) {
      socket.sendMessage({ conversationId: activeConv._id, message });
      return;
    }

    const saved = await sendConversationMessage(activeConv._id, message);
    setMessages((prev) => {
      if (prev.some((item) => item._id === saved._id)) return prev;
      return [...prev, saved];
    });
    setConversations((prev) => prev.map((conv) => (
      conv._id === activeConv._id
        ? { ...conv, lastMessage: saved.message, lastMessageAt: saved.createdAt, lastSender: saved.sender?._id }
        : conv
    )));
  }

  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery) return true;
    const other = c.participants?.find((p) => (p._id || p.id) !== userId);
    const q = searchQuery.toLowerCase();
    return (
      other?.name?.toLowerCase().includes(q) ||
      c.property?.title?.toLowerCase().includes(q)
    );
  });

  const typingUser = activeConv ? socket?.typingUsers?.[activeConv._id] : null;

  return (
    <PageTransition>
      <div className="mx-auto flex h-[calc(100vh-9rem)] max-w-6xl overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card">
        <AnimatePresence>
          {(sidebarOpen || !activeConv) && (
            <motion.aside
              className={`flex w-full flex-col border-r border-slate-200 bg-white lg:w-80 ${
                activeConv && !sidebarOpen ? "hidden lg:flex" : "flex"
              }`}
              initial={false}
              animate={{ width: activeConv ? 320 : "100%" }}
              exit={{ width: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="border-b border-slate-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
                    <MessageCircle size={20} className="text-primary" /> Chats
                  </h2>
                  {activeConv && (
                    <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 lg:hidden" onClick={() => setSidebarOpen(false)}>
                      <X size={18} />
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-primary-400 focus:bg-white focus:ring-4 focus:ring-primary-100"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search conversations..."
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="space-y-1 p-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="skeleton h-16 rounded-xl" />
                    ))}
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <MessageCircle className="text-slate-300" size={48} />
                    <p className="mt-4 text-lg font-bold text-slate-500">No conversations yet</p>
                    <p className="mt-1 max-w-xs text-sm text-slate-400">
                      {user?.role === "user"
                        ? 'Click "Chat with Owner" on any property to start'
                        : "Conversations will appear here when users message you"}
                    </p>
                  </div>
                ) : (
                  filteredConversations.map((conv) => (
                    <ConversationListItem
                      key={conv._id}
                      conversation={conv}
                      active={activeConv?._id === conv._id}
                      userId={userId}
                      onlineUsers={socket?.onlineUsers}
                      onClick={() => {
                        setActiveConv(conv);
                        setSidebarOpen(false);
                      }}
                    />
                  ))
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {activeConv ? (
          <div className="flex flex-1 flex-col">
            <ChatView
              conversation={activeConv}
              messages={messages}
              typingUser={typingUser}
              userId={userId}
              onlineUsers={socket?.onlineUsers}
              socket={socket}
              onSend={handleSendMessage}
              onBack={() => {
                setActiveConv(null);
                setSidebarOpen(true);
              }}
            />
          </div>
        ) : (
          <div className="hidden flex-1 items-center justify-center bg-gradient-to-b from-slate-50 to-white lg:flex">
            <div className="text-center">
              <div className="mx-auto mb-6 grid h-24 w-24 place-items-center rounded-full bg-primary-50">
                <MessageCircle size={48} className="text-primary-400" />
              </div>
              <h3 className="text-2xl font-bold text-ink">Your Messages</h3>
              <p className="mt-2 max-w-sm text-sm text-slate-500">
                Select a conversation from the sidebar to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
