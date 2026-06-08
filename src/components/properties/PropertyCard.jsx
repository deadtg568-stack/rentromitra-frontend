import { motion } from "framer-motion";
import { GraduationCap, Heart, MapPin, MessageCircle, ShieldCheck, Star, Wifi, Utensils, Car } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { getOrCreateConversation } from "../../services/chatService.js";

const amenityIcons = {
  WiFi: Wifi,
  Food: Utensils,
  Parking: Car
};

export function PropertyCard({ property, onWishlist, index = 0 }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const lowestRent = property.rooms?.length
    ? Math.min(...property.rooms.map((room) => room.monthlyRent))
    : property.price || 0;

  const amenities = (property.amenities || []).slice(0, 3);
  const availableBeds = property.rooms?.length
    ? property.rooms.reduce((total, room) => total + Number(room.availableBeds || 0), 0)
    : Number(property.availableRooms || 0);
  const isBooked = availableBeds <= 0;

  async function startChat() {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "user") {
      navigate("/chat");
      return;
    }

    try {
      const conversation = await getOrCreateConversation(property._id);
      navigate("/chat", { state: { conversationId: conversation._id } });
    } catch (error) {
      showToast({ type: "error", title: "Chat error", message: error.message });
    }
  }

  return (
    <motion.article
      className="group panel overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      whileHover={{ y: -6 }}
    >
      <div className="relative overflow-hidden">
        <Link to={`/properties/${property._id}`}>
          <img
            className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
            src={property.images?.[0]?.url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80"}
            alt={property.title}
          />
        </Link>
        <span className="absolute left-4 top-4 rounded-xl bg-gradient-primary px-3 py-1.5 text-sm font-bold text-white shadow-soft">
          Rs {lowestRent.toLocaleString("en-IN")}<span className="text-xs font-medium opacity-90">/mo</span>
        </span>
        <span className={`absolute bottom-4 left-4 rounded-xl px-3 py-1.5 text-sm font-bold shadow-soft ${isBooked ? "bg-red-600 text-white" : "bg-emerald-600 text-white"}`}>
          {isBooked ? "Booked" : "Available"}
        </span>
        <button
          type="button"
          className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-xl bg-white/95 text-slate-500 shadow-md backdrop-blur transition hover:scale-110 hover:text-rose-500"
          onClick={() => onWishlist?.(property._id)}
          aria-label="Toggle wishlist"
        >
          <Heart size={18} />
        </button>
      </div>

      <div className="space-y-3 p-5">
        <motion.div className="flex items-start justify-between gap-3">
          <div>
            <Link to={`/properties/${property._id}`} className="text-lg font-bold text-ink transition hover:text-primary-600">
              {property.title}
            </Link>
            <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
              <MapPin size={14} className="shrink-0 text-primary-500" /> {property.area || property.locality}, {property.city}
            </p>
            {(property.nearbyCollege || property.nearbyColleges?.[0]) && (
              <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                <GraduationCap size={14} className="shrink-0 text-accent-500" /> Near {property.nearbyCollege || property.nearbyColleges[0]}
              </p>
            )}
          </div>
          <span className="flex shrink-0 items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-sm font-semibold text-amber-700">
            <Star size={14} className="fill-amber-500 text-amber-500" /> {property.ratingAverage || "New"}
          </span>
        </motion.div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="badge-primary uppercase">{property.type || property.propertyType}</span>
          {(property.status === "approved" || property.ownerVerification?.status === "verified") && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <ShieldCheck size={13} /> Verified
            </span>
          )}
        </div>

        {amenities.length > 0 && (
          <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3">
            {amenities.map((item) => {
              const Icon = amenityIcons[item] || Wifi;
              return (
                <span key={item} className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                  <Icon size={12} /> {item}
                </span>
              );
            })}
          </div>
        )}

        <div className="grid gap-2 sm:grid-cols-2">
          <Link to={`/properties/${property._id}`} className="btn-primary mt-1 w-full">
            View details
          </Link>
          <button className="btn-muted mt-1 w-full" type="button" onClick={startChat}>
            <MessageCircle size={16} /> Chat
          </button>
        </div>
      </div>
    </motion.article>
  );
}
