import {
  AlertTriangle,
  BarChart3,
  Building2,
  CheckCircle2,
  Crown,
  LayoutDashboard,
  ShieldCheck,
  Trash2,
  UserCog,
  UsersRound,
  XCircle
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPicker } from "../../components/maps/MapPicker.jsx";
import { StatCard } from "../../components/common/StatCard.jsx";
import { PageTransition } from "../../components/ui/PageTransition.jsx";
import { NotificationBell } from "../../components/notifications/NotificationBell.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import {
  deleteAccount,
  getSuperAdminDashboardData,
  updateComplaintStatus,
  updatePropertyApproval,
  updateUserStatus
} from "../../services/superAdminService.js";

const tabs = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard, path: "/superadmin/dashboard" },
  { id: "users", label: "Manage Users", icon: UsersRound, path: "/superadmin/manage-users" },
  { id: "admins", label: "Manage Admins", icon: ShieldCheck, path: "/superadmin/manage-admins" },
  { id: "properties", label: "Approvals", icon: Building2, path: "/superadmin/approve-properties" },
  { id: "complaints", label: "Complaints", icon: AlertTriangle, path: "/superadmin/complaints" },
  { id: "analytics", label: "Analytics", icon: BarChart3, path: "/superadmin/analytics" }
];

function statusBadge(status) {
  const styles = {
    approved: "bg-emerald-50 text-emerald-700",
    verified: "bg-emerald-50 text-emerald-700",
    submitted: "bg-amber-50 text-amber-700",
    pending: "bg-slate-100 text-slate-700",
    rejected: "bg-red-50 text-red-700",
    open: "bg-red-50 text-red-700",
    in_progress: "bg-amber-50 text-amber-700",
    resolved: "bg-emerald-50 text-emerald-700"
  };

  return styles[status] || "bg-slate-100 text-slate-700";
}

function formatDate(date) {
  if (!date) return "Not set";
  return new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function ownerIdOf(property) {
  return String(property.owner?._id || property.owner || "");
}

function EmptyState({ icon: Icon, title, copy }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <Icon className="mx-auto text-slate-400" size={32} />
      <h3 className="mt-3 text-lg font-bold">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">{copy}</p>
    </div>
  );
}

export function SuperAdminDashboard({ initialTab = "overview" }) {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [selectedAdminId, setSelectedAdminId] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const data = await getSuperAdminDashboardData();
      setUsers(data.users);
      setProperties(data.properties);
      setBookings(data.bookings);
      setComplaints(data.complaints);
    } catch (error) {
      showToast({ type: "error", title: "Super admin data failed", message: error.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const admins = users.filter((user) => user.role === "admin");
  const tenants = users.filter((user) => user.role === "user");
  const pendingProperties = properties.filter((property) => (property.status || "pending") === "pending");
  const openComplaints = complaints.filter((complaint) => ["open", "in_progress"].includes(complaint.status));
  const selectedAdmin = admins.find((admin) => admin._id === selectedAdminId);
  const selectedAdminProperties = selectedAdminId
    ? properties.filter((property) => ownerIdOf(property) === selectedAdminId)
    : [];

  const analytics = useMemo(() => {
    const bookingValue = bookings.reduce((total, booking) => total + Number(booking.totalAmount || 0), 0);
    const activeUsers = users.filter((user) => user.isActive).length;
    const publishedProperties = properties.filter((property) => property.status === "approved").length;

    return { bookingValue, activeUsers, publishedProperties };
  }, [bookings, properties, users]);

  async function setUserStatus(user, isActive) {
    try {
      await updateUserStatus(user._id, isActive);
      showToast({ type: "success", title: isActive ? "Account enabled" : "Account disabled", message: user.email });
      await load();
    } catch (error) {
      showToast({ type: "error", title: "Status update failed", message: error.message });
    }
  }

  async function handleDeleteAccount(user) {
    if (!window.confirm(`Delete ${user.name}? This cannot be undone.`)) return;

    try {
      await deleteAccount(user._id);
      showToast({ type: "success", title: "Account deleted", message: user.email });
      await load();
    } catch (error) {
      showToast({ type: "error", title: "Delete failed", message: error.message });
    }
  }

  async function setPropertyStatus(property, status) {
    try {
      const updatedProperty = await updatePropertyApproval(property._id, status);
      setProperties((current) => current.map((item) => (item._id === updatedProperty._id ? updatedProperty : item)));
      window.dispatchEvent(new Event("rentromitra:properties-changed"));
      showToast({ type: "success", title: status === "approved" ? "Property approved" : "Property rejected", message: property.title });
      await load();
    } catch (error) {
      showToast({ type: "error", title: "Property update failed", message: error.message });
    }
  }

  async function setComplaintStatus(complaint, status) {
    try {
      await updateComplaintStatus(complaint._id, status, status === "resolved" ? "Resolved by super admin." : "");
      showToast({ type: "success", title: "Complaint updated", message: complaint.subject });
      await load();
    } catch (error) {
      showToast({ type: "error", title: "Complaint update failed", message: error.message });
    }
  }

  function AccountTable({ accounts, title, showPropertyCount = false }) {
    return (
      <section className="panel p-5">
        <h3 className="mb-4 text-lg font-bold">{title}</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b text-slate-500">
              <tr>
                <th className="py-2">Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>City</th>
                <th>Status</th>
                {showPropertyCount && <th>Properties</th>}
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((user) => {
                const propertyCount = showPropertyCount
                  ? properties.filter((property) => ownerIdOf(property) === user._id).length
                  : 0;

                return (
                  <tr key={user._id} className="border-b last:border-0">
                    <td className="py-3 font-semibold">{user.name}</td>
                    <td>{user.email}</td>
                    <td className="capitalize">{user.role}</td>
                    <td>{user.city || "Not set"}</td>
                    <td>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${user.isActive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                        {user.isActive ? "Active" : "Disabled"}
                      </span>
                    </td>
                    {showPropertyCount && (
                      <td>
                        <button
                          type="button"
                          className="btn-muted px-3 py-1.5 text-xs"
                          onClick={() => setSelectedAdminId(user._id)}
                        >
                          <Building2 size={14} /> {propertyCount} Properties
                        </button>
                      </td>
                    )}
                    <td>
                      {user.role !== "superadmin" && (
                        <div className="flex gap-2">
                          <button className="btn-muted" onClick={() => setUserStatus(user, !user.isActive)}>
                            {user.isActive ? "Disable" : "Enable"}
                          </button>
                          {user.role === "admin" && (
                            <button className="rounded-xl border border-red-200 bg-white px-3 py-2 text-red-700 hover:bg-red-50" onClick={() => handleDeleteAccount(user)} aria-label="Delete admin">
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  return (
    <PageTransition>
    <div className="grid gap-6 xl:grid-cols-[290px_1fr]">
      <aside className="panel h-fit overflow-hidden">
        <div className="bg-gradient-hero p-6 text-white">
          <p className="inline-flex items-center gap-2 text-sm font-bold uppercase text-accent-300">
            <Crown size={16} /> Super Admin
          </p>
          <h1 className="mt-2 text-2xl font-bold">Platform Control</h1>
          <p className="mt-2 text-sm leading-6 text-slate-300">Manage admins, users, approvals, analytics, and platform complaints.</p>
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
            <p className="text-sm font-bold uppercase text-primary">Advanced admin UI</p>
            <h2 className="mt-1 text-3xl font-bold text-ink">Rentomitra operations</h2>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <button className="btn-primary" onClick={() => navigate("/superadmin/manage-admins")}>
              <UserCog size={17} /> Manage admins
            </button>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-5">
          <StatCard label="Users" value={users.length} />
          <StatCard label="Admins" value={admins.length} />
          <StatCard label="Properties" value={properties.length} />
          <StatCard label="Pending Approvals" value={pendingProperties.length} />
          <StatCard label="Open Complaints" value={openComplaints.length} />
        </div>

        {activeTab === "overview" && (
          <section className="grid gap-5 2xl:grid-cols-[1fr_1fr]">
            <div className="panel p-5">
              <div className="mb-4 flex items-center gap-2">
                <BarChart3 className="text-primary" size={20} />
                <h3 className="text-lg font-bold">Platform Analytics</h3>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-600">Active accounts</p>
                  <p className="mt-2 text-3xl font-bold">{analytics.activeUsers}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-600">Published listings</p>
                  <p className="mt-2 text-3xl font-bold">{analytics.publishedProperties}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-600">Booking requests</p>
                  <p className="mt-2 text-3xl font-bold">{bookings.length}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-600">Booking value</p>
                  <p className="mt-2 text-3xl font-bold">Rs {analytics.bookingValue.toLocaleString("en-IN")}</p>
                </div>
              </div>
            </div>

            <div className="panel p-5">
              <h3 className="mb-4 text-lg font-bold">Attention Queue</h3>
              <div className="grid gap-3">
                <button className="flex items-center justify-between rounded-lg border border-slate-200 p-4 text-left hover:bg-slate-50" onClick={() => navigate("/superadmin/approve-properties")}>
                  <span>
                    <span className="block font-bold">Property approvals</span>
                    <span className="text-sm text-slate-600">Review submitted owner listings</span>
                  </span>
                  <span className="text-2xl font-bold text-primary">{pendingProperties.length}</span>
                </button>
                <button className="flex items-center justify-between rounded-lg border border-slate-200 p-4 text-left hover:bg-slate-50" onClick={() => navigate("/superadmin/complaints")}>
                  <span>
                    <span className="block font-bold">Open complaints</span>
                    <span className="text-sm text-slate-600">Resolve user and owner escalations</span>
                  </span>
                  <span className="text-2xl font-bold text-primary">{openComplaints.length}</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {activeTab === "analytics" && (
          <section className="grid gap-5 2xl:grid-cols-[1fr_1fr]">
            <div className="glass p-6">
              <h3 className="text-lg font-bold">Global Statistics</h3>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <StatCard label="Active Accounts" value={analytics.activeUsers} />
                <StatCard label="Published Properties" value={analytics.publishedProperties} />
                <StatCard label="Booking Requests" value={bookings.length} />
                <StatCard label="Booking Value" value={`Rs ${analytics.bookingValue.toLocaleString("en-IN")}`} />
              </div>
            </div>
            <div className="glass p-6">
              <h3 className="text-lg font-bold">Platform Mix</h3>
              <div className="mt-5 space-y-4">
                {[
                  ["Users", users.length],
                  ["Admins", admins.length],
                  ["Properties", properties.length],
                  ["Complaints", complaints.length]
                ].map(([label, value]) => (
                  <div key={label}>
                    <div className="mb-1 flex justify-between text-sm font-semibold text-slate-600">
                      <span>{label}</span>
                      <span>{value}</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-gradient-primary" style={{ width: `${Math.min(100, value * 12 || 8)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === "admins" && (
          <>
            <AccountTable accounts={admins} title="Manage Admins" showPropertyCount />
            {selectedAdmin && (
              <section className="panel p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold">{selectedAdmin.name}'s Properties</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {selectedAdmin.email} has added {selectedAdminProperties.length} properties.
                    </p>
                  </div>
                  <button className="btn-muted" type="button" onClick={() => setSelectedAdminId("")}>Close</button>
                </div>

                {selectedAdminProperties.length ? (
                  <div className="grid gap-4 xl:grid-cols-2">
                    {selectedAdminProperties.map((property) => (
                      <article key={property._id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        {property.images?.[0]?.url && (
                          <img className="mb-4 h-36 w-full rounded-lg object-cover" src={property.images[0].url} alt={property.title} />
                        )}
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="font-bold">{property.title}</h4>
                            <p className="mt-1 text-sm text-slate-600">
                              {property.area || property.locality || property.city}, {property.city}
                            </p>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusBadge(property.status || "pending")}`}>
                            {property.status || "pending"}
                          </span>
                        </div>
                        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{property.description}</p>
                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                          <div className="rounded-md bg-slate-50 p-3">
                            <p className="text-xs font-bold uppercase text-slate-500">Rent</p>
                            <p className="mt-1 font-bold">Rs {Number(property.price || 0).toLocaleString("en-IN")}</p>
                          </div>
                          <div className="rounded-md bg-slate-50 p-3">
                            <p className="text-xs font-bold uppercase text-slate-500">Type</p>
                            <p className="mt-1 font-bold capitalize">{property.propertyType || property.type || "Not set"}</p>
                          </div>
                          <div className="rounded-md bg-slate-50 p-3">
                            <p className="text-xs font-bold uppercase text-slate-500">Added</p>
                            <p className="mt-1 font-bold">{formatDate(property.createdAt)}</p>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <EmptyState icon={Building2} title="No properties added" copy="This admin has not added any property yet." />
                )}
              </section>
            )}
          </>
        )}

        {activeTab === "users" && <AccountTable accounts={tenants} title="Manage Users" />}

        {activeTab === "properties" && (
          <section className="panel p-5">
            <h3 className="mb-4 text-lg font-bold">Approve / Reject Properties</h3>
            {pendingProperties.length ? (
              <div className="grid gap-4 xl:grid-cols-2">
                {pendingProperties.map((property) => (
                  <article key={property._id} className="rounded-lg border border-slate-200 p-4">
                    {property.images?.[0]?.url && (
                      <img className="mb-4 h-36 w-full rounded-lg object-cover" src={property.images[0].url} alt={property.title} />
                    )}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-bold">{property.title}</h4>
                        <p className="mt-1 text-sm text-slate-600">{property.locality || property.city}, {property.city}</p>
                        <p className="mt-1 text-sm text-slate-600">Owner: {property.owner?.name || "Unknown"}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusBadge(property.status)}`}>
                        {property.status || "pending"}
                      </span>
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{property.description}</p>
                    {property.location?.lat && property.location?.lng && (
                      <div className="mt-4">
                        <MapPicker location={property.location} readOnly height="h-48" />
                      </div>
                    )}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button className="btn-muted text-emerald-700 hover:bg-emerald-50" onClick={() => setPropertyStatus(property, "approved")}>
                        <CheckCircle2 size={16} /> Approve
                      </button>
                      <button className="btn-muted text-red-700 hover:bg-red-50" onClick={() => setPropertyStatus(property, "rejected")}>
                        <XCircle size={16} /> Reject
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState icon={Building2} title="No properties found" copy="Property approvals will appear here after admins create listings." />
            )}
          </section>
        )}

        {activeTab === "complaints" && (
          <section className="panel p-5">
            <h3 className="mb-4 text-lg font-bold">Complaint Management</h3>
            {complaints.length ? (
              <div className="grid gap-4">
                {complaints.map((complaint) => (
                  <article key={complaint._id} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h4 className="font-bold">{complaint.subject}</h4>
                        <p className="mt-1 text-sm text-slate-600">
                          {complaint.user?.name || "User"} - {complaint.category} - {formatDate(complaint.createdAt)}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusBadge(complaint.status)}`}>{complaint.status?.replace("_", " ")}</span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-700">{complaint.priority}</span>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-700">{complaint.message}</p>
                    {complaint.property?.title && <p className="mt-2 text-sm text-slate-600">Property: {complaint.property.title}</p>}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button className="btn-muted" onClick={() => setComplaintStatus(complaint, "in_progress")}>Mark in progress</button>
                      <button className="btn-muted text-emerald-700 hover:bg-emerald-50" onClick={() => setComplaintStatus(complaint, "resolved")}>Resolve</button>
                      <button className="btn-muted text-red-700 hover:bg-red-50" onClick={() => setComplaintStatus(complaint, "rejected")}>Reject</button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState icon={AlertTriangle} title="No complaints yet" copy="User complaints and escalations will appear here when submitted through the complaints API." />
            )}
          </section>
        )}

        {loading && <p className="text-sm text-slate-500">Refreshing platform data...</p>}
      </main>
    </div>
    </PageTransition>
  );
}
