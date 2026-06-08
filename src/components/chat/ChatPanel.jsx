import { MessageCircle, Send, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useSocket } from "../../context/SocketContext.jsx";
import { getConversationMessages, getUserConversations, sendConversationMessage } from "../../services/chatService.js";

export function ChatPanel() {
  const { user } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!user || !open) return;
    getUserConversations().then(setConversations).catch(() => {});
  }, [user, open]);

  useEffect(() => {
    if (!activeConv) return;
    getConversationMessages(activeConv._id).then(setMessages).catch(() => {});
    socket?.joinRoom(activeConv._id);
    return () => {
      socket?.leaveRoom(activeConv._id);
    };
  }, [activeConv?._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!socket?.messages?.length) return;
    const newMsg = socket.messages[socket.messages.length - 1];
    if (newMsg?.room === activeConv?._id) {
      setMessages((prev) => {
        if (prev.some((m) => m._id === newMsg._id)) return prev;
        return [...prev, newMsg];
      });
    }
  }, [socket?.messages]);

  useEffect(() => {
    if (!socket?.conversationUpdates?.length) return;
    const update = socket.conversationUpdates[socket.conversationUpdates.length - 1];
    setConversations((prev) => prev.map((conv) => (conv._id === update._id ? { ...conv, ...update } : conv)));
  }, [socket?.conversationUpdates]);

  if (!user) return null;

  async function handleSubmit(event) {
    event.preventDefault();
    if (!text.trim() || !activeConv) return;
    const nextText = text;
    setText("");
    if (socket?.connected) {
      socket.sendMessage({ conversationId: activeConv._id, message: nextText });
    } else {
      const saved = await sendConversationMessage(activeConv._id, nextText);
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
    socket?.sendTyping({ conversationId: activeConv._id, isTyping: false });
  }

  function openFullChat() {
    if (activeConv) {
      navigate("/chat", { state: { conversationId: activeConv._id } });
    } else {
      navigate("/chat");
    }
    setOpen(false);
  }

  const typingUser = activeConv ? socket?.typingUsers?.[activeConv._id] : null;
  const userId = user?._id || user?.id;

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {open && (
        <section className="mb-3 flex h-[520px] w-[calc(100vw-2rem)] max-w-md flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl">
          <header className="flex items-center justify-between bg-gradient-hero px-4 py-3 text-white">
            <div>
              <h2 className="font-bold">Chats</h2>
              <p className="text-xs text-slate-300">
                {socket?.connected ? `${socket.onlineUsers?.length || 0} active` : socket?.available ? "Connecting..." : "Chat unavailable"}
              </p>
            </div>
            <div className="flex gap-1">
              <button className="rounded-lg p-1.5 text-xs font-medium text-white/80 hover:bg-white/10" onClick={openFullChat}>
                Full view
              </button>
              <button className="rounded-lg p-1.5 hover:bg-white/10" onClick={() => setOpen(false)} aria-label="Close chat">
                <X size={18} />
              </button>
            </div>
          </header>

          {activeConv ? (
            <>
              <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2">
                <button className="rounded-lg p-1 text-slate-500 hover:bg-slate-200" onClick={() => { setActiveConv(null); setMessages([]); }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                </button>
                <span className="text-sm font-semibold text-ink">
                  {activeConv.participants?.find((p) => (p._id || p.id) !== userId)?.name || "Chat"}
                </span>
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto bg-gradient-to-b from-slate-50 to-white p-3">
                {messages.map((msg) => {
                  const mine = (msg.sender?._id || msg.sender?.id || msg.sender) === userId;
                  return (
                    <div key={msg._id || msg.createdAt} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${mine ? "bg-gradient-primary text-white rounded-br-md" : "bg-white text-slate-800 shadow-sm border border-slate-100 rounded-bl-md"}`}>
                        <p>{msg.message}</p>
                        <p className={`mt-1 text-right text-[10px] ${mine ? "text-white/70" : "text-slate-400"}`}>
                          {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : ""}
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
              <form onSubmit={handleSubmit} className="flex gap-2 border-t border-slate-200 bg-white p-3">
                <input
                  className="input flex-1"
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    socket?.sendTyping({ conversationId: activeConv._id, isTyping: Boolean(e.target.value) });
                  }}
                  placeholder="Type a message..."
                />
                <button className="btn-primary px-3" type="submit" disabled={!text.trim()} aria-label="Send message">
                  <Send size={17} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-1 flex-col overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
                  <MessageCircle className="text-slate-300" size={36} />
                  <p className="mt-3 text-sm font-semibold text-slate-500">No conversations</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {user.role === "user" ? 'Chat with owners from property pages' : 'User chats appear here'}
                  </p>
                </div>
              ) : (
                conversations.map((conv) => {
                  const other = conv.participants?.find((p) => (p._id || p.id) !== userId);
                  const otherId = other?._id || other?.id;
                  const isOnline = socket?.onlineUsers?.some((onlineUser) => onlineUser.id === otherId);
                  return (
                    <button
                      key={conv._id}
                      className="flex items-center gap-3 px-4 py-3 text-left transition hover:bg-primary-50/50"
                      onClick={() => setActiveConv(conv)}
                    >
                      <div className="relative shrink-0">
                        <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-primary text-sm font-bold text-white">
                          {other?.name?.[0]?.toUpperCase() || "U"}
                        </div>
                        <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${isOnline ? "bg-emerald-500" : "bg-slate-400"}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-bold text-ink">{other?.name || "User"}</p>
                          <span className="shrink-0 text-xs text-slate-400">
                            {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : ""}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-sm text-slate-500">{conv.lastMessage || "Start chatting"}</p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </section>
      )}

      <button className="btn-primary h-12 rounded-full px-4 shadow-xl" onClick={() => setOpen((v) => !v)}>
        <MessageCircle size={19} /> Chat
      </button>
    </div>
  );
}
