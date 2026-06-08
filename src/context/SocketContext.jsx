import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "./AuthContext.jsx";

const SocketContext = createContext(null);

function getSocketUrl() {
  if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL;
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "");
  return window.location.origin;
}

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [available, setAvailable] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [conversationUpdates, setConversationUpdates] = useState([]);
  const [bookingUpdates, setBookingUpdates] = useState([]);
  const [notificationEvents, setNotificationEvents] = useState([]);
  const [notificationCounts, setNotificationCounts] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("rentromitra_token");

    if (!user || !token) {
      socketRef.current?.disconnect?.();
      socketRef.current = null;
      setConnected(false);
      setMessages([]);
      setConversationUpdates([]);
      setBookingUpdates([]);
      setNotificationEvents([]);
      setNotificationCounts([]);
      return;
    }

    let cancelled = false;

    async function connectSocket() {
      try {
        const moduleName = "socket.io-client";
        const { io } = await import(/* @vite-ignore */ moduleName);
        if (cancelled) return;

        const socket = io(getSocketUrl(), {
          auth: { token },
          transports: ["websocket", "polling"]
        });

        socketRef.current = socket;
        socket.on("connect", () => setConnected(true));
        socket.on("disconnect", () => setConnected(false));
        socket.on("presence:update", setOnlineUsers);
        socket.on("chat:message", (message) => setMessages((current) => [...current, message]));
        socket.on("conversation:update", (conversation) => setConversationUpdates((current) => [...current, conversation]));
        socket.on("booking:created", (booking) => setBookingUpdates((current) => [...current, { type: "created", booking }]));
        socket.on("booking:updated", (booking) => setBookingUpdates((current) => [...current, { type: "updated", booking }]));
        socket.on("notification:new", (payload) => setNotificationEvents((current) => [...current, payload]));
        socket.on("notification:unread-count", (payload) => setNotificationCounts((current) => [...current, payload]));
        socket.on("chat:typing", ({ conversationId, user: typingUser, isTyping }) => {
          setTypingUsers((current) => ({
            ...current,
            [conversationId]: isTyping ? typingUser : null
          }));
        });
      } catch {
        setAvailable(false);
      }
    }

    connectSocket();

    return () => {
      cancelled = true;
      socketRef.current?.disconnect?.();
      socketRef.current = null;
    };
  }, [user]);

  function joinRoom(room) {
    socketRef.current?.emit("chat:join", { room });
  }

  function leaveRoom(room) {
    socketRef.current?.emit("chat:leave", { room });
  }

  function sendMessage(payload) {
    socketRef.current?.emit("chat:message", payload);
  }

  function sendTyping(payload) {
    socketRef.current?.emit("chat:typing", payload);
  }

  const value = useMemo(
    () => ({
      available,
      connected,
      onlineUsers,
      messages,
      setMessages,
      conversationUpdates,
      bookingUpdates,
      notificationEvents,
      notificationCounts,
      typingUsers,
      joinRoom,
      leaveRoom,
      sendMessage,
      sendTyping
    }),
    [available, connected, onlineUsers, messages, conversationUpdates, bookingUpdates, notificationEvents, notificationCounts, typingUsers]
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  return useContext(SocketContext);
}
