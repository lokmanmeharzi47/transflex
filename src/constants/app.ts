export const APP_NAME = "TransFlex";
export const APP_TAGLINE = "Cities Move Better";
export const APP_DESCRIPTION = "Smart shared mobility platform for Algeria.";
export const APP_VERSION = "2.0.0";
export const APP_COMPANY = "TransFlex Technologies SAS";

export const ROUTES = {
  splash: "/splash",
  passenger: "/passenger",
  passengerSearch: "/passenger/search",
  passengerRoute: "/passenger/route",
  passengerTracking: "/passenger/tracking",
  b2b: "/b2b",
  b2bDashboard: "/b2b/dashboard",
  b2bTracking: "/b2b/tracking",
  b2bChange: "/b2b/change",
  b2bTrips: "/b2b/trips",
  b2bProfile: "/b2b/profile",
  driver: "/driver",
  company: "/company",
  admin: "/admin",
  operator: "/operator",
} as const;

export const VEHICLE_CAPACITY = 15;
export const EXISTING_BOARDINGS = 5;

export const ALGIERS_MAP_CENTER = {
  lat: 36.7,
  lng: 2.97,
  zoom: 11,
} as const;
