import { motion } from "framer-motion";
import { CalendarCheck, GraduationCap, MapPin, MessageCircle, Phone, ShieldCheck, Star, Wifi } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { MapPicker } from "../components/maps/MapPicker.jsx";
import { PageTransition } from "../components/ui/PageTransition.jsx";
import { PropertyCardSkeleton } from "../components/ui/Skeleton.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { getOrCreateConversation } from "../services/chatService.js";

const sharingTypeLabels = {
  single: "Single",
  double: "Double",
  triple: "Triple",
  four_plus: "Four plus"
};

const roomTypeLabels = {
  "1_bhk": "1 BHK",
  "2_bhk": "2 BHK",
  "3_bhk": "3 BHK",
  flat: "Flat"
};

function displaySharingType(room) {
  return sharingTypeLabels[room.sharingType] || "Double";
}

function displayRoomType(room) {
  return roomTypeLabels[room.roomType] || roomTypeLabels[room.sharingType] || "1 BHK";
}

export function PropertyDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [booking, setBooking] = useState({ moveInDate: "", months: 1, occupants: 1, notes: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/properties/${id}`)
      .then((res) => setProperty(res.data.property))
      .finally(() => setLoading(false));
  }, [id]);

  async function book(roomId) {
    setMessage("");
    try {
      await api.post("/bookings", { ...booking, property: id, room: roomId });
      setMessage("Booking request sent successfully.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  if (loading) {
    return (
      <PageTransition>
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="skeleton h-96 rounded-3xl" />
          <PropertyCardSkeleton />
        </div>
      </PageTransition>
    );
  }

  if (!property) return <p className="text-sm text-slate-600">Property not found.</p>;

  const lowestRent = property.rooms?.length
    ? Math.min(...property.rooms.map((room) => room.monthlyRent))
    : property.price || 0;
  const mapLocation = property.location?.lat && property.location?.lng
    ? property.location
    : property.coordinates?.lat && property.coordinates?.lng
      ? { address: property.address, lat: property.coordinates.lat, lng: property.coordinates.lng }
      : null;
  const mapUrl = mapLocation
    ? `https://www.google.com/maps/search/?api=1&query=${mapLocation.lat},${mapLocation.lng}`
    : "";

  return (
    <PageTransition className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <section className="space-y-6">
        <motion.div className="relative overflow-hidden rounded-3xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <img
            className="h-[420px] w-full object-cover"
            src={property.images?.[0]?.url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80"}
            alt={property.title}
          />
          <span className="absolute left-5 top-5 rounded-2xl bg-gradient-primary px-4 py-2 text-lg font-bold text-white shadow-soft">
            From Rs {lowestRent.toLocaleString("en-IN")}/mo
          </span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <p className="badge-primary uppercase">{property.type} in Bhopal</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{property.title}</h1>
          <p className="mt-3 flex items-center gap-2 text-slate-600">
            <MapPin size={18} className="text-primary-500" />
            {property.address}, {property.area || property.locality}, {property.city}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-sm font-semibold text-slate-600">
            <span className="rounded-full bg-primary-50 px-3 py-1 text-primary-700">{property.area || property.locality}</span>
            {(property.nearbyCollege || property.nearbyColleges?.[0]) && (
              <span className="rounded-full bg-accent-50 px-3 py-1 text-accent-600">Near {property.nearbyCollege || property.nearbyColleges[0]}</span>
            )}
            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{property.city}</span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {(property.status === "approved" || property.ownerVerification?.status === "verified") && (
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-700">
                <ShieldCheck size={16} /> Verified local owner
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
              <Star size={14} className="fill-amber-500" /> {property.ratingAverage || "New listing"}
            </span>
          </div>
        </motion.div>

        <motion.p className="text-base leading-8 text-slate-700" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
          {property.description}
        </motion.p>

        <motion.div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 }}>
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase text-slate-500">Rent</p>
            <p className="mt-1 font-bold text-ink">{property.rentNegotiable ? "Negotiable" : "Fixed"}</p>
          </div>
          {["pg", "hostel"].includes(property.propertyType || property.type) && (
            <>
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Food</p>
                <p className="mt-1 font-bold text-ink">{property.foodAvailable ? (property.foodIncluded ? "Included" : `Available - Rs ${Number(property.foodCharges || 0).toLocaleString("en-IN")}`) : "Not available"}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Facilities</p>
                <p className="mt-1 font-bold text-ink">{[property.wifiAvailable && "WiFi", property.laundryAvailable && "Laundry"].filter(Boolean).join(", ") || "Not listed"}</p>
              </div>
            </>
          )}
        </motion.div>

        {!!property.nearbyColleges?.length && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <h2 className="text-lg font-bold text-ink">Nearby colleges</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {property.nearbyColleges.map((college) => (
                <span key={college} className="inline-flex items-center gap-2 rounded-xl bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700">
                  <GraduationCap size={14} /> {college}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {mapLocation && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.28 }}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-ink">Property location</h2>
              <a className="btn-muted" href={mapUrl} target="_blank" rel="noreferrer">
                <MapPin size={16} /> View on Map
              </a>
            </div>
            <MapPicker location={mapLocation} readOnly height="h-80" />
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
          <h2 className="text-lg font-bold text-ink">Amenities</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {property.amenities?.map((item) => (
              <span key={item} className="glass inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700">
                <Wifi size={14} className="text-primary-500" /> {item}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      <aside className="glass h-fit space-y-5 p-6 lg:sticky lg:top-24">
        <h2 className="text-xl font-extrabold text-ink">Book a room</h2>
        {message && (
          <motion.p
            className={`rounded-xl p-3 text-sm font-medium ${message.includes("success") ? "bg-emerald-50 text-emerald-700" : "bg-primary-50 text-primary-700"}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {message}
          </motion.p>
        )}
        {user?.role === "user" && (
          <div className="grid gap-3">
            <label className="block">
              <span className="mb-1 text-xs font-bold uppercase text-slate-500">Move-in date</span>
              <input className="input" type="date" value={booking.moveInDate} onChange={(e) => setBooking({ ...booking, moveInDate: e.target.value })} />
            </label>
            <label className="block">
              <span className="mb-1 text-xs font-bold uppercase text-slate-500">Months</span>
              <input className="input" type="number" min="1" value={booking.months} onChange={(e) => setBooking({ ...booking, months: e.target.value })} />
            </label>
            <label className="block">
              <span className="mb-1 text-xs font-bold uppercase text-slate-500">Occupants</span>
              <input className="input" type="number" min="1" value={booking.occupants} onChange={(e) => setBooking({ ...booking, occupants: e.target.value })} />
            </label>
          </div>
        )}
        {property.rooms?.map((room, i) => {
          const isBooked = Number(room.availableBeds || 0) <= 0;

          return (
          <motion.div
            key={room._id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
          >
            <div className="flex justify-between gap-3">
              <div>
                <p className="font-bold text-ink">{room.title}</p>
                <p className="text-sm text-slate-500">
                  {room.availableBeds} of {room.totalBeds} beds available · {displaySharingType(room)} · {displayRoomType(room)}
                </p>
                <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${isBooked ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
                  {isBooked ? "Booked" : "Available"}
                </span>
              </div>
              <p className="text-lg font-extrabold text-primary-700">Rs {room.monthlyRent?.toLocaleString("en-IN")}</p>
            </div>
            {user?.role === "user" && (
              <button className="btn-primary mt-4 w-full" type="button" onClick={() => book(room._id)} disabled={isBooked}>
                <CalendarCheck size={16} /> {isBooked ? "Booked" : "Request booking"}
              </button>
            )}
          </motion.div>
          );
        })}
        {user?.role === "user" && (
          <button
            className="btn-accent mt-3 w-full"
            onClick={async () => {
              try {
                const conv = await getOrCreateConversation(property._id);
                navigate("/chat", { state: { conversationId: conv._id } });
              } catch (err) {
                showToast({ type: "error", title: "Chat error", message: err.message });
              }
            }}
          >
            <MessageCircle size={16} /> Chat with Owner
          </button>
        )}
        <p className="flex items-center gap-2 text-sm text-slate-500">
          <Phone size={16} className="text-primary-500" /> Owner contact appears after booking approval.
        </p>
      </aside>
    </PageTransition>
  );
}
