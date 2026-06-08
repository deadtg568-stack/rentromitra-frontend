import { LocateFixed, MapPin, Navigation, Search } from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_CENTER = { address: "Bhopal, Madhya Pradesh, India", lat: 23.2599, lng: 77.4126 };

const BHOPAL_LOCATION_COORDINATES = {
  "arera colony": { lat: 23.2144, lng: 77.4312 },
  "gulmohar colony": { lat: 23.2074, lng: 77.4349 },
  shahpura: { lat: 23.2051, lng: 77.4261 },
  "char imli": { lat: 23.2242, lng: 77.4103 },
  "e-7 arera colony": { lat: 23.2079, lng: 77.4387 },
  "bawadiya kalan": { lat: 23.1852, lng: 77.4578 },
  "danish nagar": { lat: 23.1838, lng: 77.4467 },
  trilanga: { lat: 23.1985, lng: 77.4352 },
  "rohit nagar": { lat: 23.1867, lng: 77.4621 },
  chunabhatti: { lat: 23.1989, lng: 77.4149 },
  "kolar road": { lat: 23.1747, lng: 77.4186 },
  salaiya: { lat: 23.1689, lng: 77.4717 },
  "katara hills": { lat: 23.1667, lng: 77.4933 },
  "hoshangabad road": { lat: 23.1846, lng: 77.4554 },
  bhel: { lat: 23.241, lng: 77.5018 },
  "mp nagar zone 1": { lat: 23.2313, lng: 77.4348 },
  "mp nagar zone 2": { lat: 23.2346, lng: 77.4321 },
  "mp nagar zone 3": { lat: 23.2298, lng: 77.4383 },
  indrapuri: { lat: 23.2594, lng: 77.4751 },
  "saket nagar": { lat: 23.2062, lng: 77.4531 },
  sonagiri: { lat: 23.2558, lng: 77.4902 },
  "ayodhya bypass": { lat: 23.2799, lng: 77.4629 },
  "anand nagar": { lat: 23.2554, lng: 77.5138 },
  "nehru nagar": { lat: 23.2298, lng: 77.3982 },
  govindpura: { lat: 23.2518, lng: 77.4676 },
  habibganj: { lat: 23.2237, lng: 77.4411 },
  bagsewania: { lat: 23.1898, lng: 77.4528 },
  misrod: { lat: 23.1652, lng: 77.4758 },
  piplani: { lat: 23.2576, lng: 77.4899 },
  "rachna nagar": { lat: 23.2395, lng: 77.4518 },
  "ashoka garden": { lat: 23.2613, lng: 77.4331 },
  "gautam nagar": { lat: 23.2721, lng: 77.4227 },
  "shyamla hills": { lat: 23.2423, lng: 77.3866 },
  "gandhi nagar": { lat: 23.2875, lng: 77.3372 },
  manit: { lat: 23.2146, lng: 77.401 },
  "barkatullah university": { lat: 23.2036, lng: 77.4539 },
  "aiims bhopal": { lat: 23.2071, lng: 77.4598 },
  rgpv: { lat: 23.311, lng: 77.3612 },
  lnct: { lat: 23.2506, lng: 77.5249 }
};

function coordinatesFrom(location) {
  if (!location?.lat || !location?.lng) return null;
  return { lat: Number(location.lat), lng: Number(location.lng) };
}

function normalizeSearch(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function findKnownLocation(query) {
  const normalized = normalizeSearch(query);
  if (!normalized) return null;

  if (BHOPAL_LOCATION_COORDINATES[normalized]) {
    return { address: `${query}, Bhopal, Madhya Pradesh, India`, ...BHOPAL_LOCATION_COORDINATES[normalized] };
  }

  const match = Object.entries(BHOPAL_LOCATION_COORDINATES).find(([name]) => normalized.includes(name) || name.includes(normalized));
  return match ? { address: `${match[0]}, Bhopal, Madhya Pradesh, India`, ...match[1] } : null;
}

function googleMapsUrl(location, address = DEFAULT_CENTER.address) {
  if (location?.lat && location?.lng) {
    return `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

function googleDirectionsUrl(destination) {
  return `https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}`;
}

function mapEmbedUrl(location, query) {
  if (location?.lat && location?.lng) {
    return `https://maps.google.com/maps?q=${location.lat},${location.lng}&z=17&output=embed`;
  }

  const place = query?.trim() ? `${query}, Bhopal, Madhya Pradesh, India` : DEFAULT_CENTER.address;
  return `https://maps.google.com/maps?q=${encodeURIComponent(place)}&z=13&output=embed`;
}

export function MapPicker({
  location,
  onChange,
  readOnly = false,
  height = "h-72",
  placeholder = "Search property location",
  searchButtonLabel = "Search",
  stackedSearch = false,
  enableDirections = readOnly
}) {
  const [query, setQuery] = useState(location?.address || "");
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");
  const selected = coordinatesFrom(location);
  const embedUrl = useMemo(() => mapEmbedUrl(selected, query || location?.address), [selected?.lat, selected?.lng, query, location?.address]);
  const externalUrl = googleMapsUrl(location, location?.address || query);

  function updateLocation(next) {
    onChange?.({
      address: next.address ?? location?.address ?? query ?? "",
      lat: Number(next.lat),
      lng: Number(next.lng)
    });
  }

  function searchLocation() {
    if (!query.trim()) return;

    const match = findKnownLocation(query);
    setError("");

    if (match) {
      updateLocation(match);
      return;
    }

    onChange?.({
      address: `${query}, Bhopal, Madhya Pradesh, India`,
      lat: location?.lat || "",
      lng: location?.lng || ""
    });
    setError("Map preview updated. Exact coordinates ke liye current location use karein ya lat/lng manually fill karein.");
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setError("Current location is not available in this browser");
      return;
    }

    setLocating(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latLng = {
          address: query || "Current location",
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        setLocating(false);
        updateLocation(latLng);
      },
      () => {
        setLocating(false);
        setError("Allow location permission to use current location");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function updateCoordinate(field, value) {
    const next = {
      address: location?.address || query || "",
      lat: field === "lat" ? value : location?.lat || "",
      lng: field === "lng" ? value : location?.lng || ""
    };

    onChange?.(next);
  }

  return (
    <div className="space-y-3">
      {!readOnly && (
        <div className={`flex flex-col gap-2 ${stackedSearch ? "" : "sm:flex-row"}`}>
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              className="input pl-10"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  searchLocation();
                }
              }}
              placeholder={placeholder}
            />
          </div>
          <button className={`${stackedSearch ? "btn-primary w-full py-2" : "btn-muted shrink-0"}`} type="button" onClick={searchLocation}>
            <Search size={16} /> {searchButtonLabel}
          </button>
          <button className={`${stackedSearch ? "btn-muted w-full py-2" : "btn-muted shrink-0"}`} type="button" onClick={useCurrentLocation} disabled={locating}>
            <LocateFixed size={16} /> {locating ? "Locating..." : "Current location"}
          </button>
        </div>
      )}

      {readOnly && enableDirections && selected && (
        <div className="flex flex-wrap gap-2">
          <a className="btn-primary px-4 py-2 text-xs" href={googleDirectionsUrl(selected)} target="_blank" rel="noreferrer">
            <Navigation size={15} /> Route from my location
          </a>
          <a className="btn-muted px-4 py-2 text-xs" href={externalUrl} target="_blank" rel="noreferrer">
            <MapPin size={15} /> Open in Google Maps
          </a>
        </div>
      )}

      <div className={`overflow-hidden rounded-xl border border-slate-200 bg-slate-100 ${height}`}>
        <iframe
          className="h-full w-full"
          title="Google Map"
          src={embedUrl}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      {!readOnly && (
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase text-slate-500">Latitude</span>
            <input className="input" value={location?.lat || ""} onChange={(event) => updateCoordinate("lat", event.target.value)} placeholder="23.2599" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase text-slate-500">Longitude</span>
            <input className="input" value={location?.lng || ""} onChange={(event) => updateCoordinate("lng", event.target.value)} placeholder="77.4126" />
          </label>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
        <MapPin size={14} className="text-primary-500" />
        {location?.lat && location?.lng ? `${Number(location.lat).toFixed(5)}, ${Number(location.lng).toFixed(5)}` : "Search preview, use current location, or enter coordinates"}
      </div>
      {location?.address && <p className="text-xs leading-5 text-slate-500">{location.address}</p>}
      {error && <p className="text-xs font-semibold text-amber-700">{error}</p>}
      {!readOnly && (
        <a className="inline-flex text-xs font-bold text-primary-700 hover:text-primary-900" href={externalUrl} target="_blank" rel="noreferrer">
          Open full Google Maps
        </a>
      )}
    </div>
  );
}
