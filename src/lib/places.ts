// Real Algiers gazetteer + geo helpers.
// Coordinates are real WGS84 lat/lng for neighbourhoods served by TransFlex.

export interface Place {
  id: string;
  name: string;
  aliases: string[];
  lat: number;
  lng: number;
}

export const PLACES: Place[] = [
  { id: "tafourah",     name: "Tafourah",            aliases: ["tafoura", "place du 1er mai", "alger centre", "centre"], lat: 36.7700, lng: 3.0560 },
  { id: "bab-ezzouar",  name: "Bab Ezzouar",         aliases: ["bab ez", "babezzouar", "usthb", "uni"],                  lat: 36.7166, lng: 3.1843 },
  { id: "hydra",        name: "Hydra",               aliases: ["hidra"],                                                  lat: 36.7458, lng: 3.0319 },
  { id: "kouba",        name: "Kouba",               aliases: ["el kouba"],                                               lat: 36.7282, lng: 3.0830 },
  { id: "les-annassers",name: "Les Annassers",       aliases: ["anassaires", "annassers", "les anassaires"],              lat: 36.7431, lng: 3.0719 },
  { id: "kolea",        name: "Koléa",               aliases: ["kolea", "koléa"],                                         lat: 36.6389, lng: 2.7667 },
  { id: "el-harrach",   name: "El Harrach",          aliases: ["harrach"],                                                lat: 36.7156, lng: 3.1356 },
  { id: "hussein-dey",  name: "Hussein Dey",         aliases: ["hussein"],                                                lat: 36.7400, lng: 3.1100 },
  { id: "bir-mourad",   name: "Bir Mourad Raïs",     aliases: ["bir mourad rais", "bmr"],                                 lat: 36.7350, lng: 3.0500 },
  { id: "aeroport",     name: "Aéroport H. Boumediene", aliases: ["aeroport", "airport", "houari boumediene"],            lat: 36.6910, lng: 3.2155 },
  { id: "dar-el-beida", name: "Dar El Beïda",        aliases: ["dar el beida", "dar elbeida"],                            lat: 36.7150, lng: 3.2120 },
  { id: "bordj-kiffan", name: "Bordj El Kiffan",     aliases: ["bordj el kiffan", "bordj"],                               lat: 36.7470, lng: 3.1930 },
  { id: "bab-el-oued",  name: "Bab El Oued",         aliases: ["bab eloued", "bab el oued"],                              lat: 36.7942, lng: 3.0497 },
  { id: "el-biar",      name: "El Biar",             aliases: ["elbiar"],                                                 lat: 36.7669, lng: 3.0244 },
  { id: "cheraga",      name: "Chéraga",             aliases: ["cheraga", "chéraga"],                                     lat: 36.7660, lng: 2.9580 },
];

const norm = (s: string) =>
  s.toLowerCase().trim().normalize("NFD").replace(/[̀-ͯ]/g, "");

/** Resolve a free-text place query to a known Place (best effort). */
export function findPlace(query: string): Place | undefined {
  const q = norm(query);
  if (!q) return undefined;
  // exact name / alias
  let hit = PLACES.find(p => norm(p.name) === q || p.aliases.some(a => norm(a) === q));
  if (hit) return hit;
  // startsWith / contains on name or alias
  hit = PLACES.find(p => norm(p.name).startsWith(q) || p.aliases.some(a => norm(a).startsWith(q)));
  if (hit) return hit;
  hit = PLACES.find(p => norm(p.name).includes(q) || p.aliases.some(a => norm(a).includes(q)));
  return hit;
}

export interface LatLng { lat: number; lng: number }

const R = 6371000; // earth radius (m)
const toRad = (d: number) => (d * Math.PI) / 180;

/** Haversine distance in metres. */
export function haversine(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Estimated walking time (minutes) for a distance in metres, at ~1.35 m/s. */
export function walkingMinutes(metres: number): number {
  return Math.max(1, Math.round(metres / 1.35 / 60));
}

/** Nearest point of a polyline to a target, returned with along-route distance. */
export function nearestOnPath(
  path: LatLng[],
  target: LatLng,
): { point: LatLng; index: number; distance: number } {
  let best = { point: path[0], index: 0, distance: Infinity };
  for (let i = 0; i < path.length; i++) {
    const d = haversine(path[i], target);
    if (d < best.distance) best = { point: path[i], index: i, distance: d };
  }
  return best;
}

export function formatKm(metres: number): string {
  return metres < 1000 ? `${Math.round(metres)} m` : `${(metres / 1000).toFixed(1)} km`;
}
