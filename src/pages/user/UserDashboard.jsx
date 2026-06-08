import {
  BookmarkCheck,
  CalendarCheck,
  Heart,
  Home,
  IndianRupee,
  LayoutDashboard,
  MapPin,
  MessageCircle,
  Pencil,
  Save,
  UserRound
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FormField } from "../../components/common/FormField.jsx";
import { StatCard } from "../../components/common/StatCard.jsx";
import { PageTransition } from "../../components/ui/PageTransition.jsx";
import { NotificationBell } from "../../components/notifications/NotificationBell.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { getDashboardData, removeWishlistProperty, updateProfile } from "../../services/dashboardService.js";
import { getOrCreateConversation, getUserConversations } from "../../services/chatService.js";
import { useSocket } from "../../context/SocketContext.jsx";
import { useNavigate } from "react-router-dom";

const tabs = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "bookings", label: "Bookings", icon: CalendarCheck },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "saved", label: "Saved", icon: BookmarkCheck },
  { id: "chat", label: "Chats", icon: MessageCircle }
];

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

function ChatListEmbed() {
  const { user } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();
  const userId = user?._id || user?.id;
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserConversations().then(setConversations).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-4"><div className="skeleton h-16 rounded-xl" /><div className="skeleton mt-2 h-16 rounded-xl" /></div>;

  if (!conversations.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <MessageCircle className="text-slate-300" size={40} />
        <p className="mt-3 text-sm font-semibold text-slate-500">No conversations yet</p>
        <p className="mt-1 text-xs text-slate-400">Chat with a property owner to get started</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {conversations.map((conv) => {
        const other = conv.participants?.find((p) => (p._id || p.id) !== userId);
        const isOnline = socket?.onlineUsers?.some((u) => u.id === (other?._id || other?.id));
        return (
          <button
            key={conv._id}
            className="flex w-full items-center gap-3 px-5 py-3 text-left transition hover:bg-primary-50/50"
            onClick={() => navigate("/chat", { state: { conversationId: conv._id } })}
          >
            <div className="relative shrink-0">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-primary text-sm font-bold text-white">
                {other?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${isOnline ? "bg-emerald-500" : "bg-slate-400"}`} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-bold text-ink">{other?.name || "Owner"}</p>
                <span className="shrink-0 text-xs text-slate-400">{formatTime(conv.lastMessageAt || conv.updatedAt)}</span>
              </div>
              {conv.property && <p className="truncate text-xs text-primary-600">{conv.property.title}</p>}
              <p className="mt-0.5 truncate text-sm text-slate-500">{conv.lastMessage || "Tap to start chatting"}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function formatDate(date) {
  if (!date) return "Not set";
  return new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function propertyPrice(property) {
  if (property?.price) return property.price;
  if (property?.rooms?.length) return Math.min(...property.rooms.map((room) => room.monthlyRent || 0));
  return 0;
}

function statusClass(status) {
  const styles = {
    approved: "bg-emerald-50 text-emerald-700",
    completed: "bg-primary-50 text-primary-700",
    rejected: "bg-red-50 text-red-700",
    cancelled: "bg-slate-100 text-slate-600",
    pending: "bg-amber-50 text-amber-700"
  };

  return styles[status] || styles.pending;
}

function EmptyState({ title, copy, action }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <h3 className="text-lg font-bold text-ink">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">{copy}</p>
      {action}
    </div>
  );
}

function PropertyMiniCard({ item, onRemove }) {
  const property = item.property || item;
  const price = propertyPrice(property);

  return (
    <motion.article className="glass p-4" whileHover={{ y: -2 }}>
      <div className="flex gap-3">
        <img
          className="h-24 w-28 rounded-md object-cover"
          src={property.images?.[0]?.url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=500&q=80"}
          alt={property.title}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link className="font-bold text-ink hover:text-primary" to={`/properties/${property._id}`}>
                {property.title}
              </Link>
              <p className="mt-1 flex items-center gap-1 text-sm text-slate-600">
                <MapPin size={14} /> {property.locality || property.city}, {property.city}
              </p>
            </div>
            {onRemove && (
              <button className="rounded-md p-2 text-rose-600 hover:bg-rose-50" onClick={() => onRemove(property._id)} aria-label="Remove from wishlist">
                <Heart size={17} className="fill-current" />
              </button>
            )}
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <span className="rounded-md bg-teal-50 px-2 py-1 text-xs font-bold uppercase text-primary">{property.propertyType || property.type || "Property"}</span>
            <span className="font-bold text-ink">Rs {price.toLocaleString("en-IN")}<span className="text-xs font-medium text-slate-500"> / month</span></span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export function UserDashboard() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const socket = useSocket();
  const [activeTab, setActiveTab] = useState("overview");
  const [bookings, setBookings] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({ name: "", phone: "", city: "" });

  useEffect(() => {
    setProfile({ name: user?.name || "", phone: user?.phone || "", city: user?.city || "" });
  }, [user]);

  async function loadDashboard() {
    setLoading(true);
    try {
      const data = await getDashboardData();
      setBookings(data.bookings);
      setWishlist(data.wishlist);
    } catch (error) {
      showToast({ type: "error", title: "Dashboard load failed", message: error.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    if (!socket?.bookingUpdates?.length) return;
    const latest = socket.bookingUpdates[socket.bookingUpdates.length - 1];
    if (!latest?.booking) return;

    setBookings((current) => {
      const exists = current.some((booking) => booking._id === latest.booking._id);
      if (exists) return current.map((booking) => (booking._id === latest.booking._id ? latest.booking : booking));
      return [latest.booking, ...current];
    });
  }, [socket?.bookingUpdates]);

  const savedProperties = useMemo(() => wishlist.map((item) => item.property).filter(Boolean), [wishlist]);
  const upcomingBookings = bookings.filter((booking) => ["pending", "approved"].includes(booking.status));
  const totalBookedAmount = bookings.reduce((total, booking) => total + Number(booking.totalAmount || 0), 0);

  async function handleProfileSubmit(event) {
    event.preventDefault();
    if (!profile.name.trim()) {
      showToast({ type: "error", title: "Name required", message: "Please enter your full name." });
      return;
    }

    setSaving(true);
    try {
      const nextUser = await updateProfile(profile);
      updateUser(nextUser);
      showToast({ type: "success", title: "Profile updated", message: "Your dashboard profile is up to date." });
    } catch (error) {
      showToast({ type: "error", title: "Profile update failed", message: error.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveWishlist(propertyId) {
    try {
      await removeWishlistProperty(propertyId);
      setWishlist((current) => current.filter((item) => item.property?._id !== propertyId));
      showToast({ type: "success", title: "Removed from wishlist" });
    } catch (error) {
      showToast({ type: "error", title: "Could not update wishlist", message: error.message });
    }
  }

  async function openBookingChat(booking) {
    try {
      const conversationId = booking.chatConversation?._id || booking.chatConversation;
      if (conversationId) {
        navigate("/chat", { state: { conversationId } });
        return;
      }

      const propertyId = booking.property?._id || booking.property;
      const conversation = await getOrCreateConversation(propertyId);
      navigate("/chat", { state: { conversationId: conversation._id } });
    } catch (error) {
      showToast({ type: "error", title: "Chat unavailable", message: error.message });
    }
  }

  return (
    <PageTransition>
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="panel h-fit overflow-hidden">
        <div className="bg-gradient-hero p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-md bg-white/10 text-lg font-bold">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <p className="truncate font-bold">{user?.name || "Rentomitra User"}</p>
              <p className="truncate text-sm text-slate-300">{user?.email}</p>
            </div>
          </div>
        </div>
        <nav className="grid gap-1 p-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                  active ? "bg-gradient-primary text-white shadow-soft" : "text-slate-600 hover:bg-primary-50 hover:text-primary-700"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={17} /> {tab.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="space-y-5">
        <section className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold uppercase text-primary">User Dashboard</p>
            <h1 className="mt-1 text-3xl font-bold text-ink">Welcome, {user?.name?.split(" ")?.[0] || "there"}</h1>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <Link className="btn-primary" to="/">
              <Home size={17} /> Explore properties
            </Link>
          </div>
        </section>

        {activeTab === "overview" && (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Bookings" value={bookings.length} />
              <StatCard label="Upcoming" value={upcomingBookings.length} />
              <StatCard label="Wishlist" value={wishlist.length} />
              <StatCard label="Booked Value" value={`Rs ${totalBookedAmount.toLocaleString("en-IN")}`} />
            </div>

            <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="glass p-5">
                <h2 className="mb-3 text-lg font-bold">Recent Bookings</h2>
                {loading ? (
                  <p className="text-sm text-slate-600">Loading bookings...</p>
                ) : bookings.length ? (
                  <div className="grid gap-3">
                    {bookings.slice(0, 3).map((booking) => (
                      <div key={booking._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                        <div>
                          <p className="font-bold">{booking.property?.title || "Property"}</p>
                          <p className="text-sm text-slate-600">{formatDate(booking.moveInDate)}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusClass(booking.status)}`}>{booking.status}</span>
                          {booking.status === "approved" && (
                            <button className="btn-muted px-3 py-1.5 text-xs" type="button" onClick={() => openBookingChat(booking)}>
                              <MessageCircle size={14} /> Chat
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No bookings yet" copy="When you request a booking, it will appear here with status and move-in details." />
                )}
              </div>

              <div className="glass p-5">
                <h2 className="mb-3 text-lg font-bold">Saved Properties</h2>
                {wishlist.length ? (
                  <div className="grid gap-3">
                    {wishlist.slice(0, 2).map((item) => (
                      <PropertyMiniCard key={item._id} item={item} onRemove={handleRemoveWishlist} />
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No saved properties" copy="Tap the heart on a listing to keep it here for later comparison." />
                )}
              </div>
            </section>
          </>
        )}

        {activeTab === "profile" && (
          <section className="glass p-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary-50 text-primary-600">
                <Pencil size={20} />
              </span>
              <div>
                <h2 className="text-xl font-bold">Edit Profile</h2>
                <p className="text-sm text-slate-600">Update the details shown in your Rentomitra account.</p>
              </div>
            </div>
            <form onSubmit={handleProfileSubmit} className="grid gap-4 md:grid-cols-2">
              <FormField label="Full name" value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} />
              <FormField label="Email" value={user?.email || ""} disabled />
              <FormField label="Phone" value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} />
              <FormField label="City" value={profile.city} onChange={(event) => setProfile({ ...profile, city: event.target.value })} />
              <button className="btn-primary h-11 md:col-span-2" type="submit" disabled={saving}>
                <Save size={17} /> {saving ? "Saving..." : "Save profile"}
              </button>
            </form>
          </section>
        )}

        {activeTab === "bookings" && (
          <section className="glass p-5 overflow-hidden">
            <h2 className="mb-3 text-lg font-bold">Booking History</h2>
            {bookings.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead className="border-b text-slate-500">
                    <tr>
                      <th className="py-2">Property</th>
                      <th>Status</th>
                      <th>Move-in</th>
                      <th>Occupants</th>
                      <th>Amount</th>
                      <th>Chat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking._id} className="border-b last:border-0">
                        <td className="py-3 font-semibold">{booking.property?.title || "Property"}</td>
                        <td><span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusClass(booking.status)}`}>{booking.status}</span></td>
                        <td>{formatDate(booking.moveInDate)}</td>
                        <td>{booking.occupants}</td>
                        <td><span className="inline-flex items-center gap-1 font-bold"><IndianRupee size={14} />{booking.totalAmount?.toLocaleString("en-IN")}</span></td>
                        <td>
                          {booking.status === "approved" ? (
                            <button className="btn-muted px-3 py-1.5 text-xs" type="button" onClick={() => openBookingChat(booking)}>
                              <MessageCircle size={14} /> Chat
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400">After approval</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState title="No booking history" copy="Your booking requests and approved stays will show up here." />
            )}
          </section>
        )}

        {activeTab === "wishlist" && (
          <section className="glass p-5">
            <h2 className="mb-3 text-lg font-bold">Wishlist</h2>
            {wishlist.length ? (
              <div className="grid gap-3">
                {wishlist.map((item) => (
                  <PropertyMiniCard key={item._id} item={item} onRemove={handleRemoveWishlist} />
                ))}
              </div>
            ) : (
              <EmptyState title="Wishlist is empty" copy="Save properties from the home page to build your shortlist." action={<Link className="btn-primary mt-4" to="/">Browse properties</Link>} />
            )}
          </section>
        )}

        {activeTab === "saved" && (
          <section className="glass p-5">
            <h2 className="mb-3 text-lg font-bold">Saved Properties</h2>
            {savedProperties.length ? (
              <div className="grid gap-4 xl:grid-cols-2">
                {savedProperties.map((property) => (
                  <PropertyMiniCard key={property._id} item={property} />
                ))}
              </div>
            ) : (
              <EmptyState title="No saved properties yet" copy="Saved properties are pulled from your wishlist for quick comparison." />
            )}
          </section>
        )}

        {activeTab === "chat" && (
          <section className="glass overflow-hidden p-0">
            <div className="border-b border-slate-200 p-5 pb-4">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <MessageCircle size={20} className="text-primary" /> My Chats
              </h2>
              <p className="mt-1 text-sm text-slate-600">Conversations with property owners</p>
            </div>
            <div className="h-[500px] overflow-y-auto">
              <ChatListEmbed />
            </div>
          </section>
        )}
      </main>
    </div>
    </PageTransition>
  );
}
