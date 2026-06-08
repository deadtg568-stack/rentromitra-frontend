import {
  BarChart3,
  BedDouble,
  Building2,
  CalendarCheck,
  CheckCircle2,
  Edit3,
  ImagePlus,
  IndianRupee,
  LayoutDashboard,
  MapPin,
  MessageCircle,
  Plus,
  Save,
  Trash2,
  UploadCloud,
  UsersRound,
  XCircle
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FormField } from "../../components/common/FormField.jsx";
import { MapPicker } from "../../components/maps/MapPicker.jsx";
import { StatCard } from "../../components/common/StatCard.jsx";
import { PageTransition } from "../../components/ui/PageTransition.jsx";
import { NotificationBell } from "../../components/notifications/NotificationBell.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { BHOPAL_ZONES } from "../../data/bhopal.js";
import { useBhopalLocations } from "../../hooks/useBhopalLocations.js";
import {
  createProperty,
  deleteProperty,
  getAdminDashboardData,
  updateBookingStatus,
  updateProperty
} from "../../services/adminService.js";
import { updateProfile } from "../../services/dashboardService.js";
import { useSocket } from "../../context/SocketContext.jsx";
import { getUserConversations } from "../../services/chatService.js";

const emptyProperty = {
  title: "",
  description: "",
  type: "pg",
  genderPreference: "any",
  address: "",
  city: "Bhopal",
  area: "",
  locality: "",
  nearbyCollege: "",
  areaZone: "central",
  state: "Madhya Pradesh",
  pincode: "",
  nearbyColleges: "",
  ownerVerification: { status: "pending", documentType: "aadhaar", notes: "" },
  rentNegotiable: false,
  foodAvailable: false,
  foodIncluded: false,
  foodCharges: 0,
  laundryAvailable: false,
  wifiAvailable: false,
  amenities: "WiFi, Food, Laundry",
  images: [],
  location: { address: "", lat: "", lng: "" },
  coordinates: { lat: "", lng: "" },
  rooms: [{ title: "Standard Bed", sharingType: "double", roomType: "1_bhk", monthlyRent: 8000, deposit: 8000, totalBeds: 2, availableBeds: 2 }],
  isPublished: false,
  isVerified: false
};

const tabs = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
  { id: "properties", label: "Add Property", icon: Plus, path: "/admin/add-property" },
  { id: "manage", label: "Manage Properties", icon: Building2, path: "/admin/manage-properties" },
  { id: "bookings", label: "Bookings", icon: CalendarCheck, path: "/admin/bookings" },
  { id: "tenants", label: "Tenants", icon: UsersRound, path: "/admin/tenants" },
  { id: "chat", label: "Chats", icon: MessageCircle, path: "/admin/chats" },
  { id: "profile", label: "Profile", icon: BedDouble, path: "/admin/profile" }
];

function normalizeCsv(value) {
  if (Array.isArray(value)) return value;
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function firstRoom(property) {
  return property.rooms?.[0] || emptyProperty.rooms[0];
}

const sharingTypes = ["single", "double", "triple", "four_plus"];
const roomTypes = ["1_bhk", "2_bhk", "3_bhk", "flat"];

function formFromProperty(property) {
  const room = firstRoom(property);
  const roomType = room.roomType || (roomTypes.includes(room.sharingType) ? room.sharingType : "1_bhk");
  const sharingType = sharingTypes.includes(room.sharingType) ? room.sharingType : "double";

  return {
    ...emptyProperty,
    ...property,
    type: property.propertyType || property.type || "pg",
    genderPreference: property.genderType || property.genderPreference || "any",
    area: property.area || property.locality || "",
    locality: property.area || property.locality || "",
    nearbyCollege: property.nearbyCollege || property.nearbyColleges?.[0] || "",
    amenities: (property.amenities || []).join(", "),
    nearbyColleges: (property.nearbyColleges || []).join(", "),
    ownerVerification: property.ownerVerification || emptyProperty.ownerVerification,
    coordinates: {
      lat: property.coordinates?.lat || "",
      lng: property.coordinates?.lng || ""
    },
    location: property.location || {
      address: property.address || "",
      lat: property.coordinates?.lat || "",
      lng: property.coordinates?.lng || ""
    },
    rooms: [
      {
        title: room.title || "Standard Bed",
        sharingType,
        roomType,
        monthlyRent: room.monthlyRent || property.price || 8000,
        deposit: room.deposit || 0,
        totalBeds: room.totalBeds ?? property.availableRooms ?? 0,
        availableBeds: room.availableBeds ?? property.availableRooms ?? 0
      }
    ]
  };
}

function payloadFromForm(form) {
  const payload = {
    ...form,
    propertyType: form.type,
    genderType: form.genderPreference,
    city: "Bhopal",
    area: form.area,
    locality: form.area,
    nearbyCollege: form.nearbyCollege,
    amenities: normalizeCsv(form.amenities),
    nearbyColleges: form.nearbyCollege ? [form.nearbyCollege] : normalizeCsv(form.nearbyColleges),
    price: Number(form.rooms[0].monthlyRent),
    rentNegotiable: Boolean(form.rentNegotiable),
    foodAvailable: Boolean(form.foodAvailable),
    foodIncluded: Boolean(form.foodIncluded),
    foodCharges: Number(form.foodCharges || 0),
    laundryAvailable: Boolean(form.laundryAvailable),
    wifiAvailable: Boolean(form.wifiAvailable),
    location: form.location?.lat && form.location?.lng ? {
      address: form.location.address || form.address,
      lat: Number(form.location.lat),
      lng: Number(form.location.lng)
    } : undefined,
    availableRooms: Number(form.rooms[0].availableBeds),
    rooms: form.rooms.map((room) => ({
      ...room,
      monthlyRent: Number(room.monthlyRent),
      deposit: Number(room.deposit || 0),
      totalBeds: Number(room.totalBeds || 0),
      availableBeds: Number(room.availableBeds || 0)
    }))
  };

  return payload;
}

function validatePropertyForm(form) {
  const room = form.rooms[0];
  const errors = [];

  if (!form.title.trim()) errors.push("Title is required");
  if (!form.address.trim()) errors.push("Address is required");
  if (!form.area) errors.push("Area is required");
  if (!form.description.trim()) errors.push("Description is required");
  if (Number(room.monthlyRent) <= 0) errors.push("Monthly rent must be greater than 0");
  if (Number(room.totalBeds || 0) < 0) errors.push("Total beds cannot be negative");
  if (Number(room.availableBeds) < 0) errors.push("Available beds cannot be negative");
  if (Number(room.availableBeds || 0) > Number(room.totalBeds || 0)) errors.push("Available beds cannot exceed total beds");
  if (!form.location?.lat || !form.location?.lng) errors.push("Select the exact property location on the map");

  return errors;
}

function bookingStatusClass(status) {
  const styles = {
    approved: "bg-emerald-50 text-emerald-700",
    completed: "bg-primary-50 text-primary-700",
    rejected: "bg-red-50 text-red-700",
    cancelled: "bg-slate-100 text-slate-600",
    pending: "bg-amber-50 text-amber-700"
  };

  return styles[status] || styles.pending;
}

function propertyStatusClass(status) {
  const styles = {
    approved: "bg-emerald-50 text-emerald-700",
    pending: "bg-amber-50 text-amber-700",
    rejected: "bg-red-50 text-red-700"
  };

  return styles[status] || styles.pending;
}

function formatDate(date) {
  if (!date) return "Not set";
  return new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

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

function PropertyForm({ form, setForm, editingId, imagePreviews, onCancel, onImageChange, onSubmit, saving }) {
  const room = form.rooms[0];
  const setRoom = (field, value) => setForm({ ...form, rooms: [{ ...room, [field]: value }] });
  const isPgOrHostel = ["pg", "hostel"].includes(form.type);
  const { areaNames, collegeNames } = useBhopalLocations();
  const setBooleanField = (field, value) => setForm({ ...form, [field]: value === "true" });
  const setVerificationStatus = (status) => setForm({
    ...form,
    ownerVerification: { ...(form.ownerVerification || emptyProperty.ownerVerification), status }
  });
  const googleMapsUrl = form.location?.lat && form.location?.lng
    ? `https://www.google.com/maps/search/?api=1&query=${form.location.lat},${form.location.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${form.address || "Bhopal"}, Bhopal, Madhya Pradesh`)}`;

  return (
    <form onSubmit={onSubmit} className="glass grid gap-4 p-5 lg:grid-cols-3">
      <div className="lg:col-span-3">
        <h2 className="text-xl font-bold">{editingId ? "Edit Property" : "Add Property"}</h2>
        <p className="mt-1 text-sm text-slate-600">Create or update rooms, PGs, and hostels shown in Rentomitra search.</p>
      </div>

      <FormField label="Title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-slate-700">Property type</span>
        <select className="input" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
          <option value="pg">PG</option>
          <option value="hostel">Hostel</option>
          <option value="room">Room</option>
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-slate-700">Gender type</span>
        <select className="input" value={form.genderPreference} onChange={(event) => setForm({ ...form, genderPreference: event.target.value })}>
          <option value="any">Any</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-slate-700">Locality</span>
        <select className="input" value={form.area} onChange={(event) => setForm({ ...form, area: event.target.value, locality: event.target.value })} required>
          <option value="">Select Bhopal locality</option>
          {areaNames.map((area) => (
            <option key={area} value={area}>{area}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-slate-700">Area zone</span>
        <select className="input" value={form.areaZone} onChange={(event) => setForm({ ...form, areaZone: event.target.value })}>
          {BHOPAL_ZONES.map((zone) => (
            <option key={zone.value} value={zone.value}>{zone.label}</option>
          ))}
        </select>
      </label>
      <FormField label="Pincode" value={form.pincode} onChange={(event) => setForm({ ...form, pincode: event.target.value })} required />

      <FormField label="Address" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} required />
      <FormField label="Monthly rent" type="number" min="0" value={room.monthlyRent} onChange={(event) => setRoom("monthlyRent", event.target.value)} required />
      <FormField label="Deposit" type="number" min="0" value={room.deposit} onChange={(event) => setRoom("deposit", event.target.value)} />

      <FormField label="Room title" value={room.title} onChange={(event) => setRoom("title", event.target.value)} required />
      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-slate-700">Sharing type</span>
        <select className="input" value={room.sharingType} onChange={(event) => setRoom("sharingType", event.target.value)}>
          <option value="single">Single</option>
          <option value="double">Double</option>
          <option value="triple">Triple</option>
          <option value="four_plus">Four plus</option>
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-slate-700">Room type</span>
        <select className="input" value={room.roomType || "1_bhk"} onChange={(event) => setRoom("roomType", event.target.value)}>
          <option value="1_bhk">1 BHK</option>
          <option value="2_bhk">2 BHK</option>
          <option value="3_bhk">3 BHK</option>
          <option value="flat">Flat</option>
        </select>
      </label>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Total beds" type="number" min="0" value={room.totalBeds} onChange={(event) => setRoom("totalBeds", event.target.value)} />
        <FormField label="Available" type="number" min="0" value={room.availableBeds} onChange={(event) => setRoom("availableBeds", event.target.value)} required />
      </div>

      <FormField label="Amenities" value={form.amenities} onChange={(event) => setForm({ ...form, amenities: event.target.value })} placeholder="WiFi, Food, Laundry" />
      <FormField label="Nearby colleges" value={form.nearbyCollege} onChange={(event) => setForm({ ...form, nearbyCollege: event.target.value })} list="nearby-colleges" placeholder="MANIT Bhopal, Barkatullah University" />
      <datalist id="nearby-colleges">
        {collegeNames.map((college) => (
          <option key={college} value={college} />
        ))}
      </datalist>
      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-slate-700">Verification</span>
        <select className="input" value={form.ownerVerification?.status || "pending"} onChange={(event) => setVerificationStatus(event.target.value)}>
          <option value="pending">Pending</option>
          <option value="submitted">Submitted</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>
      </label>

      <div className="lg:col-span-3">
        <label className="block rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
          <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
            <UploadCloud size={18} /> Upload property images
          </span>
          <input className="block w-full text-sm text-slate-600" type="file" accept="image/*" multiple onChange={onImageChange} />
          <span className="mt-2 block text-xs text-slate-500">Images preview here first, then upload to Cloudinary during submission.</span>
        </label>
        {!!imagePreviews.length && (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {imagePreviews.map((src) => (
              <img key={src} className="h-28 w-full rounded-md object-cover" src={src} alt="Property preview" />
            ))}
          </div>
        )}
        {!imagePreviews.length && !editingId && (
          <div className="mt-3 flex items-center gap-2 rounded-md bg-white p-3 text-sm text-slate-500">
            <ImagePlus size={18} /> Select multiple images for better listing approval.
          </div>
        )}
      </div>

      <label className="lg:col-span-3">
        <span className="mb-1 block text-sm font-semibold text-slate-700">Description</span>
        <textarea className="input min-h-28" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-slate-700">Rent Negotiable</span>
        <select className="input" value={String(form.rentNegotiable)} onChange={(event) => setBooleanField("rentNegotiable", event.target.value)}>
          <option value="false">No</option>
          <option value="true">Yes</option>
        </select>
      </label>
      {isPgOrHostel && (
        <>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Food Available</span>
            <select className="input" value={String(form.foodAvailable)} onChange={(event) => setBooleanField("foodAvailable", event.target.value)}>
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Food Included in Rent</span>
            <select className="input" value={String(form.foodIncluded)} onChange={(event) => setBooleanField("foodIncluded", event.target.value)}>
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </label>
          <FormField label="Food Charges" type="number" min="0" value={form.foodCharges} onChange={(event) => setForm({ ...form, foodCharges: event.target.value })} />
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Laundry Available</span>
            <select className="input" value={String(form.laundryAvailable)} onChange={(event) => setBooleanField("laundryAvailable", event.target.value)}>
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">WiFi Available</span>
            <select className="input" value={String(form.wifiAvailable)} onChange={(event) => setBooleanField("wifiAvailable", event.target.value)}>
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </label>
        </>
      )}

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 lg:col-span-3">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className="block text-sm font-bold text-slate-800">Map Location</span>
            <span className="text-xs text-slate-500">Search or click on the map to place the marker.</span>
          </div>
          <a className="btn-muted px-4 py-2 text-xs" href={googleMapsUrl} target="_blank" rel="noreferrer">
            View on Google Map
          </a>
        </div>
        <MapPicker
          location={form.location}
          height="h-56"
          placeholder="Search address, locality, landmark"
          searchButtonLabel="Set Location"
          stackedSearch
          onChange={(location) => setForm({ ...form, location, address: location.address || form.address })}
        />
      </div>

      <div className="flex flex-wrap gap-3 lg:col-span-3">
        <button className="btn-primary" type="submit" disabled={saving}>
          {editingId ? <Save size={17} /> : <Plus size={17} />} {saving ? "Saving..." : editingId ? "Save Changes" : "Create Property"}
        </button>
        {editingId && (
          <button className="btn-muted" type="button" onClick={onCancel}>
            Cancel Edit
          </button>
        )}
      </div>
    </form>
  );
}

function AdminChatList() {
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
        <p className="mt-1 text-xs text-slate-400">When users message about your properties, they will appear here</p>
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
                <p className="truncate text-sm font-bold text-ink">{other?.name || "User"}</p>
                <span className="shrink-0 text-xs text-slate-400">{formatTime(conv.lastMessageAt || conv.updatedAt)}</span>
              </div>
              {conv.property && <p className="truncate text-xs text-primary-600">{conv.property.title}</p>}
              <p className="mt-0.5 truncate text-sm text-slate-500">{conv.lastMessage || "Tap to reply"}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function AdminDashboard({ initialTab = "overview" }) {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const socket = useSocket();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [propertyForm, setPropertyForm] = useState(emptyProperty);
  const [editingId, setEditingId] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({ name: "", phone: "", city: "" });

  async function load() {
    setLoading(true);
    try {
      const data = await getAdminDashboardData();
      setProperties(data.properties);
      setBookings(data.bookings);
    } catch (error) {
      showToast({ type: "error", title: "Admin data failed", message: error.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
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

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    setProfile({ name: user?.name || "", phone: user?.phone || "", city: user?.city || "" });
  }, [user]);

  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [imagePreviews]);

  const tenants = useMemo(() => {
    const map = new Map();
    bookings.forEach((booking) => {
      if (!booking.user?._id) return;
      const current = map.get(booking.user._id) || { ...booking.user, bookings: 0, totalAmount: 0, statuses: new Set() };
      current.bookings += 1;
      current.totalAmount += Number(booking.totalAmount || 0);
      current.statuses.add(booking.status);
      map.set(booking.user._id, current);
    });
    return [...map.values()].map((tenant) => ({ ...tenant, statuses: [...tenant.statuses] }));
  }, [bookings]);

  const analytics = {
    pending: bookings.filter((booking) => booking.status === "pending").length,
    approved: bookings.filter((booking) => booking.status === "approved").length,
    revenue: bookings.reduce((total, booking) => total + Number(booking.totalAmount || 0), 0),
    availableRooms: properties.reduce((total, property) => total + Number(property.availableRooms || 0), 0)
  };

  function handleImageChange(event) {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter((file) => file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024);

    if (validFiles.length !== files.length) {
      showToast({ type: "error", title: "Some images were skipped", message: "Only image files up to 5MB are allowed." });
    }

    imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    setImageFiles(validFiles);
    setImagePreviews(validFiles.map((file) => URL.createObjectURL(file)));
  }

  async function handlePropertySubmit(event) {
    event.preventDefault();
    const validationErrors = validatePropertyForm(propertyForm);
    if (validationErrors.length) {
      showToast({ type: "error", title: "Fix property details", message: validationErrors[0] });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...payloadFromForm(propertyForm),
        images: propertyForm.images || [],
        imageFiles
      };

      if (editingId) {
        const savedProperty = await updateProperty(editingId, payload);
        setProperties((current) => current.map((property) => (property._id === savedProperty._id ? savedProperty : property)));
        window.dispatchEvent(new Event("rentromitra:properties-changed"));
        showToast({ type: "success", title: "Property updated", message: propertyForm.title });
      } else {
        const savedProperty = await createProperty(payload);
        setProperties((current) => [savedProperty, ...current]);
        window.dispatchEvent(new Event("rentromitra:properties-changed"));
        showToast({ type: "success", title: "Property submitted", message: "It will appear on Explore after Super Admin approval." });
      }
      setPropertyForm(emptyProperty);
      setImageFiles([]);
      setImagePreviews([]);
      setEditingId(null);
      await load();
    } catch (error) {
      showToast({ type: "error", title: "Property save failed", message: error.message });
    } finally {
      setSaving(false);
    }
  }

  function startEdit(property) {
    setPropertyForm(formFromProperty(property));
    setEditingId(property._id);
    setImageFiles([]);
    setImagePreviews((property.images || []).map((image) => image.url).filter(Boolean));
    setActiveTab("properties");
  }

  async function handleDelete(property) {
    if (!window.confirm(`Delete ${property.title}? This cannot be undone.`)) return;

    try {
      await deleteProperty(property._id);
      showToast({ type: "success", title: "Property deleted", message: property.title });
      await load();
    } catch (error) {
      showToast({ type: "error", title: "Delete failed", message: error.message });
    }
  }

  async function setBookingStatus(id, status) {
    try {
      await updateBookingStatus(id, status);
      showToast({ type: "success", title: "Booking updated", message: `Marked ${status}` });
      await load();
    } catch (error) {
      showToast({ type: "error", title: "Booking update failed", message: error.message });
    }
  }

  function openBookingChat(booking) {
    const conversationId = booking.chatConversation?._id || booking.chatConversation;
    if (conversationId) {
      navigate("/chat", { state: { conversationId } });
      return;
    }

    showToast({
      type: "info",
      title: "Chat starts after approval",
      message: "Approve this booking first, then the user chat will appear here."
    });
  }

  async function handleProfileSubmit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const nextUser = await updateProfile(profile);
      updateUser(nextUser);
      showToast({ type: "success", title: "Admin profile updated" });
    } catch (error) {
      showToast({ type: "error", title: "Profile update failed", message: error.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageTransition>
    <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
      <aside className="panel h-fit overflow-hidden">
        <div className="bg-gradient-hero p-6 text-white">
          <p className="text-sm font-bold uppercase text-accent-300">Rentomitra</p>
          <h1 className="mt-2 text-2xl font-bold">Admin Panel</h1>
          <p className="mt-2 text-sm text-slate-300">Manage properties, bookings, tenants, and owner operations.</p>
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
                onClick={() => {
                  setActiveTab(tab.id);
                  navigate(tab.path);
                }}
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
            <p className="text-sm font-bold uppercase text-primary">Professional dashboard</p>
            <h2 className="mt-1 text-3xl font-bold text-ink">Owner operations</h2>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <button className="btn-primary" onClick={() => navigate("/admin/add-property")}>
              <Plus size={17} /> Add property
            </button>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
          <StatCard label="Properties" value={properties.length} />
          <StatCard label="Bookings" value={bookings.length} />
          <StatCard label="Pending Requests" value={analytics.pending} />
          <StatCard label="Booking Value" value={`Rs ${analytics.revenue.toLocaleString("en-IN")}`} />
        </div>

        {activeTab === "overview" && (
          <section className="grid gap-5 2xl:grid-cols-[1.1fr_0.9fr]">
            <div className="panel p-5">
              <div className="mb-4 flex items-center gap-2">
                <BarChart3 className="text-primary" size={20} />
                <h3 className="text-lg font-bold">Analytics Snapshot</h3>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-600">Approved bookings</p>
                  <p className="mt-2 text-3xl font-bold">{analytics.approved}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-600">Available rooms</p>
                  <p className="mt-2 text-3xl font-bold">{analytics.availableRooms}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-600">Tenant leads</p>
                  <p className="mt-2 text-3xl font-bold">{tenants.length}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-600">Published listings</p>
                  <p className="mt-2 text-3xl font-bold">{properties.filter((property) => property.status === "approved").length}</p>
                </div>
              </div>
            </div>

            <div className="panel p-5">
              <h3 className="mb-4 text-lg font-bold">Recent Booking Requests</h3>
              {loading ? (
                <p className="text-sm text-slate-600">Loading requests...</p>
              ) : bookings.length ? (
                <div className="grid gap-3">
                  {bookings.slice(0, 4).map((booking) => (
                    <div key={booking._id} className="rounded-md border border-slate-200 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold">{booking.property?.title || "Property"}</p>
                          <p className="text-sm text-slate-600">{booking.user?.name} - {formatDate(booking.moveInDate)}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${bookingStatusClass(booking.status)}`}>{booking.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-600">No bookings yet.</p>
              )}
            </div>
          </section>
        )}

        {activeTab === "properties" && (
          <>
            <PropertyForm
              form={propertyForm}
              setForm={setPropertyForm}
              editingId={editingId}
              imagePreviews={imagePreviews}
              saving={saving}
              onSubmit={handlePropertySubmit}
              onImageChange={handleImageChange}
              onCancel={() => {
                setEditingId(null);
                setPropertyForm(emptyProperty);
                setImageFiles([]);
                setImagePreviews([]);
              }}
            />
          </>
        )}

        {activeTab === "manage" && (
            <section className="panel p-5">
              <h3 className="mb-4 text-lg font-bold">Property Inventory</h3>
              <div className="grid gap-4 lg:grid-cols-2">
                {properties.map((property) => {
                  const room = firstRoom(property);
                  return (
                    <article key={property._id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                      {property.images?.[0]?.url && (
                        <img className="mb-4 h-36 w-full rounded-lg object-cover" src={property.images[0].url} alt={property.title} />
                      )}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-bold">{property.title}</h4>
                          <p className="mt-1 flex items-center gap-1 text-sm text-slate-600">
                            <MapPin size={14} /> {property.area || property.locality || property.city}, {property.city}
                          </p>
                        </div>
                        <span className="rounded-md bg-teal-50 px-2 py-1 text-xs font-bold uppercase text-primary">{property.propertyType || property.type}</span>
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-md bg-slate-50 p-3">
                          <p className="text-xs font-bold uppercase text-slate-500">Rent</p>
                          <p className="mt-1 font-bold">Rs {(property.price || room.monthlyRent || 0).toLocaleString("en-IN")}</p>
                        </div>
                        <div className="rounded-md bg-slate-50 p-3">
                          <p className="text-xs font-bold uppercase text-slate-500">Rooms</p>
                          <p className="mt-1 font-bold">{property.availableRooms || room.availableBeds || 0} available</p>
                        </div>
                        <div className="rounded-md bg-slate-50 p-3">
                          <p className="text-xs font-bold uppercase text-slate-500">Status</p>
                          <p className={`mt-1 inline-flex rounded-full px-2 py-1 text-xs font-bold capitalize ${propertyStatusClass(property.status)}`}>
                            {property.status || "pending"}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button className="btn-muted" onClick={() => startEdit(property)}>
                          <Edit3 size={16} /> Edit
                        </button>
                        <button className="btn-muted text-rose-700 hover:bg-rose-50" onClick={() => handleDelete(property)}>
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
        )}

        {activeTab === "bookings" && (
          <section className="panel p-5">
            <h3 className="mb-4 text-lg font-bold">Manage Bookings</h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b text-slate-500">
                  <tr>
                    <th className="py-2">Tenant</th>
                    <th>Property</th>
                    <th>Move-in</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                    <th>Chat</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking._id} className="border-b last:border-0">
                      <td className="py-3">
                        <p className="font-bold">{booking.user?.name || "Tenant"}</p>
                        <p className="text-xs text-slate-500">{booking.user?.email}</p>
                      </td>
                      <td>{booking.property?.title || "Property"}</td>
                      <td>{formatDate(booking.moveInDate)}</td>
                      <td><span className="inline-flex items-center gap-1 font-bold"><IndianRupee size={14} />{booking.totalAmount?.toLocaleString("en-IN")}</span></td>
                      <td><span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${bookingStatusClass(booking.status)}`}>{booking.status}</span></td>
                      <td>
                        <div className="flex gap-2">
                          <button className="rounded-md p-2 text-emerald-700 hover:bg-emerald-50" onClick={() => setBookingStatus(booking._id, "approved")} aria-label="Approve booking">
                            <CheckCircle2 size={18} />
                          </button>
                          <button className="rounded-md p-2 text-red-700 hover:bg-red-50" onClick={() => setBookingStatus(booking._id, "rejected")} aria-label="Reject booking">
                            <XCircle size={18} />
                          </button>
                        </div>
                      </td>
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
          </section>
        )}

        {activeTab === "tenants" && (
          <section className="panel p-5">
            <h3 className="mb-4 text-lg font-bold">Tenant Management</h3>
            {tenants.length ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {tenants.map((tenant) => (
                  <article key={tenant._id} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-bold">{tenant.name}</h4>
                        <p className="text-sm text-slate-600">{tenant.email}</p>
                        <p className="text-sm text-slate-600">{tenant.phone || "No phone provided"}</p>
                      </div>
                      <span className="grid h-10 w-10 place-items-center rounded-md bg-teal-50 font-bold text-primary">{tenant.name?.[0]?.toUpperCase()}</span>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-md bg-slate-50 p-3">
                        <p className="text-xs font-bold uppercase text-slate-500">Bookings</p>
                        <p className="mt-1 text-lg font-bold">{tenant.bookings}</p>
                      </div>
                      <div className="rounded-md bg-slate-50 p-3">
                        <p className="text-xs font-bold uppercase text-slate-500">Value</p>
                        <p className="mt-1 text-lg font-bold">Rs {tenant.totalAmount.toLocaleString("en-IN")}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {tenant.statuses.map((status) => (
                        <span key={status} className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${bookingStatusClass(status)}`}>{status}</span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <UsersRound className="mx-auto text-slate-400" size={32} />
                <h4 className="mt-3 text-lg font-bold">No tenants yet</h4>
                <p className="mt-2 text-sm text-slate-600">Tenants appear here after they create booking requests for your properties.</p>
              </div>
            )}
          </section>
        )}

        {activeTab === "chat" && (
          <section className="glass overflow-hidden p-0">
            <div className="border-b border-slate-200 p-5 pb-4">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <MessageCircle size={20} className="text-primary" /> Property Chats
              </h2>
              <p className="mt-1 text-sm text-slate-600">Respond to user inquiries about your properties</p>
            </div>
            <div className="h-[500px] overflow-y-auto">
              <AdminChatList />
            </div>
          </section>
        )}

        {activeTab === "profile" && (
          <section className="glass p-6">
            <h3 className="text-xl font-bold">Admin Profile</h3>
            <p className="mt-1 text-sm text-slate-600">Manage the profile used for property ownership and booking communication.</p>
            <form onSubmit={handleProfileSubmit} className="mt-5 grid gap-4 md:grid-cols-2">
              <FormField label="Name" value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} required />
              <FormField label="Email" value={user?.email || ""} disabled />
              <FormField label="Phone" value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} />
              <FormField label="City" value={profile.city} onChange={(event) => setProfile({ ...profile, city: event.target.value })} />
              <button className="btn-primary md:col-span-2" type="submit" disabled={saving}>
                <Save size={17} /> {saving ? "Saving..." : "Save profile"}
              </button>
            </form>
          </section>
        )}
      </main>
    </div>
    </PageTransition>
  );
}
