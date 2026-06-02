import { ROUTES } from "@/constants/app";
import type {
  ActiveRouteCard,
  B2BAssignedRoute,
  B2BEmployee,
  B2BPass,
  B2BTrip,
  ChangeRequestOption,
  CompanyChangeRequest,
  CompanyEmployee,
  CompanyInvoice,
  CompanyLine,
  CompanyNotification,
  CompanyUsagePoint,
  CorporateAccount,
  CorporateClient,
  DriverPassenger,
  DriverPerformance,
  DriverProfile,
  DriverVehicle,
  FleetVehicle,
  HourlyDemandPoint,
  Incident,
  MapLocation,
  MonthlyMetric,
  NearbyBus,
  OnboardingStep,
  PaymentMethodDataPoint,
  PaymentOption,
  RecentSearch,
  RidershipDataPoint,
  RoleOption,
  RouteRevenueDataPoint,
  RouteStop,
} from "@/types/transflex";

// ─── Passenger App Data ─────────────────────────────────────────────────────

export const onboardingSteps: OnboardingStep[] = [
  {
    title: "AI Smart Routing",
    description: "We analyze paths to group passengers for minimal detours. Get home faster.",
    icon: "map",
  },
  {
    title: "Save Money Daily",
    description: "Share your ride. Enjoy dynamic pricing that starts from 300 DA.",
    icon: "clock",
  },
  {
    title: "Live Tracking",
    description: "Track your bus in real time. Know exactly when to walk out.",
    icon: "shield",
  },
];

export const roleOptions: RoleOption[] = [
  {
    id: "passenger",
    title: "Passenger",
    description: "Book smart, affordable shared rides.",
    path: ROUTES.passenger,
  },
  {
    id: "driver",
    title: "Driver",
    description: "Navigate routes and manage passengers.",
    path: ROUTES.driver,
  },
];

export const mapLocations: MapLocation[] = [
  { name: "Kolea", lat: 36.6389, lng: 2.7667, price: 600, eta: 45 },
  { name: "Hydra", lat: 36.7458, lng: 3.0319, price: 400, eta: 25 },
  { name: "Les Anassaires", lat: 36.7431, lng: 3.0719, price: 350, eta: 20 },
  { name: "Kouba", lat: 36.7322, lng: 3.0858, price: 350, eta: 18 },
  { name: "Tafourah", lat: 36.7725, lng: 3.056, price: 300, eta: 15 },
  { name: "Bab Ezzouar", lat: 36.7144, lng: 3.1819, price: 0, eta: 0 },
];

export const sharedRouteStops: RouteStop[] = [
  { name: "Kolea", price: 600, eta: 45, seats: 1, type: "pickup" },
  { name: "Hydra", price: 400, eta: 25, seats: 1, type: "pickup" },
  { name: "Les Anassaires", price: 350, eta: 20, seats: 2, type: "pickup" },
  { name: "Kouba", price: 350, eta: 18, seats: 1, type: "pickup" },
  { name: "Tafourah", price: 300, eta: 15, seats: 1, type: "you" },
];

export const recentSearches: RecentSearch[] = [
  { from: "Hydra", to: "Bab Ezzouar", timeLabel: "2 hours ago" },
  { from: "Kouba", to: "Tafourah", timeLabel: "Yesterday" },
];

// Cashless platform — digital payment methods only.
export const paymentOptions: PaymentOption[] = [
  { id: "wallet", label: "Wallet TransFlex", selected: true },
  { id: "cib", label: "Carte CIB" },
  { id: "baridimob", label: "BaridiMob" },
  { id: "edahabia", label: "Edahabia" },
];

// ─── Driver App Data ─────────────────────────────────────────────────────────

export const initialDriverPassengers: DriverPassenger[] = [
  { id: 1, name: "Amine M.", fare: "400 DA", paymentMethod: "Wallet", destination: "Hydra", checked: false },
  { id: 2, name: "Sarah L.", fare: "Pass entreprise", paymentMethod: "Entreprise", destination: "Hydra", checked: false },
  { id: 3, name: "Karim Z.", fare: "300 DA", paymentMethod: "CIB", destination: "Tafourah", checked: true },
];

export const initialDriverProfile: DriverProfile = {
  name: "Ahmed Driver",
  avatarSrc: "/driver-avatar.png",
  bio: "Hi, I'm Ahmed. I've been driving for 5 years and love meeting new people safely.",
  rating: 4.92,
  rides: "2.4k",
};

export const initialDriverVehicle: DriverVehicle = {
  make: "Peugeot Boxer",
  year: "2021",
  licensePlate: "12345 125 16",
};

export const driverWeeklyEarnings = [
  { day: "Lun", amount: 6800 },
  { day: "Mar", amount: 7400 },
  { day: "Mer", amount: 8100 },
  { day: "Jeu", amount: 6200 },
  { day: "Ven", amount: 9200 },
  { day: "Sam", amount: 5400 },
  { day: "Dim", amount: 4100 },
];

export const driverRecentTrips = [
  { id: "T-2841", from: "Tafourah", to: "Bab Ezzouar", passengers: 9, amount: 2700, time: "08:12", duration: "32 min" },
  { id: "T-2840", from: "Hydra", to: "Bab Ezzouar", passengers: 11, amount: 3300, time: "06:45", duration: "41 min" },
  { id: "T-2839", from: "Kouba", to: "Tafourah", passengers: 7, amount: 2100, time: "Yesterday", duration: "28 min" },
  { id: "T-2838", from: "Kolea", to: "Alger", passengers: 12, amount: 7200, time: "Yesterday", duration: "58 min" },
];

// ─── Admin & Analytics Data ──────────────────────────────────────────────────

export const ridershipData: RidershipDataPoint[] = [
  { day: "Lun", riders: 1180, revenue: 354000, target: 1200 },
  { day: "Mar", riders: 1320, revenue: 396000, target: 1200 },
  { day: "Mer", riders: 1450, revenue: 435000, target: 1300 },
  { day: "Jeu", riders: 1280, revenue: 384000, target: 1300 },
  { day: "Ven", riders: 1620, revenue: 486000, target: 1400 },
  { day: "Sam", riders: 980,  revenue: 294000, target: 900  },
  { day: "Dim", riders: 760,  revenue: 228000, target: 800  },
];

export const routeRevenueData: RouteRevenueDataPoint[] = [
  { route: "Kolea → Alger",          revenue: 125000, rides: 420 },
  { route: "Hydra → Bab Ezzouar",    revenue: 98000,  rides: 380 },
  { route: "Kouba → Centre",         revenue: 87000,  rides: 320 },
  { route: "Tafourah → Bab Ez.",     revenue: 76000,  rides: 290 },
  { route: "Bir Mourad Raïs → Est",  revenue: 54000,  rides: 210 },
  { route: "Bir Touta → Hussein Dey",revenue: 41000,  rides: 158 },
];

// Cashless platform — fully digital payment mix.
export const paymentMethodsData: PaymentMethodDataPoint[] = [
  { name: "Wallet TransFlex", value: 38, color: "#e53935" },
  { name: "Edahabia",         value: 27, color: "#4d9fff" },
  { name: "CIB",              value: 21, color: "#22c55e" },
  { name: "BaridiMob",        value: 14, color: "#f59e0b" },
];

export const hourlyDemandData: HourlyDemandPoint[] = [
  { hour: "06h", demand: 120 },
  { hour: "07h", demand: 340 },
  { hour: "08h", demand: 580 },
  { hour: "09h", demand: 420 },
  { hour: "10h", demand: 280 },
  { hour: "11h", demand: 210 },
  { hour: "12h", demand: 390 },
  { hour: "13h", demand: 450 },
  { hour: "14h", demand: 310 },
  { hour: "15h", demand: 280 },
  { hour: "16h", demand: 350 },
  { hour: "17h", demand: 620 },
  { hour: "18h", demand: 580 },
  { hour: "19h", demand: 380 },
  { hour: "20h", demand: 180 },
];

export const monthlyMetrics: MonthlyMetric[] = [
  { month: "Jan", revenue: 8400000,  riders: 28000, routes: 10 },
  { month: "Fév", revenue: 9200000,  riders: 31000, routes: 11 },
  { month: "Mar", revenue: 10800000, riders: 36000, routes: 12 },
  { month: "Avr", revenue: 11400000, riders: 38000, routes: 12 },
  { month: "Mai", revenue: 12600000, riders: 42000, routes: 13 },
  { month: "Jun", revenue: 13200000, riders: 44000, routes: 14 },
  { month: "Jul", revenue: 11000000, riders: 36500, routes: 13 },
  { month: "Aoû", revenue: 10200000, riders: 34000, routes: 12 },
  { month: "Sep", revenue: 13800000, riders: 46000, routes: 15 },
  { month: "Oct", revenue: 14600000, riders: 49000, routes: 15 },
  { month: "Nov", revenue: 15200000, riders: 51000, routes: 16 },
  { month: "Déc", revenue: 16400000, riders: 55000, routes: 17 },
];

// ─── Fleet Data ──────────────────────────────────────────────────────────────

export const fleetVehicles: FleetVehicle[] = [
  { id: "TF-401", driver: "Ahmed Benali",   route: "R-01", status: "active",      passengers: 12, capacity: 15, speed: 47, fuel: 72, nextStop: "Hydra",           eta: 4,  lat: 36.7625, lng: 3.0470 },
  { id: "TF-402", driver: "Karim Mansouri", route: "R-02", status: "active",      passengers: 9,  capacity: 15, speed: 52, fuel: 58, nextStop: "Kouba",           eta: 7,  lat: 36.7330, lng: 3.0820 },
  { id: "TF-403", driver: "Youcef Taleb",   route: "R-03", status: "delayed",     passengers: 14, capacity: 15, speed: 18, fuel: 45, nextStop: "Centre",          eta: 18, lat: 36.7710, lng: 3.0590 },
  { id: "TF-404", driver: "Mourad Haddad",  route: "R-04", status: "active",      passengers: 6,  capacity: 15, speed: 61, fuel: 88, nextStop: "Bab Ezzouar",     eta: 12, lat: 36.7180, lng: 3.1700 },
  { id: "TF-405", driver: "Samir Meziane",  route: "R-05", status: "active",      passengers: 11, capacity: 15, speed: 43, fuel: 33, nextStop: "Les Anassaires",  eta: 5,  lat: 36.7440, lng: 3.0710 },
  { id: "TF-406", driver: "Omar Boukhari",  route: "R-01", status: "maintenance", passengers: 0,  capacity: 15, speed: 0,  fuel: 90, nextStop: "—",               eta: 0,  lat: 36.7560, lng: 3.0420 },
  { id: "TF-407", driver: "Farid Nouri",    route: "R-02", status: "active",      passengers: 8,  capacity: 15, speed: 55, fuel: 62, nextStop: "Hydra",           eta: 9,  lat: 36.7505, lng: 3.0360 },
  { id: "TF-408", driver: "Rachid Amari",   route: "R-06", status: "offline",     passengers: 0,  capacity: 15, speed: 0,  fuel: 15, nextStop: "—",               eta: 0,  lat: 36.7900, lng: 3.0500 },
  { id: "TF-409", driver: "Walid Cherif",   route: "R-03", status: "active",      passengers: 10, capacity: 15, speed: 38, fuel: 54, nextStop: "Kouba",           eta: 11, lat: 36.7300, lng: 3.0900 },
  { id: "TF-410", driver: "Hamid Ziani",    route: "R-04", status: "active",      passengers: 13, capacity: 15, speed: 49, fuel: 78, nextStop: "Centre",          eta: 6,  lat: 36.7650, lng: 3.1200 },
];

// ─── Incidents Data ──────────────────────────────────────────────────────────

export const incidents: Incident[] = [
  { id: 1, type: "sos",         severity: "critical", title: "SOS — Urgence Passagère",         location: "Rue Didouche Mourad",     time: "2 min",   status: "responding",  vehicle: "TF-403" },
  { id: 2, type: "complaint",   severity: "medium",   title: "Retard — 22 min de délai",         location: "Route R-02",              time: "14 min",  status: "open",        vehicle: "TF-402" },
  { id: 3, type: "disruption",  severity: "high",     title: "Obstruction Trafic",               location: "Blvd Zighout Youcef",     time: "28 min",  status: "rerouting",   vehicle: "TF-407" },
  { id: 4, type: "complaint",   severity: "low",      title: "Rapport Comportement Conducteur",  location: "Route R-05",              time: "1h",      status: "review",      vehicle: "TF-405" },
  { id: 5, type: "maintenance", severity: "medium",   title: "Voyant Moteur Allumé",             location: "Dépôt — Emplacement B4",  time: "2h",      status: "scheduled",   vehicle: "TF-406" },
  { id: 6, type: "disruption",  severity: "low",      title: "Fermeture Route Mineure",          location: "Ave de l'ALN",            time: "3h",      status: "resolved",    vehicle: "Tous"   },
];

// ─── Corporate Clients ───────────────────────────────────────────────────────

export const corporateClients: CorporateClient[] = [
  { name: "Air Algérie",  industry: "Aviation",    employees: 520, trips: 1580, revenue: 711000, plan: "Enterprise+", status: "active",  growth: 22  },
  { name: "Djezzy",       industry: "Télécom",     employees: 280, trips: 890,  revenue: 400500, plan: "Business",    status: "active",  growth: 8   },
  { name: "BNA Bank",     industry: "Finance",     employees: 320, trips: 720,  revenue: 324000, plan: "Business",    status: "active",  growth: -3  },
  { name: "CAAR",         industry: "Assurance",   employees: 180, trips: 460,  revenue: 207000, plan: "Standard",    status: "active",  growth: 15  },
  { name: "Ooredoo",      industry: "Télécom",     employees: 210, trips: 380,  revenue: 171000, plan: "Standard",    status: "pending", growth: 0   },
  { name: "CNEP Bank",    industry: "Finance",     employees: 290, trips: 680,  revenue: 306000, plan: "Business",    status: "active",  growth: 5   },
  { name: "Condor",       industry: "Électronique",employees: 350, trips: 920,  revenue: 414000, plan: "Enterprise",  status: "active",  growth: 18  },
];

// ─── Driver Leaderboard ──────────────────────────────────────────────────────

export const driverPerformance: DriverPerformance[] = [
  { id: "D-001", name: "Ahmed Benali",   rating: 4.97, rides: 312, acceptance: 99, cancellation: 1,  earnings: 186240, status: "active"  },
  { id: "D-002", name: "Mourad Haddad",  rating: 4.94, rides: 298, acceptance: 98, cancellation: 1,  earnings: 174800, status: "active"  },
  { id: "D-003", name: "Hamid Ziani",    rating: 4.92, rides: 287, acceptance: 97, cancellation: 2,  earnings: 168200, status: "active"  },
  { id: "D-004", name: "Walid Cherif",   rating: 4.89, rides: 274, acceptance: 96, cancellation: 2,  earnings: 159600, status: "active"  },
  { id: "D-005", name: "Farid Nouri",    rating: 4.87, rides: 261, acceptance: 95, cancellation: 3,  earnings: 152000, status: "active"  },
  { id: "D-006", name: "Karim Mansouri", rating: 4.85, rides: 248, acceptance: 94, cancellation: 3,  earnings: 144800, status: "active"  },
  { id: "D-007", name: "Samir Meziane",  rating: 4.82, rides: 235, acceptance: 93, cancellation: 4,  earnings: 138200, status: "break"   },
  { id: "D-008", name: "Omar Boukhari",  rating: 4.74, rides: 198, acceptance: 89, cancellation: 6,  earnings: 112400, status: "offline" },
];

// ─── Live Nearby Data (Passenger Real-time Layer) ─────────────────────────────

export const nearbyBuses: NearbyBus[] = [
  { id: "TF-401", lat: 36.7695, lng: 3.0540, heading: 128, seatsLeft: 4, seatsTotal: 15, route: "Tafourah → Bab Ezzouar", eta: 3  },
  { id: "TF-403", lat: 36.7618, lng: 3.0632, heading:  92, seatsLeft: 8, seatsTotal: 15, route: "Hydra → Hussein Dey",    eta: 7  },
  { id: "TF-407", lat: 36.7755, lng: 3.0488, heading: 172, seatsLeft: 2, seatsTotal: 15, route: "El Biar → Kouba",        eta: 5  },
  { id: "TF-410", lat: 36.7540, lng: 3.0700, heading:  45, seatsLeft: 6, seatsTotal: 15, route: "Kouba → Aéroport",       eta: 12 },
];

export const activeRoutesNearby: ActiveRouteCard[] = [
  { id: "R01", from: "Tafourah", to: "Bab Ezzouar", busId: "TF-401", driverName: "Ahmed Benali",   seatsLeft: 4, seatsTotal: 15, eta: 3,  price: 350, duration: 28 },
  { id: "R02", from: "Hydra",    to: "Hussein Dey", busId: "TF-403", driverName: "Youcef Taleb",   seatsLeft: 8, seatsTotal: 15, eta: 7,  price: 280, duration: 22 },
  { id: "R03", from: "El Biar",  to: "Kouba",       busId: "TF-407", driverName: "Farid Nouri",    seatsLeft: 2, seatsTotal: 15, eta: 5,  price: 320, duration: 18 },
];

// ─── B2B (Corporate Rider) Data ───────────────────────────────────────────────

// Valid enterprise codes for the B2B "Connexion Entreprise" screen.
export const corporateAccounts: CorporateAccount[] = [
  { code: "ENT-ENTERPRISE", company: "Entreprise", logoColor: "#e53935" },
  { code: "ENT-DJEZZY",     company: "Djezzy",      logoColor: "#22c55e" },
  { code: "ENT-OOREDOO",    company: "Ooredoo",     logoColor: "#e11d48" },
  { code: "ENT-AIRALGERIE", company: "Air Algérie", logoColor: "#4d9fff" },
];

export const b2bEmployee: B2BEmployee = {
  name: "Yacine Belkacem",
  company: "Entreprise",
  matricule: "EMP-48217",
  department: "Direction Exploration & Production",
  phone: "+213 661 24 88 17",
};

export const b2bAssignedRoute: B2BAssignedRoute = {
  lineName: "Navette L-12 · Centre",
  from: "Bab El Oued",
  to: "Bab Ezzouar",
  boardingStop: "Bab El Oued (Place des Martyrs)",
  dropoffStop: "Siège entreprise — Bab Ezzouar",
  departure: "07:15",
  arrival: "08:05",
  busId: "TF-407",
  driverName: "Farid Nouri",
  vehicle: "Mercedes Sprinter · 16-12345-118",
  seatsLeft: 5,
  seatsTotal: 16,
};

export const b2bPass: B2BPass = {
  company: "Entreprise",
  plan: "Abonnement Entreprise · Illimité",
  lineName: "Navette L-12 · Centre",
  expiresOn: "31 déc. 2026",
  daysLeft: 213,
};

export const b2bTrips: B2BTrip[] = [
  { id: "B-7042", date: "Aujourd'hui · 07:15", line: "Navette L-12 · Centre", status: "completed", driver: "Farid Nouri",   vehicle: "TF-407" },
  { id: "B-7038", date: "Hier · 07:15",        line: "Navette L-12 · Centre", status: "completed", driver: "Farid Nouri",   vehicle: "TF-407" },
  { id: "B-7034", date: "Hier · 17:30",        line: "Retour L-12",              status: "completed", driver: "Samir Meziane", vehicle: "TF-405" },
  { id: "B-7029", date: "28 mai · 07:15",      line: "Navette L-12 · Centre", status: "cancelled", driver: "Farid Nouri",   vehicle: "TF-407" },
  { id: "B-7021", date: "27 mai · 07:15",      line: "Navette L-12 · Centre", status: "completed", driver: "Karim Mansouri",vehicle: "TF-402" },
];

// Change-request options allowed by the company. `available` drives the
// automatic APPROUVÉ / REFUSÉ logic (capacity + company rules).
export const b2bChangeOptions: ChangeRequestOption[] = [
  { id: "ch-1", kind: "schedule",  label: "Départ 08:00",          detail: "Navette L-12 · 8 places libres",  available: true  },
  { id: "ch-2", kind: "schedule",  label: "Départ 06:45",          detail: "Navette L-12 · complet",          available: false },
  { id: "ch-3", kind: "bus",       label: "Bus TF-402 (Karim M.)", detail: "Même ligne · 3 places libres",    available: true  },
  { id: "ch-4", kind: "departure", label: "Montée à El Biar",      detail: "Arrêt autorisé · 5 places libres",available: true  },
  { id: "ch-5", kind: "departure", label: "Montée à Chéraga",      detail: "Hors périmètre entreprise",       available: false },
];

// ─── Company (Enterprise Client) Portal Data — scoped to enterprise ──────────

export const companyProfile = {
  name: "Entreprise",
  code: "COMP-ENTERPRISE",
  email: "transport@entreprise.dz",
  plan: "Enterprise+",
  color: "#a78bfa",
  enrolled: 318,
  activeToday: 254,
  tripsThisMonth: 5840,
  occupancyRate: 86,
  punctuality: 94.2,
  co2SavedKg: 12480,
  costPerEmployee: 4200,
};

// Company's own fleet (subset of the global fleet), with live coordinates.
export const companyFleetVehicles: FleetVehicle[] = [
  { id: "TF-407", driver: "Farid Nouri",    route: "L-12", status: "active",  passengers: 11, capacity: 16, speed: 55, fuel: 62, nextStop: "Bab Ezzouar",  eta: 9,  lat: 36.7505, lng: 3.0360 },
  { id: "TF-405", driver: "Samir Meziane",  route: "L-08", status: "active",  passengers: 13, capacity: 16, speed: 43, fuel: 48, nextStop: "Hydra",        eta: 5,  lat: 36.7440, lng: 3.0710 },
  { id: "TF-402", driver: "Karim Mansouri", route: "L-12", status: "delayed", passengers: 15, capacity: 16, speed: 16, fuel: 51, nextStop: "El Harrach",   eta: 17, lat: 36.7330, lng: 3.0820 },
  { id: "TF-410", driver: "Hamid Ziani",    route: "L-05", status: "active",  passengers: 9,  capacity: 16, speed: 49, fuel: 78, nextStop: "Hussein Dey",  eta: 6,  lat: 36.7650, lng: 3.1200 },
  { id: "TF-414", driver: "Nabil Ferhat",   route: "L-08", status: "maintenance", passengers: 0, capacity: 16, speed: 0, fuel: 90, nextStop: "—",          eta: 0,  lat: 36.7560, lng: 3.0420 },
];

export const companyLines: CompanyLine[] = [
  { id: "L-12", name: "Navette L-12 · Centre", from: "Bab El Oued",  to: "Bab Ezzouar",  capacity: 32, occupancy: 28, enrolled: 96, punctuality: 95 },
  { id: "L-08", name: "Navette L-08 · Sud",    from: "Hydra",        to: "Bab Ezzouar",  capacity: 32, occupancy: 24, enrolled: 84, punctuality: 92 },
  { id: "L-05", name: "Navette L-05 · Est",    from: "Hussein Dey",  to: "Bab Ezzouar",  capacity: 16, occupancy: 11, enrolled: 58, punctuality: 97 },
  { id: "L-03", name: "Navette L-03 · Ouest",  from: "Chéraga",      to: "Bab Ezzouar",  capacity: 16, occupancy: 14, enrolled: 80, punctuality: 90 },
];

export const companyEmployees: CompanyEmployee[] = [
  { id: "E-001", name: "Yacine Belkacem",  matricule: "EMP-48217", department: "Exploration & Production", line: "L-12", status: "active",   activeToday: true  },
  { id: "E-002", name: "Lila Hamdani",     matricule: "EMP-48311", department: "Finance",                  line: "L-08", status: "active",   activeToday: true  },
  { id: "E-003", name: "Sofiane Brahimi",  matricule: "EMP-47980", department: "Ressources Humaines",      line: "L-05", status: "active",   activeToday: false },
  { id: "E-004", name: "Nadia Cherifi",    matricule: "EMP-48402", department: "Juridique",                line: "L-12", status: "active",   activeToday: true  },
  { id: "E-005", name: "Réda Maalem",      matricule: "EMP-48155", department: "Exploration & Production", line: "L-03", status: "inactive", activeToday: false },
  { id: "E-006", name: "Imène Saadi",      matricule: "EMP-48520", department: "Communication",            line: "L-08", status: "active",   activeToday: true  },
  { id: "E-007", name: "Walid Bensalem",   matricule: "EMP-47712", department: "Logistique",               line: "L-12", status: "active",   activeToday: true  },
  { id: "E-008", name: "Amel Touati",      matricule: "EMP-48633", department: "Finance",                  line: "L-05", status: "active",   activeToday: false },
];

export const companyChangeRequests: CompanyChangeRequest[] = [
  { id: "CR-104", employee: "Yacine Belkacem", currentLine: "L-12", requestedLine: "L-08 · 08:00", status: "approved", reason: "Place disponible",          time: "Il y a 12 min" },
  { id: "CR-103", employee: "Imène Saadi",     currentLine: "L-08", requestedLine: "L-12 · 06:45", status: "refused",  reason: "Navette complète",          time: "Il y a 1 h"    },
  { id: "CR-102", employee: "Nadia Cherifi",   currentLine: "L-12", requestedLine: "Montée El Biar", status: "approved", reason: "Arrêt autorisé",          time: "Il y a 3 h"    },
  { id: "CR-101", employee: "Réda Maalem",     currentLine: "L-03", requestedLine: "Montée Chéraga", status: "refused",  reason: "Hors périmètre entreprise", time: "Hier"          },
  { id: "CR-100", employee: "Walid Bensalem",  currentLine: "L-12", requestedLine: "L-05 · 07:30", status: "approved", reason: "Place disponible",          time: "Hier"          },
];

export const companyInvoices: CompanyInvoice[] = [
  { ref: "FACT-2026-06", period: "Juin 2026",     employees: 318, total: 1335600, status: "pending" },
  { ref: "FACT-2026-05", period: "Mai 2026",      employees: 312, total: 1310400, status: "paid"    },
  { ref: "FACT-2026-04", period: "Avril 2026",    employees: 305, total: 1281000, status: "paid"    },
  { ref: "FACT-2026-03", period: "Mars 2026",     employees: 298, total: 1251600, status: "paid"    },
];

export const companyUsageDaily: CompanyUsagePoint[] = [
  { label: "Lun", trips: 248, employees: 226 },
  { label: "Mar", trips: 262, employees: 238 },
  { label: "Mer", trips: 271, employees: 244 },
  { label: "Jeu", trips: 256, employees: 231 },
  { label: "Ven", trips: 198, employees: 182 },
  { label: "Sam", trips: 84,  employees: 71  },
  { label: "Dim", trips: 36,  employees: 30  },
];

export const companyUsageWeekly: CompanyUsagePoint[] = [
  { label: "S-4", trips: 1280, employees: 248 },
  { label: "S-3", trips: 1340, employees: 256 },
  { label: "S-2", trips: 1410, employees: 261 },
  { label: "S-1", trips: 1355, employees: 254 },
];

export const companyUsageMonthly: CompanyUsagePoint[] = [
  { label: "Jan", trips: 5120, employees: 282 },
  { label: "Fév", trips: 5340, employees: 290 },
  { label: "Mar", trips: 5610, employees: 298 },
  { label: "Avr", trips: 5480, employees: 305 },
  { label: "Mai", trips: 5720, employees: 312 },
  { label: "Jun", trips: 5840, employees: 318 },
];

export const companyNotifications: CompanyNotification[] = [
  { id: 1, type: "delay",     title: "Retard navette L-12",       detail: "TF-402 — 17 min de retard vers Bab Ezzouar.", time: "5 min",  unread: true  },
  { id: 2, type: "occupancy", title: "Occupation élevée · L-12",  detail: "Navette à 94% de sa capacité ce matin.",       time: "22 min", unread: true  },
  { id: 3, type: "offline",   title: "Bus hors service",          detail: "TF-414 en maintenance — réaffectation auto.", time: "1 h",    unread: false },
  { id: 4, type: "incident",  title: "Incident signalé · L-08",   detail: "Obstruction trafic, déviation appliquée.",     time: "2 h",    unread: false },
];

// Shared ride stops for the default Tafourah → Bab Ezzouar route (shown in tracking).
export const rideStops: { name: string; done: boolean }[] = [
  { name: "Koléa (Départ bus)", done: true  },
  { name: "Cheraga",            done: true  },
  { name: "El Biar",            done: true  },
  { name: "Hydra",              done: true  },
  { name: "Tafourah (Vous)",    done: false },
  { name: "Les Annassers",      done: false },
  { name: "El Harrach",         done: false },
  { name: "Bab Ezzouar",        done: false },
];
