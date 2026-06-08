import { useEffect, useMemo, useState } from "react";
import { BHOPAL_COLLEGES, BHOPAL_LOCALITIES } from "../data/bhopal.js";
import { getAreas, getColleges } from "../services/locationService.js";

function uniqueNames(items, key, fallback) {
  const names = items.map((item) => item[key]).filter(Boolean);
  return [...new Set(names.length ? names : fallback)].sort((a, b) => a.localeCompare(b));
}

export function useBhopalLocations() {
  const [areas, setAreas] = useState([]);
  const [colleges, setColleges] = useState([]);

  useEffect(() => {
    let mounted = true;

    Promise.all([getAreas(), getColleges()])
      .then(([areaData, collegeData]) => {
        if (!mounted) return;
        setAreas(areaData);
        setColleges(collegeData);
      })
      .catch(() => {
        if (!mounted) return;
        setAreas(BHOPAL_LOCALITIES.map((areaName) => ({ areaName, city: "Bhopal" })));
        setColleges(BHOPAL_COLLEGES.map((collegeName) => ({ collegeName, city: "Bhopal" })));
      });

    return () => {
      mounted = false;
    };
  }, []);

  const areaNames = useMemo(() => uniqueNames(areas, "areaName", BHOPAL_LOCALITIES), [areas]);
  const collegeNames = useMemo(() => uniqueNames(colleges, "collegeName", BHOPAL_COLLEGES), [colleges]);

  return { areas, colleges, areaNames, collegeNames };
}
