import { motion } from "framer-motion";
import { Building2, CheckCircle2, GraduationCap, MapPin, Search, ShieldCheck, SlidersHorizontal, Sparkles } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FilterBar } from "../components/properties/FilterBar.jsx";
import { PropertyCard } from "../components/properties/PropertyCard.jsx";
import { PropertyCardSkeleton } from "../components/ui/Skeleton.jsx";
import { PageTransition } from "../components/ui/PageTransition.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useBhopalLocations } from "../hooks/useBhopalLocations.js";
import { useProperties } from "../hooks/useProperties.js";
import { toggleWishlist as saveWishlist } from "../services/propertyService.js";

const initialFilters = {
  q: "",
  city: "Bhopal",
  area: "",
  locality: "",
  nearbyCollege: "",
  areaZone: "",
  propertyType: "",
  genderType: "",
  minPrice: "",
  maxPrice: "",
  amenities: ""
};

const features = [
  { icon: ShieldCheck, title: "Verified owner flow", copy: "Admin-protected listings with verification states you can trust." },
  { icon: SlidersHorizontal, title: "Practical filters", copy: "Search by locality, college, property type, rent, and amenities." },
  { icon: Building2, title: "Room-first details", copy: "Every listing shows rooms, images, amenities, and transparent rent." }
];

export function HomePage() {
  const { filters, setFilters, properties, error, loading, loadProperties } = useProperties(initialFilters);
  const { user } = useAuth();
  const { areaNames, collegeNames } = useBhopalLocations();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const suggestions = useMemo(() => [...areaNames, ...collegeNames].slice(0, 80), [areaNames, collegeNames]);

  useEffect(() => {
    const nextFilters = {
      ...initialFilters,
      area: searchParams.get("area") || "",
      nearbyCollege: searchParams.get("nearbyCollege") || "",
      propertyType: searchParams.get("propertyType") || "",
      q: searchParams.get("search") || ""
    };
    if (nextFilters.area || nextFilters.nearbyCollege || nextFilters.propertyType || nextFilters.q) {
      setFilters(nextFilters);
      loadProperties(nextFilters);
    }
  }, [searchParams]);

  async function toggleWishlist(propertyId) {
    if (user?.role !== "user") return;
    await saveWishlist(propertyId);
  }

  function applyArea(area) {
    const nextFilters = { ...filters, area, locality: "" };
    setFilters(nextFilters);
    loadProperties(nextFilters);
    navigate(`/explore?area=${encodeURIComponent(area)}`);
  }

  function applyCollege(college) {
    const nextFilters = { ...filters, nearbyCollege: college };
    setFilters(nextFilters);
    loadProperties(nextFilters);
    navigate(`/explore?nearbyCollege=${encodeURIComponent(college)}`);
  }

  function applyRecommendation(label, params) {
    const nextFilters = { ...filters, ...params };
    setFilters(nextFilters);
    loadProperties(nextFilters);
    const query = new URLSearchParams(params).toString();
    navigate(`/explore?${query}`);
  }

  return (
    <PageTransition className="space-y-12 pb-8">
      <section className="relative -mx-4 overflow-hidden rounded-none sm:-mx-0 sm:rounded-3xl">
        <div className="relative min-h-[560px] bg-gradient-hero lg:min-h-[620px]">
          <motion.div
            className="pointer-events-none absolute inset-0 bg-gradient-mesh opacity-80"
            animate={{ opacity: [0.6, 0.9, 0.6] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-16">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white backdrop-blur">
                <MapPin size={14} className="text-accent-300" /> Hyperlocal Bhopal rentals
              </p>
              <h1 className="mt-6 max-w-xl text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Find your perfect PG, hostel, or room —{" "}
                <span className="text-accent-300">near campus</span>
              </h1>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/80">
                Compare student-friendly stays across Bhopal localities with filters built for real move-in decisions.
              </p>

              <form
                className="mt-8 flex flex-col gap-3 rounded-2xl bg-white p-2 shadow-2xl sm:flex-row"
                onSubmit={(event) => {
                  event.preventDefault();
                  loadProperties();
                }}
              >
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    className="input h-14 border-0 bg-transparent pl-12 text-base shadow-none focus:ring-0"
                    list="bhopal-location-suggestions"
                    value={filters.q}
                    onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))}
                    placeholder="Search locality, PG, hostel, college..."
                  />
                  <datalist id="bhopal-location-suggestions">
                    {suggestions.map((item) => (
                      <option key={item} value={item} />
                    ))}
                  </datalist>
                </div>
                <button className="btn-primary h-14 shrink-0 rounded-xl px-8 text-base" type="submit">
                  <Search size={18} /> Search stays
                </button>
              </form>

              <div className="mt-6 flex flex-wrap gap-2">
                {["MP Nagar", "Kolar Road", "Indrapuri", "Saket Nagar", "MANIT", "LNCT", "AIIMS", "RGPV"].map((item, i) => (
                  <motion.button
                    key={item}
                    type="button"
                    className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
                    onClick={() => (["MANIT", "LNCT", "AIIMS", "RGPV"].includes(item) ? applyCollege(item) : applyArea(item))}
                    whileHover={{ scale: 1.03 }}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i }}
                  >
                    {item}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="relative hidden lg:block"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                <img
                  className="h-[420px] w-full object-cover"
                  src="https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80"
                  alt="Premium rental room in Bhopal"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
              </div>
              <motion.div
                className="absolute -bottom-4 -left-4 grid grid-cols-3 gap-3 rounded-2xl border border-white/20 bg-white/95 p-4 shadow-xl backdrop-blur"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {[
                  { value: "3", label: "Property types" },
                  { value: "12+", label: "Localities" },
                  { value: "10", label: "Colleges" }
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-2xl font-extrabold text-ink">{stat.value}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {features.map((item, i) => (
          <motion.article
            key={item.title}
            className="glass flex gap-4 p-5"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -4 }}
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-primary text-white shadow-soft">
              <item.icon size={22} />
            </span>
            <div>
              <h2 className="font-bold text-ink">{item.title}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">{item.copy}</p>
            </div>
          </motion.article>
        ))}
      </section>

      <section>
        <motion.div className="mb-4 flex items-center gap-2" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <MapPin className="text-primary-600" size={20} />
          <h2 className="text-xl font-extrabold text-ink">Popular Areas in Bhopal</h2>
        </motion.div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {areaNames.slice(0, 18).map((area) => (
            <button
              key={area}
              type="button"
              className={`shrink-0 rounded-2xl border px-5 py-3 text-sm font-semibold transition ${
                filters.area === area
                  ? "border-primary-300 bg-primary-50 text-primary-700 shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-primary-200 hover:bg-primary-50/50"
              }`}
              onClick={() => applyArea(area)}
            >
              {area}
            </button>
          ))}
        </div>
      </section>

      <section>
        <motion.div className="mb-4 flex items-center gap-2" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <GraduationCap className="text-accent-500" size={20} />
          <h2 className="text-xl font-extrabold text-ink">Top Colleges in Bhopal</h2>
        </motion.div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {collegeNames.slice(0, 6).map((college) => (
            <button
              key={college}
              type="button"
              className="glass flex items-center gap-3 p-4 text-left transition hover:border-primary-200 hover:shadow-soft"
              onClick={() => applyCollege(college)}
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent-50 text-accent-600">
                <GraduationCap size={18} />
              </span>
              <span className="text-sm font-semibold text-ink">{college}</span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <motion.div className="mb-4 flex items-center gap-2" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <Building2 className="text-primary-600" size={20} />
          <h2 className="text-xl font-extrabold text-ink">Properties near colleges</h2>
        </motion.div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["PGs near MANIT", { nearbyCollege: "MANIT", propertyType: "pg" }],
            ["Rooms near LNCT", { nearbyCollege: "LNCT", propertyType: "room" }],
            ["Hostels near AIIMS", { nearbyCollege: "AIIMS", propertyType: "hostel" }],
            ["Properties near RGPV", { nearbyCollege: "RGPV" }]
          ].map(([label, params]) => (
            <button
              key={label}
              type="button"
              className="glass flex items-center gap-3 p-4 text-left transition hover:border-primary-200 hover:shadow-soft"
              onClick={() => applyRecommendation(label, params)}
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-50 text-primary-700">
                <MapPin size={18} />
              </span>
              <span className="text-sm font-semibold text-ink">{label}</span>
            </button>
          ))}
        </div>
      </section>

      <FilterBar
        filters={filters}
        setFilters={setFilters}
        onSubmit={(event) => {
          event.preventDefault();
          loadProperties();
        }}
      />

      {error && (
        <motion.p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {error}
        </motion.p>
      )}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-bold text-primary-600">
            <Sparkles size={16} /> Available listings
          </p>
          <h2 className="section-title mt-1">Explore stays in Bhopal</h2>
        </div>
        <p className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">
          {loading ? "Loading..." : `${properties.length} properties found`}
        </p>
      </div>

      {loading ? (
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <PropertyCardSkeleton key={item} />
          ))}
        </section>
      ) : properties.length ? (
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property, index) => (
            <PropertyCard key={property._id} property={property} onWishlist={toggleWishlist} index={index} />
          ))}
        </section>
      ) : (
        <motion.section className="panel p-12 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <CheckCircle2 className="mx-auto text-slate-300" size={48} />
          <h2 className="mt-4 text-xl font-bold text-ink">No properties match these filters</h2>
          <p className="mt-2 text-sm text-slate-600">Try a different locality, rent limit, or property type.</p>
        </motion.section>
      )}
    </PageTransition>
  );
}
