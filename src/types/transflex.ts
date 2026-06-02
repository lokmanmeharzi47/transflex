export type UserRoleId = "passenger" | "b2b" | "driver" | "company" | "operator" | "admin";

export type OnboardingIconKey = "map" | "clock" | "shield";

export interface OnboardingStep {
  title: string;
  description: string;
  icon: OnboardingIconKey;
}

export interface RoleOption {
  id: UserRoleId;
  title: string;
  description: string;
  path: string;
}

export interface MapLocation {
  name: string;
  lat: number;
  lng: number;
  price: number;
  eta: number;
}

export type RouteStopType = "pickup" | "you" | "destination";

export interface RouteStop {
  name: string;
  price: number;
  eta: number;
  seats: number;
  type: RouteStopType;
}

export interface RecentSearch {
  from: string;
  to: string;
  timeLabel: string;
}

export type PaymentOptionId = "cib" | "baridimob" | "edahabia" | "wallet";

export interface PaymentOption {
  id: PaymentOptionId;
  label: string;
  selected?: boolean;
}

export interface DriverPassenger {
  id: number;
  name: string;
  fare: string;
  paymentMethod: "Wallet" | "CIB" | "BaridiMob" | "Prepaid" | "Entreprise";
  destination: string;
  checked: boolean;
}

export interface DriverProfile {
  name: string;
  avatarSrc: string;
  bio: string;
  rating: number;
  rides: string;
}

export interface DriverVehicle {
  make: string;
  year: string;
  licensePlate: string;
}

// ─── Fleet & Admin Types ────────────────────────────────────────────────────

export type VehicleStatus = "active" | "delayed" | "maintenance" | "offline";
export type IncidentType = "sos" | "complaint" | "disruption" | "maintenance";
export type IncidentSeverity = "critical" | "high" | "medium" | "low";
export type IncidentStatus = "responding" | "rerouting" | "open" | "review" | "scheduled" | "resolved";
export type SubscriptionPlan = "Enterprise+" | "Enterprise" | "Business" | "Standard";
export type AdminTab = "overview" | "fleet" | "analytics" | "incidents" | "corporate";
export type OperatorTab = "overview" | "live" | "fleet" | "routes" | "earnings" | "drivers";

export interface FleetVehicle {
  id: string;
  driver: string;
  route: string;
  status: VehicleStatus;
  passengers: number;
  capacity: number;
  speed: number;
  fuel: number;
  nextStop: string;
  eta: number;
  lat?: number;
  lng?: number;
}

export interface Incident {
  id: number;
  type: IncidentType;
  severity: IncidentSeverity;
  title: string;
  location: string;
  time: string;
  status: IncidentStatus;
  vehicle: string;
}

export interface CorporateClient {
  name: string;
  industry: string;
  employees: number;
  trips: number;
  revenue: number;
  plan: SubscriptionPlan;
  status: "active" | "pending" | "suspended";
  growth: number;
}

export interface RidershipDataPoint {
  day: string;
  riders: number;
  revenue: number;
  target?: number;
}

export interface RouteRevenueDataPoint {
  route: string;
  revenue: number;
  rides: number;
}

export interface PaymentMethodDataPoint {
  name: string;
  value: number;
  color: string;
}

export interface HourlyDemandPoint {
  hour: string;
  demand: number;
}

export interface MonthlyMetric {
  month: string;
  revenue: number;
  riders: number;
  routes: number;
}

export interface DriverPerformance {
  id: string;
  name: string;
  rating: number;
  rides: number;
  acceptance: number;
  cancellation: number;
  earnings: number;
  status: "active" | "offline" | "break";
}

export interface NearbyBus {
  id: string;
  lat: number;
  lng: number;
  heading: number;
  seatsLeft: number;
  seatsTotal: number;
  route: string;
  eta: number;
}

export interface ActiveRouteCard {
  id: string;
  from: string;
  to: string;
  busId: string;
  driverName: string;
  seatsLeft: number;
  seatsTotal: number;
  eta: number;
  price: number;
  duration: number;
}

// ─── B2B (Corporate Rider) Types ──────────────────────────────────────────────

export interface CorporateAccount {
  code: string;
  company: string;
  logoColor: string;
}

export interface B2BEmployee {
  name: string;
  company: string;
  matricule: string;
  department: string;
  phone: string;
}

export interface B2BAssignedRoute {
  lineName: string;
  from: string;
  to: string;
  boardingStop: string;
  dropoffStop: string;
  departure: string;
  arrival: string;
  busId: string;
  driverName: string;
  vehicle: string;
  seatsLeft: number;
  seatsTotal: number;
}

export interface B2BPass {
  company: string;
  plan: string;
  lineName: string;
  expiresOn: string;
  daysLeft: number;
}

export type B2BTripStatus = "completed" | "cancelled" | "upcoming";

export interface B2BTrip {
  id: string;
  date: string;
  line: string;
  status: B2BTripStatus;
  driver: string;
  vehicle: string;
}

// ─── Company (Enterprise Client) Portal Types ─────────────────────────────────

export type CompanyTab =
  | "overview" | "live" | "employees" | "lines" | "requests" | "reports" | "billing";

export type EmployeeStatus = "active" | "inactive";

export interface CompanyEmployee {
  id: string;
  name: string;
  matricule: string;
  department: string;
  line: string;
  status: EmployeeStatus;
  activeToday: boolean;
}

export interface CompanyLine {
  id: string;
  name: string;
  from: string;
  to: string;
  capacity: number;
  occupancy: number;
  enrolled: number;
  punctuality: number;
}

export type CompanyRequestStatus = "approved" | "refused";

export interface CompanyChangeRequest {
  id: string;
  employee: string;
  currentLine: string;
  requestedLine: string;
  status: CompanyRequestStatus;
  reason: string;
  time: string;
}

export interface CompanyInvoice {
  ref: string;
  period: string;
  employees: number;
  total: number;
  status: "paid" | "pending";
}

export interface CompanyUsagePoint {
  label: string;
  trips: number;
  employees: number;
}

export type CompanyNotificationType = "delay" | "incident" | "offline" | "occupancy";

export interface CompanyNotification {
  id: number;
  type: CompanyNotificationType;
  title: string;
  detail: string;
  time: string;
  unread: boolean;
}

export type ChangeRequestKind = "schedule" | "bus" | "departure";

export interface ChangeRequestOption {
  id: string;
  kind: ChangeRequestKind;
  label: string;
  detail: string;
  /** Whether the company rules + capacity allow this option. */
  available: boolean;
}
