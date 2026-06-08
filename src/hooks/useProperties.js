import { useCallback, useEffect, useState } from "react";
import { getProperties } from "../services/propertyService.js";

function cleanParams(params) {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== "" && value !== undefined && value !== null));
}

export function useProperties(initialFilters) {
  const [filters, setFilters] = useState(initialFilters);
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadProperties = useCallback(
    async (params = filters) => {
      setLoading(true);
      setError("");

      try {
        const data = await getProperties(cleanParams(params));
        setProperties(data.properties || []);

        if (import.meta.env.DEV) {
          console.log("[Explore] properties fetched:", {
            count: data.properties?.length || 0,
            total: data.total,
            params: cleanParams(params)
          });
        }
      } catch (err) {
        setError(err.message);

        if (import.meta.env.DEV) {
          console.error("[Explore] property fetch failed:", err.message);
        }
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    loadProperties(initialFilters);
  }, []);

  useEffect(() => {
    function refreshProperties() {
      loadProperties();
    }

    window.addEventListener("focus", refreshProperties);
    window.addEventListener("rentromitra:properties-changed", refreshProperties);

    return () => {
      window.removeEventListener("focus", refreshProperties);
      window.removeEventListener("rentromitra:properties-changed", refreshProperties);
    };
  }, [loadProperties]);

  return { filters, setFilters, properties, error, loading, loadProperties };
}
