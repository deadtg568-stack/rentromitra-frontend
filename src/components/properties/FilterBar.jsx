import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { BHOPAL_ZONES } from "../../data/bhopal.js";
import { useBhopalLocations } from "../../hooks/useBhopalLocations.js";

const AMENITIES = ["WiFi", "Food", "Laundry", "Parking", "AC", "Power Backup"];

const emptyFilters = {
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

export function FilterBar({ filters, setFilters, onSubmit }) {
  const [expanded, setExpanded] = useState(false);
  const { areaNames, collegeNames } = useBhopalLocations();

  function update(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function toggleAmenity(amenity) {
    setFilters((current) => {
      const selected = current.amenities ? current.amenities.split(",").filter(Boolean) : [];
      const next = selected.includes(amenity) ? selected.filter((item) => item !== amenity) : [...selected, amenity];
      return { ...current, amenities: next.join(",") };
    });
  }

  function resetFilters() {
    setFilters(emptyFilters);
  }

  const selectedAmenities = filters.amenities ? filters.amenities.split(",").filter(Boolean) : [];
  const activeCount = [
    filters.area || filters.locality,
    filters.nearbyCollege,
    filters.areaZone,
    filters.propertyType,
    filters.genderType,
    filters.minPrice,
    filters.maxPrice,
    selectedAmenities.length ? "yes" : ""
  ].filter(Boolean).length;

  return (
    <motion.form
      onSubmit={onSubmit}
      className="glass overflow-hidden"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-50 text-primary-600">
            <SlidersHorizontal size={18} />
          </span>
          <div>
            <h3 className="font-bold text-ink">Smart filters</h3>
            <p className="text-xs text-slate-500">{activeCount ? `${activeCount} filters active` : "Refine your Bhopal search"}</p>
          </div>
        </div>
        <button
          type="button"
          className="btn-muted text-sm"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "Less" : "More"} filters
          <ChevronDown size={16} className={`transition ${expanded ? "rotate-180" : ""}`} />
        </button>
      </div>

      <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Search</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input className="input pl-10" value={filters.q} onChange={(e) => update("q", e.target.value)} placeholder="MP Nagar PG, MANIT hostel" />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">City</label>
          <input className="input" value={filters.city} readOnly placeholder="Bhopal" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Area</label>
          <select className="input" value={filters.area || filters.locality || ""} onChange={(e) => update("area", e.target.value)}>
            <option value="">All Bhopal</option>
            {areaNames.map((area) => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Near college</label>
          <select className="input" value={filters.nearbyCollege} onChange={(e) => update("nearbyCollege", e.target.value)}>
            <option value="">Any college</option>
            {collegeNames.map((college) => (
              <option key={college} value={college}>{college}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Area zone</label>
          <select className="input" value={filters.areaZone} onChange={(e) => update("areaZone", e.target.value)}>
            <option value="">Any zone</option>
            {BHOPAL_ZONES.map((zone) => (
              <option key={zone.value} value={zone.value}>{zone.label}</option>
            ))}
          </select>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-slate-100"
          >
            <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-6">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Property type</label>
                <select className="input" value={filters.propertyType} onChange={(e) => update("propertyType", e.target.value)}>
                  <option value="">PG, hostel or room</option>
                  <option value="pg">PG</option>
                  <option value="hostel">Hostel</option>
                  <option value="room">Room</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">For</label>
                <select className="input" value={filters.genderType} onChange={(e) => update("genderType", e.target.value)}>
                  <option value="">Boys or girls</option>
                  <option value="boys">Boys</option>
                  <option value="girls">Girls</option>
                  <option value="any">Any</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3 lg:col-span-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Min price</label>
                  <input className="input" type="number" value={filters.minPrice} onChange={(e) => update("minPrice", e.target.value)} placeholder="Rs 4000" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Max price</label>
                  <input className="input" type="number" value={filters.maxPrice} onChange={(e) => update("maxPrice", e.target.value)} placeholder="Rs 12000" />
                </div>
              </div>

              <div className="lg:col-span-6">
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Amenities</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                      selectedAmenities.length === 0
                        ? "border-primary-300 bg-primary-50 text-primary-700 shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-primary-200"
                    }`}
                    onClick={() => update("amenities", "")}
                  >
                    All
                  </button>
                  {AMENITIES.map((amenity) => (
                    <button
                      key={amenity}
                      type="button"
                      className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                        selectedAmenities.includes(amenity)
                          ? "border-primary-300 bg-primary-50 text-primary-700 shadow-sm"
                          : "border-slate-200 bg-white text-slate-600 hover:border-primary-200"
                      }`}
                      onClick={() => toggleAmenity(amenity)}
                    >
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap gap-2 border-t border-slate-100 p-4 sm:p-5">
        <button className="btn-primary" type="submit">
          <Search size={16} /> Apply filters
        </button>
        <button className="btn-muted" type="button" onClick={resetFilters}>
          <RotateCcw size={16} /> Reset
        </button>
      </div>
    </motion.form>
  );
}
