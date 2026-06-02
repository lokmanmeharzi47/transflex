// Real road routing via OSRM (public demo server) with a graceful fallback.
import { haversine, type LatLng } from "./places";

const OSRM_BASE = "https://router.project-osrm.org/route/v1/driving";

export interface RouteLeg {
  /** seconds */
  duration: number;
  /** metres */
  distance: number;
}

export interface Route {
  /** Full geometry as [lat, lng] points (road-following when OSRM succeeds). */
  path: LatLng[];
  /** Cumulative distance (m) at each path point — path.length entries. */
  cumulative: number[];
  /** Total distance in metres. */
  distance: number;
  /** Total duration in seconds. */
  duration: number;
  /** Per-waypoint legs (legs.length === waypoints.length - 1). */
  legs: RouteLeg[];
  /** Index into `path` for each input waypoint. */
  waypointIndices: number[];
  /** True when geometry came from OSRM, false when straight-line fallback. */
  real: boolean;
}

function buildCumulative(path: LatLng[]): number[] {
  const cum = [0];
  for (let i = 1; i < path.length; i++) {
    cum.push(cum[i - 1] + haversine(path[i - 1], path[i]));
  }
  return cum;
}

/** Straight-line fallback used when OSRM is unreachable (offline / rate-limited). */
function fallbackRoute(waypoints: LatLng[]): Route {
  const path: LatLng[] = [];
  const waypointIndices: number[] = [];
  const legs: RouteLeg[] = [];
  const STEPS = 24;

  for (let w = 0; w < waypoints.length; w++) {
    waypointIndices.push(path.length === 0 ? 0 : path.length);
    if (w === 0) {
      path.push(waypoints[0]);
      continue;
    }
    const a = waypoints[w - 1];
    const b = waypoints[w];
    for (let s = 1; s <= STEPS; s++) {
      const t = s / STEPS;
      path.push({ lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t });
    }
    waypointIndices[w] = path.length - 1;
    const legDist = haversine(a, b) * 1.3; // road detour factor
    legs.push({ distance: legDist, duration: legDist / 8.3 }); // ~30 km/h urban
  }

  const cumulative = buildCumulative(path);
  return {
    path,
    cumulative,
    distance: cumulative[cumulative.length - 1],
    duration: legs.reduce((s, l) => s + l.duration, 0),
    legs,
    waypointIndices,
    real: false,
  };
}

/**
 * Fetch a real driving route through the given waypoints (≥2).
 * Returns road-following geometry, distance, duration and per-leg breakdown.
 */
export async function fetchRoute(
  waypoints: LatLng[],
  signal?: AbortSignal,
): Promise<Route> {
  if (waypoints.length < 2) {
    throw new Error("fetchRoute requires at least 2 waypoints");
  }

  const coords = waypoints.map(w => `${w.lng},${w.lat}`).join(";");
  const url = `${OSRM_BASE}/${coords}?overview=full&geometries=geojson&steps=false&annotations=false`;

  try {
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`OSRM ${res.status}`);
    const data = await res.json();
    const route = data?.routes?.[0];
    if (!route?.geometry?.coordinates?.length) throw new Error("OSRM empty geometry");

    const path: LatLng[] = route.geometry.coordinates.map(
      ([lng, lat]: [number, number]) => ({ lat, lng }),
    );
    const cumulative = buildCumulative(path);
    const legs: RouteLeg[] = (route.legs ?? []).map(
      (l: { duration: number; distance: number }) => ({ duration: l.duration, distance: l.distance }),
    );

    // Map each waypoint to its nearest path index (for per-leg progress).
    const waypointIndices = waypoints.map(w => {
      let best = 0;
      let bestD = Infinity;
      for (let i = 0; i < path.length; i++) {
        const d = haversine(path[i], w);
        if (d < bestD) { bestD = d; best = i; }
      }
      return best;
    });
    waypointIndices[0] = 0;
    waypointIndices[waypointIndices.length - 1] = path.length - 1;

    return {
      path,
      cumulative,
      distance: route.distance,
      duration: route.duration,
      legs: legs.length ? legs : [{ distance: route.distance, duration: route.duration }],
      waypointIndices,
      real: true,
    };
  } catch {
    return fallbackRoute(waypoints);
  }
}

/** Interpolated position at a fraction (0..1) of the route, by distance. */
export function positionAt(route: Route, fraction: number): LatLng {
  const f = Math.min(1, Math.max(0, fraction));
  const target = route.distance * f;
  const { path, cumulative } = route;
  if (f <= 0) return path[0];
  if (f >= 1) return path[path.length - 1];

  let i = 1;
  while (i < cumulative.length && cumulative[i] < target) i++;
  const segStart = cumulative[i - 1];
  const segEnd = cumulative[i];
  const segLen = segEnd - segStart || 1;
  const t = (target - segStart) / segLen;
  const a = path[i - 1];
  const b = path[i];
  return { lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t };
}

/** Compass bearing (deg, 0=N) from a to b — used to rotate the vehicle icon. */
export function bearing(a: LatLng, b: LatLng): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;
  const y = Math.sin(toRad(b.lng - a.lng)) * Math.cos(toRad(b.lat));
  const x =
    Math.cos(toRad(a.lat)) * Math.sin(toRad(b.lat)) -
    Math.sin(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.cos(toRad(b.lng - a.lng));
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/** Fraction (0..1) along the route corresponding to a given waypoint index. */
export function fractionAtWaypoint(route: Route, waypoint: number): number {
  const idx = route.waypointIndices[waypoint] ?? 0;
  return route.distance ? route.cumulative[idx] / route.distance : 0;
}

export function formatDuration(seconds: number): string {
  const m = Math.max(1, Math.round(seconds / 60));
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)}h ${m % 60}min`;
}
