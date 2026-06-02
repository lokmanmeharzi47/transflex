"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Bus, BarChart3, AlertTriangle, Building2, LayoutDashboard,
  Settings, Bell, Search, Activity, TrendingUp, TrendingDown,
  Users, Navigation, Zap, CheckCircle, AlertCircle, Gauge,
  Wrench, FileText, Download, Filter, RefreshCw, MapPin,
  DollarSign, Clock, Battery, ArrowUpRight, ArrowDownRight,
  X, MoreHorizontal, Plus, Power, Fuel, Star, Route,
  Shield, ChevronRight, LogOut, Wifi, Eye, ChevronDown
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, LineChart, Line,
} from "recharts";
import {
  ridershipData, routeRevenueData, paymentMethodsData,
  hourlyDemandData, monthlyMetrics, fleetVehicles,
  incidents, corporateClients,
} from "@/data/transflex-demo";
import type { AdminTab, FleetVehicle, Incident, CorporateClient } from "@/types/transflex";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/app";

// ─── Hooks ───────────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const p = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
}

function useClock() {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return time.toLocaleTimeString("fr-DZ", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

// ─── Palette ─────────────────────────────────────────────────────────────────

const C = {
  bg:       "#080c14",
  surface:  "#0d1422",
  border:   "rgba(255,255,255,0.07)",
  hover:    "rgba(255,255,255,0.05)",
  text:     "#f1f5f9",
  muted:    "#64748b",
  dim:      "#94a3b8",
  primary:  "#e53935",
  green:    "#22c55e",
  blue:     "#4d9fff",
  amber:    "#f59e0b",
  purple:   "#a78bfa",
};

const STATUS_COLOR: Record<string, { text: string; bg: string; label: string }> = {
  active:      { text: C.green,  bg: "rgba(34,197,94,0.15)",   label: "Actif"        },
  delayed:     { text: C.amber,  bg: "rgba(245,158,11,0.15)",  label: "Retardé"      },
  maintenance: { text: C.blue,   bg: "rgba(77,159,255,0.15)",  label: "Maintenance"  },
  offline:     { text: C.muted,  bg: "rgba(100,116,139,0.15)", label: "Hors-ligne"   },
};

const SEVERITY_COLOR: Record<string, { text: string; bg: string }> = {
  critical: { text: "#f87171", bg: "rgba(248,113,113,0.15)" },
  high:     { text: C.amber,   bg: "rgba(245,158,11,0.15)"  },
  medium:   { text: C.blue,    bg: "rgba(77,159,255,0.15)"  },
  low:      { text: C.muted,   bg: "rgba(100,116,139,0.15)" },
};

// ─── Sub-Components ───────────────────────────────────────────────────────────

function Card({ children, className = "", onClick }: {
  children: React.ReactNode; className?: string; onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border transition-all duration-200 ${className}`}
      style={{ background: C.surface, borderColor: C.border }}
    >
      {children}
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, sub, trend, color, delay = 0 }: {
  icon: typeof Bus; label: string; value: string; sub?: string;
  trend?: "up" | "down"; color: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.07, duration: 0.4 }}
      className="rounded-2xl p-5 flex flex-col gap-3 cursor-default border"
      style={{ background: C.surface, borderColor: C.border }}
    >
      <div className="flex items-start justify-between">
        <div className="p-2.5 rounded-xl" style={{ background: `${color}22` }}>
          <Icon size={18} style={{ color }} />
        </div>
        {trend && (
          <div
            className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{
              background: trend === "up" ? "rgba(34,197,94,0.15)" : "rgba(248,113,113,0.15)",
              color: trend === "up" ? C.green : "#f87171",
            }}
          >
            {trend === "up" ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
            {sub}
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-extrabold tracking-tight" style={{ color: C.text }}>{value}</p>
        <p className="text-xs font-medium mt-0.5" style={{ color: C.muted }}>{label}</p>
      </div>
    </motion.div>
  );
}

function LiveDot({ color = C.green }: { color?: string }) {
  return (
    <span className="relative inline-flex h-2.5 w-2.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: color }} />
      <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: color }} />
    </span>
  );
}

function Badge({ children, color, bg }: { children: React.ReactNode; color: string; bg: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider" style={{ color, background: bg }}>
      {children}
    </span>
  );
}

// ─── Live City Map (SVG) ──────────────────────────────────────────────────────

function LiveOpsMap() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(p => p + 1), 2000);
    return () => clearInterval(t);
  }, []);

  const buses = [
    { id: "TF-401", x: 38 + (tick % 10) * 1.2, y: 42 - (tick % 8) * 0.8, color: C.green },
    { id: "TF-402", x: 55 + (tick % 7) * 1.5, y: 55 + (tick % 5) * 0.6, color: C.green },
    { id: "TF-403", x: 72 - (tick % 9) * 0.4, y: 38 + (tick % 6) * 0.9, color: C.amber },
    { id: "TF-404", x: 28 + (tick % 11) * 0.9, y: 68 - (tick % 7) * 0.5, color: C.green },
    { id: "TF-405", x: 60 + (tick % 8) * 0.7, y: 28 + (tick % 10) * 0.4, color: C.green },
    { id: "TF-407", x: 44 - (tick % 6) * 0.8, y: 72 + (tick % 5) * 0.3, color: C.green },
  ];

  const routes = [
    { d: "M 15,80 Q 35,60 55,40 T 85,20", color: "#e53935" },
    { d: "M 20,20 Q 45,45 70,60 T 90,85", color: C.blue },
    { d: "M 10,50 Q 30,35 55,30 T 85,45", color: "#a78bfa" },
    { d: "M 25,90 Q 50,75 70,55 T 88,35", color: C.green },
  ];

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden" style={{ background: "#0a0f1e" }}>
      <div className="absolute inset-0 dot-grid-dark opacity-50" />
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
        {/* Street grid */}
        {[20, 40, 60, 80].map(v => (
          <g key={v}>
            <line x1={v} y1="0" x2={v} y2="100" stroke="rgba(255,255,255,0.05)" strokeWidth="0.3" />
            <line x1="0" y1={v} x2="100" y2={v} stroke="rgba(255,255,255,0.05)" strokeWidth="0.3" />
          </g>
        ))}
        {/* Routes */}
        {routes.map((r, i) => (
          <path key={i} d={r.d} fill="none" stroke={r.color} strokeWidth="0.6" strokeOpacity="0.5" strokeDasharray="2 2" />
        ))}
        {/* Bus markers */}
        {buses.map(b => (
          <g key={b.id}>
            <circle cx={b.x} cy={b.y} r="2.5" fill={b.color} opacity="0.2">
              <animate attributeName="r" values="2.5;4.5;2.5" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.2;0;0.2" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx={b.x} cy={b.y} r="1.8" fill={b.color} />
            <text x={b.x + 2.5} y={b.y - 2.5} fontSize="3" fill="rgba(255,255,255,0.7)" fontWeight="bold">{b.id}</text>
          </g>
        ))}
        {/* District labels */}
        {[
          { x: 5,  y: 8,  label: "Kolea" },
          { x: 52, y: 8,  label: "Bab Ezzouar" },
          { x: 5,  y: 55, label: "Hydra" },
          { x: 55, y: 55, label: "Centre" },
          { x: 30, y: 95, label: "Kouba" },
          { x: 72, y: 95, label: "Tafourah" },
        ].map(l => (
          <text key={l.label} x={l.x} y={l.y} fontSize="3.5" fill="rgba(255,255,255,0.3)" fontWeight="600">{l.label}</text>
        ))}
      </svg>
      <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg border" style={{ borderColor: C.border }}>
        <LiveDot />
        <span className="text-xs font-bold text-white">LIVE</span>
        <span className="text-xs font-medium" style={{ color: C.dim }}>6 vehicles</span>
      </div>
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

const NAV_ITEMS: { id: AdminTab; icon: typeof Bus; label: string }[] = [
  { id: "overview",   icon: LayoutDashboard, label: "Vue d'ensemble" },
  { id: "fleet",      icon: Bus,             label: "Flotte"          },
  { id: "analytics",  icon: BarChart3,       label: "Analytique"      },
  { id: "incidents",  icon: AlertTriangle,   label: "Incidents"       },
  { id: "corporate",  icon: Building2,       label: "Entreprises"     },
];

function Sidebar({ active, setActive }: { active: AdminTab; setActive: (t: AdminTab) => void }) {
  const router = useRouter();
  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r" style={{ background: C.surface, borderColor: C.border }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: C.border }}>
        <div className="w-10 h-10 rounded-[14px] overflow-hidden gradient-primary flex items-center justify-center flex-shrink-0" style={{ boxShadow: "0 4px 16px rgba(229,57,53,0.4)" }}>
          <img src="/logo.png" alt="TransFlex" width={28} height={28} style={{ objectFit: "contain" }} />
        </div>
        <div>
          <p className="font-extrabold text-sm" style={{ color: C.text }}>TransFlex</p>
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: C.muted }}>Ops Center</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {NAV_ITEMS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActive(id)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left"
            style={{
              background: active === id ? `${C.primary}18` : "transparent",
              color: active === id ? C.primary : C.dim,
            }}
          >
            <Icon size={17} />
            {label}
            {id === "incidents" && (
              <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#f8711520", color: "#f87171" }}>1</span>
            )}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 border-t pt-4 flex flex-col gap-1" style={{ borderColor: C.border }}>
        <button type="button" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all" style={{ color: C.muted }}>
          <Settings size={17} /> Paramètres
        </button>
        <button
          type="button"
          onClick={() => router.push(ROUTES.splash)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{ color: C.muted }}
        >
          <LogOut size={17} /> Retour accueil
        </button>
      </div>
    </aside>
  );
}

// ─── Top Bar ─────────────────────────────────────────────────────────────────

function TopBar({ activeTab, setActive }: { activeTab: AdminTab; setActive: (t: AdminTab) => void }) {
  const time = useClock();
  const labelMap: Record<AdminTab, string> = {
    overview: "Vue d'ensemble", fleet: "Flotte", analytics: "Analytique",
    incidents: "Incidents", corporate: "Entreprises",
  };

  return (
    <header className="flex items-center gap-3 px-4 py-3 border-b shrink-0" style={{ background: C.surface, borderColor: C.border }}>
      {/* Mobile logo */}
      <div className="lg:hidden w-8 h-8 rounded-xl gradient-primary flex items-center justify-center shrink-0">
        <img src="/logo.png" alt="TransFlex" width={22} height={22} style={{ objectFit: "contain" }} />
      </div>
      {/* Mobile nav */}
      <div className="lg:hidden flex gap-1 overflow-x-auto dark-scrollbar flex-1">
        {NAV_ITEMS.map(({ id, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActive(id)}
            className="p-2.5 rounded-xl shrink-0 transition-all"
            style={{ background: activeTab === id ? `${C.primary}20` : "transparent", color: activeTab === id ? C.primary : C.muted }}
          >
            <Icon size={18} />
          </button>
        ))}
      </div>

      <div className="hidden lg:flex items-center gap-2 text-sm font-semibold" style={{ color: C.dim }}>
        <span>TransFlex Admin</span>
        <ChevronRight size={14} />
        <span style={{ color: C.text }}>{labelMap[activeTab]}</span>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono" style={{ borderColor: C.border, color: C.dim }}>
          <LiveDot color={C.green} />
          <span style={{ color: C.text }}>{time}</span>
        </div>
        <button type="button" className="relative p-2 rounded-xl transition-all" style={{ color: C.dim }}>
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: "#f87171" }} />
        </button>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: `${C.primary}30`, color: C.primary }}>
          OP
        </div>
      </div>
    </header>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab() {
  const riderCount = useCountUp(1247);
  const revenueCount = useCountUp(847500);
  const activeCount = useCountUp(24);
  const onTimeVal = useCountUp(943);

  const kpis = [
    { icon: Users,       label: "Passagers aujourd'hui", value: riderCount.toLocaleString("fr-DZ"),                     sub: "+8.3%",  trend: "up"   as const, color: C.blue    },
    { icon: Bus,         label: "Véhicules actifs",       value: `${activeCount}/30`,                                    sub: "+2",     trend: "up"   as const, color: C.green   },
    { icon: DollarSign,  label: "Revenus du jour (DA)",   value: revenueCount.toLocaleString("fr-DZ"),                   sub: "+12.1%", trend: "up"   as const, color: "#22c55e" },
    { icon: Gauge,       label: "Taux de ponctualité",    value: `${(onTimeVal / 10).toFixed(1)}%`,                      sub: "-1.2%",  trend: "down" as const, color: C.amber   },
    { icon: Route,       label: "Routes actives",         value: "12/15",                                                sub: "+1",     trend: "up"   as const, color: C.purple  },
    { icon: Shield,      label: "Alertes SOS",            value: "1",                                                    sub: "Critique",                      color: "#f87171" },
  ];

  const activeVehicles = fleetVehicles.filter(v => v.status === "active");
  const delayedVehicles = fleetVehicles.filter(v => v.status === "delayed");

  return (
    <div className="space-y-5">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpis.map((k, i) => <KpiCard key={k.label} {...k} delay={i} />)}
      </div>

      {/* Main Content Row */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Live Map - 3 cols */}
        <div className="lg:col-span-3">
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: C.border }}>
              <div className="flex items-center gap-2">
                <MapPin size={15} style={{ color: C.primary }} />
                <span className="font-bold text-sm" style={{ color: C.text }}>Opérations en Direct — Alger</span>
              </div>
              <Badge color={C.green} bg="rgba(34,197,94,0.15)">Live</Badge>
            </div>
            <div className="h-64 md:h-80 p-3">
              <LiveOpsMap />
            </div>
          </Card>
        </div>

        {/* Fleet Status - 2 cols */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <div className="flex items-center justify-between px-5 py-3.5 border-b shrink-0" style={{ borderColor: C.border }}>
              <span className="font-bold text-sm" style={{ color: C.text }}>État de la Flotte</span>
              <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: C.dim }}>
                <LiveDot /><span>{activeVehicles.length} actifs</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto dark-scrollbar divide-y" style={{ borderColor: C.border }}>
              {fleetVehicles.slice(0, 8).map(v => {
                const sc = STATUS_COLOR[v.status];
                return (
                  <div key={v.id} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-white/[0.02]">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: sc.text }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate" style={{ color: C.text }}>{v.id}</p>
                      <p className="text-xs truncate" style={{ color: C.muted }}>{v.driver}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold" style={{ color: C.text }}>{v.passengers}/{v.capacity}</p>
                      <p className="text-[10px]" style={{ color: sc.text }}>{sc.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Recent Alerts */}
        <Card>
          <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: C.border }}>
            <span className="font-bold text-sm" style={{ color: C.text }}>Alertes Récentes</span>
            <Badge color="#f87171" bg="rgba(248,113,113,0.15)">1 Critique</Badge>
          </div>
          <div className="divide-y" style={{ borderColor: C.border }}>
            {incidents.slice(0, 4).map(inc => {
              const sc = SEVERITY_COLOR[inc.severity];
              return (
                <div key={inc.id} className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-white/[0.02]">
                  <div className="p-1.5 rounded-lg mt-0.5 shrink-0" style={{ background: sc.bg }}>
                    {inc.type === "sos" ? <AlertTriangle size={13} style={{ color: sc.text }} /> :
                     inc.type === "complaint" ? <Users size={13} style={{ color: sc.text }} /> :
                     inc.type === "maintenance" ? <Wrench size={13} style={{ color: sc.text }} /> :
                     <Activity size={13} style={{ color: sc.text }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold leading-tight truncate" style={{ color: C.text }}>{inc.title}</p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: C.muted }}>{inc.location} · {inc.time}</p>
                  </div>
                  <Badge color={sc.text} bg={sc.bg}>{inc.severity}</Badge>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Route Performance */}
        <Card>
          <div className="px-5 py-3.5 border-b" style={{ borderColor: C.border }}>
            <span className="font-bold text-sm" style={{ color: C.text }}>Performance des Routes</span>
          </div>
          <div className="p-5 space-y-4">
            {routeRevenueData.slice(0, 5).map((r, i) => {
              const pct = Math.round((r.revenue / routeRevenueData[0].revenue) * 100);
              const colors = [C.primary, C.blue, C.green, C.purple, C.amber];
              return (
                <div key={r.route}>
                  <div className="flex justify-between items-center mb-1.5">
                    <p className="text-xs font-semibold truncate" style={{ color: C.dim }}>{r.route}</p>
                    <p className="text-xs font-bold shrink-0 ml-2" style={{ color: C.text }}>{r.revenue.toLocaleString("fr-DZ")} DA</p>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: i * 0.08, duration: 0.8, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ background: colors[i] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Fleet Tab ────────────────────────────────────────────────────────────────

function FleetTab() {
  const [filter, setFilter] = useState<string>("all");

  const filtered = filter === "all" ? fleetVehicles : fleetVehicles.filter(v => v.status === filter);

  const statuses = [
    { id: "all",         label: "Tous",          count: fleetVehicles.length                                 },
    { id: "active",      label: "Actifs",         count: fleetVehicles.filter(v=>v.status==="active").length },
    { id: "delayed",     label: "Retardés",       count: fleetVehicles.filter(v=>v.status==="delayed").length },
    { id: "maintenance", label: "Maintenance",    count: fleetVehicles.filter(v=>v.status==="maintenance").length },
    { id: "offline",     label: "Hors-ligne",     count: fleetVehicles.filter(v=>v.status==="offline").length },
  ];

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {statuses.map(s => {
          const sc = s.id !== "all" ? STATUS_COLOR[s.id] : null;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setFilter(s.id)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all"
              style={{
                background: filter === s.id ? (sc ? `${sc.text}20` : `${C.primary}20`) : C.surface,
                borderColor: filter === s.id ? (sc ? `${sc.text}50` : `${C.primary}50`) : C.border,
                color: filter === s.id ? (sc ? sc.text : C.primary) : C.dim,
              }}
            >
              {s.label}
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px]" style={{ background: "rgba(255,255,255,0.08)" }}>
                {s.count}
              </span>
            </button>
          );
        })}
        <button type="button" className="ml-auto flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all" style={{ background: C.surface, borderColor: C.border, color: C.dim }}>
          <Download size={13} /> Exporter
        </button>
      </div>

      {/* Vehicle Grid */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((v, i) => {
            const sc = STATUS_COLOR[v.status];
            const occ = Math.round((v.passengers / v.capacity) * 100);
            const fuelColor = v.fuel > 50 ? C.green : v.fuel > 25 ? C.amber : "#f87171";
            return (
              <motion.div
                key={v.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-2xl border p-4 flex flex-col gap-3 transition-all hover:border-white/[0.12]"
                style={{ background: C.surface, borderColor: C.border }}
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-base font-extrabold tracking-tight" style={{ color: C.text }}>{v.id}</p>
                    <p className="text-xs font-medium mt-0.5" style={{ color: C.muted }}>{v.driver}</p>
                  </div>
                  <Badge color={sc.text} bg={sc.bg}>
                    {v.status === "active" && <span className="w-1.5 h-1.5 rounded-full mr-0.5 pulse-dot" style={{ background: sc.text }} />}
                    {sc.label}
                  </Badge>
                </div>

                {/* Metrics row */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { icon: Bus,        val: v.route,       label: "Route" },
                    { icon: Gauge,      val: `${v.speed}km/h`, label: "Vitesse" },
                    { icon: MapPin,     val: v.nextStop,    label: "Proch. arrêt" },
                  ].map(m => (
                    <div key={m.label} className="rounded-xl p-2" style={{ background: "rgba(255,255,255,0.03)" }}>
                      <p className="text-xs font-bold truncate" style={{ color: C.text }}>{m.val}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: C.muted }}>{m.label}</p>
                    </div>
                  ))}
                </div>

                {/* Occupancy */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5" style={{ color: C.muted }}>
                    <span>Occupation</span>
                    <span style={{ color: occ > 80 ? C.primary : C.text }}>{v.passengers}/{v.capacity} · {occ}%</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${occ}%`, background: occ > 80 ? C.primary : C.green }} />
                  </div>
                </div>

                {/* Fuel */}
                <div className="flex items-center gap-2">
                  <Fuel size={12} style={{ color: fuelColor }} />
                  <div className="flex-1 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${v.fuel}%`, background: fuelColor }} />
                  </div>
                  <span className="text-[11px] font-bold" style={{ color: fuelColor }}>{v.fuel}%</span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Analytics Tab ────────────────────────────────────────────────────────────

const CHART_STYLE = {
  background: "transparent",
  border: "none",
};
const TOOLTIP_STYLE = {
  contentStyle: { background: "#0d1422", border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 12, color: "#f1f5f9", fontSize: 12 },
  cursor: { fill: "rgba(255,255,255,0.03)" },
};
const AXIS_TICK = { fill: "#64748b", fontSize: 11 };

function AnalyticsTab() {
  return (
    <div className="space-y-4">
      {/* Row 1: Ridership + Revenue */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="px-5 py-3.5 border-b" style={{ borderColor: C.border }}>
            <p className="font-bold text-sm" style={{ color: C.text }}>Passagers — 7 derniers jours</p>
          </div>
          <div className="p-4 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ridershipData}>
                <defs>
                  <linearGradient id="gRiders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={C.primary} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={C.primary} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gTarget" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={C.blue} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={C.blue} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Area type="monotone" dataKey="target" stroke={C.blue} fill="url(#gTarget)" strokeWidth={1.5} strokeDasharray="4 4" name="Objectif" dot={false} />
                <Area type="monotone" dataKey="riders" stroke={C.primary} fill="url(#gRiders)" strokeWidth={2} name="Passagers" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="px-5 py-3.5 border-b" style={{ borderColor: C.border }}>
            <p className="font-bold text-sm" style={{ color: C.text }}>Revenus mensuels (DA)</p>
          </div>
          <div className="p-4 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyMetrics.slice(-6)}>
                <defs>
                  <linearGradient id="gRevBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={C.blue}  stopOpacity={0.9} />
                    <stop offset="100%" stopColor={C.blue}  stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000000).toFixed(0)}M`} />
                <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [typeof v === "number" ? `${(v/1000000).toFixed(2)} M DA` : "", "Revenus"]} />
                <Bar dataKey="revenue" fill="url(#gRevBar)" radius={[6, 6, 0, 0]} name="Revenus" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Row 2: Route Revenue + Payment Methods */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card>
            <div className="px-5 py-3.5 border-b" style={{ borderColor: C.border }}>
              <p className="font-bold text-sm" style={{ color: C.text }}>Revenus par Route</p>
            </div>
            <div className="p-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={routeRevenueData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                  <XAxis type="number" tick={AXIS_TICK} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="route" tick={{ fill: C.dim, fontSize: 10 }} axisLine={false} tickLine={false} width={115} />
                  <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [typeof v === "number" ? `${v.toLocaleString("fr-DZ")} DA` : "", "Revenus"]} />
                  <Bar dataKey="revenue" radius={[0, 6, 6, 0]} name="Revenus">
                    {routeRevenueData.map((_, i) => (
                      <Cell key={i} fill={[C.primary, C.blue, C.green, C.purple, C.amber, "#f472b6"][i % 6]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <Card>
          <div className="px-5 py-3.5 border-b" style={{ borderColor: C.border }}>
            <p className="font-bold text-sm" style={{ color: C.text }}>Modes de Paiement</p>
          </div>
          <div className="p-4 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={paymentMethodsData} cx="50%" cy="50%" outerRadius={60} innerRadius={30} dataKey="value" paddingAngle={3}>
                  {paymentMethodsData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [typeof v === "number" ? `${v}%` : "", "Part"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="px-5 pb-4 grid grid-cols-2 gap-2">
            {paymentMethodsData.map(p => (
              <div key={p.name} className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
                <span style={{ color: C.dim }}>{p.name}</span>
                <span className="ml-auto font-bold" style={{ color: C.text }}>{p.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Row 3: Hourly Demand */}
      <Card>
        <div className="px-5 py-3.5 border-b" style={{ borderColor: C.border }}>
          <p className="font-bold text-sm" style={{ color: C.text }}>Demande Horaire — Aujourd&apos;hui</p>
        </div>
        <div className="p-4 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyDemandData}>
              <defs>
                <linearGradient id="gDemand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.green} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={C.green} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="hour" tick={AXIS_TICK} axisLine={false} tickLine={false} interval={1} />
              <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [typeof v === "number" ? `${v} passagers` : "", "Demande"]} />
              <Area type="monotone" dataKey="demand" stroke={C.green} fill="url(#gDemand)" strokeWidth={2} name="Demande" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

// ─── Incidents Tab ────────────────────────────────────────────────────────────

function IncidentsTab() {
  const [selected, setSelected] = useState<number | null>(1);

  const typeIcon = (type: string) => {
    if (type === "sos") return AlertTriangle;
    if (type === "complaint") return Users;
    if (type === "maintenance") return Wrench;
    return Activity;
  };

  const statusLabel: Record<string, string> = {
    responding: "En intervention", rerouting: "Reroutage", open: "Ouvert",
    review: "En révision", scheduled: "Planifié", resolved: "Résolu",
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Critiques",   count: incidents.filter(i=>i.severity==="critical").length, color: "#f87171" },
          { label: "Élevés",      count: incidents.filter(i=>i.severity==="high").length,     color: C.amber   },
          { label: "Moyens",      count: incidents.filter(i=>i.severity==="medium").length,   color: C.blue    },
          { label: "Résolus",     count: incidents.filter(i=>i.status==="resolved").length,   color: C.green   },
        ].map(s => (
          <Card key={s.label} className="p-4 flex items-center gap-3">
            <div className="text-2xl font-extrabold" style={{ color: s.color }}>{s.count}</div>
            <p className="text-xs font-semibold" style={{ color: C.muted }}>{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Incident List */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          {incidents.map(inc => {
            const sc = SEVERITY_COLOR[inc.severity];
            const Icon = typeIcon(inc.type);
            const isSelected = selected === inc.id;
            return (
              <motion.div
                key={inc.id}
                onClick={() => setSelected(inc.id)}
                whileTap={{ scale: 0.99 }}
                className="rounded-2xl border p-4 cursor-pointer transition-all"
                style={{
                  background: isSelected ? `${C.primary}10` : C.surface,
                  borderColor: isSelected ? `${C.primary}40` : C.border,
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl shrink-0" style={{ background: sc.bg }}>
                    <Icon size={15} style={{ color: sc.text }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-bold truncate" style={{ color: C.text }}>{inc.title}</p>
                      <Badge color={sc.text} bg={sc.bg}>{inc.severity}</Badge>
                    </div>
                    <p className="text-xs truncate" style={{ color: C.muted }}>{inc.location} · Véhicule: {inc.vehicle}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] font-semibold" style={{ color: C.muted }}>Il y a {inc.time}</span>
                      <Badge color={inc.status==="resolved" ? C.green : sc.text} bg={inc.status==="resolved" ? "rgba(34,197,94,0.15)" : sc.bg}>
                        {statusLabel[inc.status]}
                      </Badge>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Detail Panel */}
        <div>
          {selected !== null && (() => {
            const inc = incidents.find(i => i.id === selected)!;
            const sc = SEVERITY_COLOR[inc.severity];
            const Icon = typeIcon(inc.type);
            return (
              <Card className="sticky top-0 p-5">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl" style={{ background: sc.bg }}>
                      <Icon size={20} style={{ color: sc.text }} />
                    </div>
                    <div>
                      <p className="font-extrabold" style={{ color: C.text }}>{inc.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: C.muted }}>#{inc.id.toString().padStart(5, "0")}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setSelected(null)} style={{ color: C.muted }}><X size={18} /></button>
                </div>
                <div className="space-y-3 mb-5">
                  {[
                    { label: "Véhicule",    val: inc.vehicle    },
                    { label: "Localisation", val: inc.location   },
                    { label: "Signalé",      val: `Il y a ${inc.time}` },
                    { label: "Sévérité",     val: inc.severity   },
                    { label: "Statut",       val: statusLabel[inc.status] },
                  ].map(f => (
                    <div key={f.label} className="flex justify-between items-center py-2.5 border-b" style={{ borderColor: C.border }}>
                      <span className="text-xs" style={{ color: C.muted }}>{f.label}</span>
                      <span className="text-xs font-bold capitalize" style={{ color: C.text }}>{f.val}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-2">
                  <button type="button" className="w-full py-2.5 rounded-xl text-sm font-bold gradient-primary text-white transition-all active:scale-95">
                    Intervenir maintenant
                  </button>
                  <button type="button" className="w-full py-2.5 rounded-xl text-sm font-bold border transition-all" style={{ borderColor: C.border, color: C.dim }}>
                    Escalader
                  </button>
                </div>
              </Card>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

// ─── Corporate Tab ────────────────────────────────────────────────────────────

function CorporateTab() {
  const totalRevenue = useCountUp(corporateClients.reduce((a, c) => a + c.revenue, 0));
  const totalEmployees = useCountUp(corporateClients.reduce((a, c) => a + c.employees, 0));

  const planColor: Record<string, { text: string; bg: string }> = {
    "Enterprise+": { text: "#facc15", bg: "rgba(250,204,21,0.15)" },
    "Enterprise":  { text: C.purple,  bg: "rgba(167,139,250,0.15)" },
    "Business":    { text: C.blue,    bg: "rgba(77,159,255,0.15)"  },
    "Standard":    { text: C.dim,     bg: "rgba(100,116,139,0.15)" },
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Entreprises actives", val: corporateClients.filter(c=>c.status==="active").length.toString(), color: C.green  },
          { label: "Total employés",       val: totalEmployees.toLocaleString("fr-DZ"),                             color: C.blue   },
          { label: "Revenus B2B (DA)",     val: totalRevenue.toLocaleString("fr-DZ"),                               color: C.amber  },
          { label: "En attente",           val: corporateClients.filter(c=>c.status==="pending").length.toString(), color: C.muted  },
        ].map(s => (
          <Card key={s.label} className="p-4">
            <p className="text-xl font-extrabold" style={{ color: s.color }}>{s.val}</p>
            <p className="text-xs font-medium mt-1" style={{ color: C.muted }}>{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Add Client */}
      <div className="flex justify-end">
        <button type="button" className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold gradient-primary text-white">
          <Plus size={14} /> Nouveau Client
        </button>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto dark-scrollbar">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left" style={{ borderColor: C.border }}>
                {["Entreprise", "Secteur", "Employés", "Trajets/mois", "Revenus", "Plan", "Croissance", "Statut"].map(h => (
                  <th key={h} className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: C.muted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: C.border }}>
              {corporateClients.map((c, i) => {
                const pc = planColor[c.plan];
                const isPos = c.growth > 0;
                return (
                  <motion.tr
                    key={c.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="transition-colors hover:bg-white/[0.02] cursor-pointer"
                  >
                    <td className="px-5 py-4">
                      <p className="font-bold text-sm" style={{ color: C.text }}>{c.name}</p>
                    </td>
                    <td className="px-5 py-4 text-xs" style={{ color: C.dim }}>{c.industry}</td>
                    <td className="px-5 py-4 text-xs font-semibold" style={{ color: C.text }}>{c.employees.toLocaleString("fr-DZ")}</td>
                    <td className="px-5 py-4 text-xs font-semibold" style={{ color: C.text }}>{c.trips.toLocaleString("fr-DZ")}</td>
                    <td className="px-5 py-4 text-xs font-bold" style={{ color: C.text }}>{c.revenue.toLocaleString("fr-DZ")} DA</td>
                    <td className="px-5 py-4"><Badge color={pc.text} bg={pc.bg}>{c.plan}</Badge></td>
                    <td className="px-5 py-4">
                      {c.growth !== 0 && (
                        <span className="flex items-center gap-1 text-xs font-bold" style={{ color: isPos ? C.green : "#f87171" }}>
                          {isPos ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                          {Math.abs(c.growth)}%
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        color={c.status === "active" ? C.green : c.status === "pending" ? C.amber : "#f87171"}
                        bg={c.status === "active" ? "rgba(34,197,94,0.15)" : c.status === "pending" ? "rgba(245,158,11,0.15)" : "rgba(248,113,113,0.15)"}
                      >
                        {c.status === "active" ? "Actif" : c.status === "pending" ? "En attente" : "Suspendu"}
                      </Badge>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

  return (
    <div className="min-h-screen flex" style={{ background: C.bg, fontFamily: "Inter, sans-serif" }}>
      <Sidebar active={activeTab} setActive={setActiveTab} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar activeTab={activeTab} setActive={setActiveTab} />

        <main className="flex-1 overflow-y-auto dark-scrollbar p-4 md:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {activeTab === "overview"   && <OverviewTab   />}
              {activeTab === "fleet"      && <FleetTab      />}
              {activeTab === "analytics"  && <AnalyticsTab  />}
              {activeTab === "incidents"  && <IncidentsTab  />}
              {activeTab === "corporate"  && <CorporateTab  />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
