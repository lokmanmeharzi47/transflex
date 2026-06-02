"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "motion/react";
import {
  Bus, BarChart3, Users, DollarSign, Route, Settings,
  ArrowUpRight, ArrowDownRight, TrendingUp, Fuel, Wrench,
  Star, Clock, CheckCircle, AlertCircle, Download, Plus,
  ChevronRight, LogOut, Activity, Shield, MapPin, Gauge,
  FileText, Calendar, Filter, RefreshCw, Award, Zap, Battery,
  Radio, X,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell,
} from "recharts";
import {
  fleetVehicles, driverPerformance, driverWeeklyEarnings,
  driverRecentTrips, routeRevenueData, ridershipData, incidents,
} from "@/data/transflex-demo";
import type { OperatorTab } from "@/types/transflex";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/app";

const FleetMap = dynamic(() => import("@/components/FleetMap"), {
  ssr: false,
  loading: () => <div className="w-full h-full" style={{ background: "#0b1120" }} />,
});

// ─── Palette (Operator — slightly lighter than Admin) ─────────────────────────

const C = {
  bg:      "#0b1120",
  surface: "#111827",
  border:  "rgba(255,255,255,0.08)",
  text:    "#f1f5f9",
  muted:   "#64748b",
  dim:     "#94a3b8",
  primary: "#e53935",
  green:   "#22c55e",
  blue:    "#4d9fff",
  amber:   "#f59e0b",
  purple:  "#a78bfa",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1200) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const s = Date.now();
    const t = setInterval(() => {
      const p = Math.min((Date.now() - s) / duration, 1);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p >= 1) clearInterval(t);
    }, 16);
    return () => clearInterval(t);
  }, [target, duration]);
  return v;
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border ${className}`} style={{ background: C.surface, borderColor: C.border }}>
      {children}
    </div>
  );
}

function StatChip({ val, label, color = C.text, bg = "transparent" }: {
  val: string | number; label: string; color?: string; bg?: string;
}) {
  return (
    <div className="rounded-xl p-3 flex flex-col gap-1" style={{ background: bg || "rgba(255,255,255,0.04)" }}>
      <span className="text-xl font-extrabold tracking-tight" style={{ color }}>{val}</span>
      <span className="text-[11px] font-medium" style={{ color: C.muted }}>{label}</span>
    </div>
  );
}

function Badge({ children, color, bg }: { children: React.ReactNode; color: string; bg: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ color, background: bg }}>
      {children}
    </span>
  );
}

const CHART_TOOLTIP = {
  contentStyle: { background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#f1f5f9", fontSize: 12 },
  cursor: { fill: "rgba(255,255,255,0.03)" },
};
const AXIS = { fill: "#64748b", fontSize: 11 };

// ─── Nav ──────────────────────────────────────────────────────────────────────

const NAV: { id: OperatorTab; icon: typeof Bus; label: string }[] = [
  { id: "overview", icon: BarChart3, label: "Tableau de bord" },
  { id: "live",     icon: Radio,     label: "Flotte en Temps Réel" },
  { id: "fleet",    icon: Bus,       label: "Ma Flotte"        },
  { id: "routes",   icon: Route,     label: "Routes"           },
  { id: "earnings", icon: DollarSign,label: "Revenus"          },
  { id: "drivers",  icon: Users,     label: "Conducteurs"      },
];

function Sidebar({ active, setActive }: { active: OperatorTab; setActive: (t: OperatorTab) => void }) {
  const router = useRouter();
  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r" style={{ background: C.surface, borderColor: C.border }}>
      <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: C.border }}>
        <div className="w-10 h-10 rounded-[14px] overflow-hidden gradient-primary flex items-center justify-center flex-shrink-0" style={{ boxShadow: "0 4px 16px rgba(229,57,53,0.4)" }}>
          <Image src="/logo.png" alt="TransFlex" width={28} height={28} style={{ objectFit: "contain" }} />
        </div>
        <div>
          <p className="font-extrabold text-sm" style={{ color: C.text }}>TransFlex</p>
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: C.muted }}>Portail Opérateur</p>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {NAV.map(({ id, icon: Icon, label }) => (
          <button key={id} type="button" onClick={() => setActive(id)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left"
            style={{ background: active === id ? `${C.blue}18` : "transparent", color: active === id ? C.blue : C.dim }}>
            <Icon size={17} />{label}
          </button>
        ))}
      </nav>
      <div className="px-3 pb-4 border-t pt-4" style={{ borderColor: C.border }}>
        <button type="button" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold w-full text-left" style={{ color: C.muted }}>
          <Settings size={17} /> Paramètres
        </button>
        <button type="button" onClick={() => router.push(ROUTES.splash)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold w-full text-left" style={{ color: C.muted }}>
          <LogOut size={17} /> Retour accueil
        </button>
      </div>
    </aside>
  );
}

function TopBar({ active, setActive }: { active: OperatorTab; setActive: (t: OperatorTab) => void }) {
  const labels: Record<OperatorTab, string> = {
    overview: "Tableau de bord", live: "Flotte en Temps Réel", fleet: "Ma Flotte", routes: "Gestion des Routes",
    earnings: "Revenus & Finances", drivers: "Équipe Conducteurs",
  };
  return (
    <header className="flex items-center gap-3 px-4 py-3 border-b shrink-0" style={{ background: C.surface, borderColor: C.border }}>
      {/* Mobile logo */}
      <div className="lg:hidden w-8 h-8 rounded-xl gradient-primary flex items-center justify-center shrink-0">
        <Image src="/logo.png" alt="TransFlex" width={22} height={22} style={{ objectFit: "contain" }} />
      </div>
      <div className="lg:hidden flex gap-1 overflow-x-auto flex-1">
        {NAV.map(({ id, icon: Icon }) => (
          <button key={id} type="button" onClick={() => setActive(id)}
            className="p-2.5 rounded-xl shrink-0 transition-all"
            style={{ background: active === id ? `${C.blue}20` : "transparent", color: active === id ? C.blue : C.muted }}>
            <Icon size={18} />
          </button>
        ))}
      </div>
      <div className="hidden lg:flex items-center gap-2 text-sm font-semibold" style={{ color: C.dim }}>
        <span>Portail Opérateur</span>
        <ChevronRight size={14} />
        <span style={{ color: C.text }}>{labels[active]}</span>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <button type="button" className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold"
          style={{ borderColor: C.border, color: C.dim }}>
          <Download size={13} /> Exporter
        </button>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ background: `${C.blue}30`, color: C.blue }}>FL</div>
      </div>
    </header>
  );
}

// ─── Live Fleet Map Tab ───────────────────────────────────────────────────────

const FLEET_STATUS: Record<string, { text: string; bg: string; label: string }> = {
  active:      { text: C.green,  bg: `${C.green}20`,           label: "En service"  },
  delayed:     { text: C.amber,  bg: `${C.amber}20`,           label: "Retard"      },
  maintenance: { text: C.blue,   bg: `${C.blue}20`,            label: "En pause"    },
  offline:     { text: C.muted,  bg: "rgba(100,116,139,0.15)", label: "Hors ligne"  },
};

function LiveFleetTab() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = fleetVehicles.find(v => v.id === selectedId) ?? null;

  const activeCount  = fleetVehicles.filter(v => v.status === "active").length;
  const offlineCount = fleetVehicles.filter(v => v.status === "offline").length;
  const delayedCount = fleetVehicles.filter(v => v.status === "delayed").length;
  const inService    = fleetVehicles.filter(v => v.passengers > 0);
  const avgOcc       = inService.length
    ? Math.round(inService.reduce((a, v) => a + v.passengers, 0) / inService.length)
    : 0;
  const fillRate     = Math.round(
    (fleetVehicles.reduce((a, v) => a + v.passengers, 0) /
     fleetVehicles.reduce((a, v) => a + v.capacity, 0)) * 100,
  );
  const openIncidents = incidents.filter(i => i.status !== "resolved").length;

  const KPIS = [
    { icon: Bus,        label: "Bus actifs",        val: activeCount,        color: C.green  },
    { icon: Radio,      label: "Bus hors ligne",    val: offlineCount,       color: C.muted  },
    { icon: Users,      label: "Occupation moy.",   val: avgOcc,             color: C.blue   },
    { icon: Gauge,      label: "Taux remplissage",  val: `${fillRate}%`,     color: C.amber  },
    { icon: Clock,      label: "Retards",           val: delayedCount,       color: C.amber  },
    { icon: AlertCircle,label: "Incidents",         val: openIncidents,      color: C.primary},
  ];

  return (
    <div className="space-y-4">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {KPIS.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-4 flex flex-col gap-2">
              <div className="p-2 rounded-lg w-fit" style={{ background: `${k.color}20` }}>
                <k.icon size={15} style={{ color: k.color }} />
              </div>
              <p className="text-2xl font-extrabold tracking-tight" style={{ color: C.text }}>{k.val}</p>
              <p className="text-[11px]" style={{ color: C.muted }}>{k.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Map + side panel */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-4">
        {/* Central map */}
        <Card className="overflow-hidden relative" >
          <div className="absolute top-3 left-3 z-[500] flex flex-wrap gap-2">
            {Object.entries(FLEET_STATUS).map(([k, s]) => (
              <span key={k} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
                    style={{ background: "rgba(17,24,39,0.85)", color: s.text, border: `1px solid ${s.text}33`, backdropFilter: "blur(8px)" }}>
                <span className="w-2 h-2 rounded-full" style={{ background: s.text }} /> {s.label}
              </span>
            ))}
          </div>
          <div style={{ height: 540 }}>
            <FleetMap vehicles={fleetVehicles} selectedId={selectedId} onSelect={setSelectedId} />
          </div>
        </Card>

        {/* Side panel */}
        <Card className="p-0 overflow-hidden flex flex-col" >
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div key={selected.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="flex flex-col h-full">
                <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: C.border }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm"
                         style={{ background: `${FLEET_STATUS[selected.status].text}20`, color: FLEET_STATUS[selected.status].text }}>
                      {selected.id.replace("TF-", "")}
                    </div>
                    <div>
                      <p className="font-extrabold text-sm" style={{ color: C.text }}>{selected.id}</p>
                      <Badge color={FLEET_STATUS[selected.status].text} bg={FLEET_STATUS[selected.status].bg}>
                        {FLEET_STATUS[selected.status].label}
                      </Badge>
                    </div>
                  </div>
                  <button type="button" aria-label="Fermer" onClick={() => setSelectedId(null)}
                    className="p-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.05)", color: C.dim }}>
                    <X size={16} />
                  </button>
                </div>

                <div className="p-5 space-y-4 overflow-y-auto dark-scrollbar">
                  {[
                    { icon: Users,      label: "Chauffeur",          val: selected.driver },
                    { icon: Route,      label: "Route actuelle",     val: selected.route },
                    { icon: MapPin,     label: "Prochain arrêt",     val: selected.nextStop },
                  ].map(row => (
                    <div key={row.label} className="flex items-center gap-3">
                      <div className="p-2 rounded-lg shrink-0" style={{ background: "rgba(255,255,255,0.04)" }}>
                        <row.icon size={15} style={{ color: C.dim }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: C.muted }}>{row.label}</p>
                        <p className="text-sm font-bold truncate" style={{ color: C.text }}>{row.val}</p>
                      </div>
                    </div>
                  ))}

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <StatChip val={`${selected.passengers}/${selected.capacity}`} label="Passagers embarqués" color={C.text} />
                    <StatChip val={selected.capacity - selected.passengers} label="Places restantes" color={C.green} />
                    <StatChip val={`${selected.speed} km/h`} label="Vitesse actuelle" color={C.blue} />
                    <StatChip val={selected.eta > 0 ? `${selected.eta} min` : "—"} label="Arrivée prévue" color={C.amber} />
                  </div>

                  {/* Occupancy bar */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5" style={{ color: C.muted }}>
                      <span>Occupation</span>
                      <span style={{ color: C.text }}>{Math.round((selected.passengers / selected.capacity) * 100)}%</span>
                    </div>
                    <div className="h-2 rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
                      <div className="h-full rounded-full" style={{
                        width: `${(selected.passengers / selected.capacity) * 100}%`,
                        background: selected.passengers / selected.capacity > 0.8 ? C.primary : C.green,
                      }} />
                    </div>
                  </div>

                  {/* Fuel bar */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5" style={{ color: C.muted }}>
                      <span className="flex items-center gap-1.5"><Fuel size={12} /> Carburant</span>
                      <span style={{ color: C.text }}>{selected.fuel}%</span>
                    </div>
                    <div className="h-2 rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
                      <div className="h-full rounded-full" style={{
                        width: `${selected.fuel}%`,
                        background: selected.fuel > 50 ? C.green : selected.fuel > 25 ? C.amber : "#f87171",
                      }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center text-center h-full py-16 px-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <Bus size={24} style={{ color: C.muted }} />
                </div>
                <p className="font-bold text-sm" style={{ color: C.text }}>Sélectionnez un bus</p>
                <p className="text-xs mt-1.5" style={{ color: C.muted }}>Cliquez sur un véhicule de la carte pour voir ses informations en direct.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab() {
  const totalRev = useCountUp(2577000);
  const totalTrips = useCountUp(8590);
  const activeCount = fleetVehicles.filter(v => v.status === "active").length;

  return (
    <div className="space-y-5">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Bus,        label: "Véhicules actifs",   val: `${activeCount}/${fleetVehicles.length}`, color: C.green  },
          { icon: Users,      label: "Trajets ce mois",    val: totalTrips.toLocaleString("fr-DZ"),       color: C.blue   },
          { icon: DollarSign, label: "Revenus (DA)",       val: totalRev.toLocaleString("fr-DZ"),         color: C.amber  },
          { icon: Star,       label: "Note conducteurs",   val: "4.89 ★",                                  color: C.purple },
        ].map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <Card className="p-4 flex flex-col gap-3">
              <div className="p-2.5 rounded-xl w-fit" style={{ background: `${k.color}20` }}>
                <k.icon size={17} style={{ color: k.color }} />
              </div>
              <p className="text-2xl font-extrabold tracking-tight" style={{ color: C.text }}>{k.val}</p>
              <p className="text-xs" style={{ color: C.muted }}>{k.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="px-5 py-3.5 border-b" style={{ borderColor: C.border }}>
            <p className="font-bold text-sm" style={{ color: C.text }}>Revenus Hebdomadaires (DA)</p>
          </div>
          <div className="p-4 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={driverWeeklyEarnings}>
                <defs>
                  <linearGradient id="opBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={C.blue} stopOpacity={0.9} />
                    <stop offset="100%" stopColor={C.blue} stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" tick={AXIS} axisLine={false} tickLine={false} />
                <YAxis tick={AXIS} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip {...CHART_TOOLTIP} formatter={(v) => [typeof v === "number" ? `${v.toLocaleString("fr-DZ")} DA` : "", "Revenus"]} />
                <Bar dataKey="amount" fill="url(#opBar)" radius={[6,6,0,0]} name="Revenus" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="px-5 py-3.5 border-b" style={{ borderColor: C.border }}>
            <p className="font-bold text-sm" style={{ color: C.text }}>Passagers transportés</p>
          </div>
          <div className="p-4 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ridershipData}>
                <defs>
                  <linearGradient id="opArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"   stopColor={C.green} stopOpacity={0.3} />
                    <stop offset="95%"  stopColor={C.green} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" tick={AXIS} axisLine={false} tickLine={false} />
                <YAxis tick={AXIS} axisLine={false} tickLine={false} />
                <Tooltip {...CHART_TOOLTIP} />
                <Area type="monotone" dataKey="riders" stroke={C.green} fill="url(#opArea)" strokeWidth={2} name="Passagers" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Trips */}
      <Card>
        <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: C.border }}>
          <p className="font-bold text-sm" style={{ color: C.text }}>Derniers Trajets</p>
          <Badge color={C.blue} bg={`${C.blue}20`}>Aujourd&apos;hui</Badge>
        </div>
        <div className="divide-y" style={{ borderColor: C.border }}>
          {driverRecentTrips.map(t => (
            <div key={t.id} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-white/[0.02]">
              <div className="p-2 rounded-lg shrink-0" style={{ background: `${C.blue}15` }}>
                <Route size={14} style={{ color: C.blue }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold" style={{ color: C.text }}>{t.from} → {t.to}</p>
                <p className="text-xs" style={{ color: C.muted }}>{t.passengers} passagers · {t.duration} · {t.time}</p>
              </div>
              <p className="text-sm font-bold shrink-0" style={{ color: C.green }}>{t.amount.toLocaleString("fr-DZ")} DA</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Fleet Tab ────────────────────────────────────────────────────────────────

function FleetTab() {
  const [search, setSearch] = useState("");
  const STATUS_COLOR: Record<string, { text: string; bg: string; label: string }> = {
    active:      { text: C.green,  bg: `${C.green}20`,   label: "Actif"       },
    delayed:     { text: C.amber,  bg: `${C.amber}20`,   label: "Retardé"     },
    maintenance: { text: C.blue,   bg: `${C.blue}20`,    label: "Maintenance" },
    offline:     { text: C.muted,  bg: "rgba(100,116,139,0.15)", label: "Hors-ligne" },
  };
  const filtered = fleetVehicles.filter(v =>
    v.id.toLowerCase().includes(search.toLowerCase()) ||
    v.driver.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher véhicule ou conducteur..."
            className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:border-blue-500/50 transition-all"
            style={{ background: C.surface, borderColor: C.border, color: C.text }}
          />
        </div>
        <button type="button" className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold" style={{ borderColor: C.border, color: C.dim }}>
          <Filter size={14} /> Filtrer
        </button>
        <button type="button" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: C.primary }}>
          <Plus size={14} /> Ajouter
        </button>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map((v, i) => {
          const sc = STATUS_COLOR[v.status];
          const occ = Math.round((v.passengers / v.capacity) * 100);
          const fuelC = v.fuel > 50 ? C.green : v.fuel > 25 ? C.amber : "#f87171";
          return (
            <motion.div key={v.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
              <Card className="p-4 space-y-3 hover:border-white/[0.14] transition-all cursor-pointer">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-extrabold" style={{ color: C.text }}>{v.id}</p>
                    <p className="text-xs mt-0.5" style={{ color: C.muted }}>{v.driver}</p>
                  </div>
                  <Badge color={sc.text} bg={sc.bg}>{sc.label}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { l: "Route",  v: v.route     },
                    { l: "Vitesse",v: `${v.speed}km/h` },
                    { l: "ETA",    v: v.eta > 0 ? `${v.eta} min` : "—" },
                  ].map(m => (
                    <div key={m.l} className="text-center rounded-lg p-2" style={{ background: "rgba(255,255,255,0.03)" }}>
                      <p className="text-xs font-bold" style={{ color: C.text }}>{m.v}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: C.muted }}>{m.l}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1" style={{ color: C.muted }}>
                    <span>Occupation</span>
                    <span style={{ color: C.text }}>{v.passengers}/{v.capacity}</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
                    <div className="h-full rounded-full" style={{ width: `${occ}%`, background: occ > 80 ? C.primary : C.green }} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Fuel size={12} style={{ color: fuelC }} />
                  <div className="flex-1 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
                    <div className="h-full rounded-full" style={{ width: `${v.fuel}%`, background: fuelC }} />
                  </div>
                  <span className="text-[11px] font-bold" style={{ color: fuelC }}>{v.fuel}%</span>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Routes Tab ───────────────────────────────────────────────────────────────

function RoutesTab() {
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-3 gap-3">
        {[
          { label: "Routes actives", val: "6/8",   color: C.green  },
          { label: "Ponctualité",    val: "94.3%",  color: C.blue   },
          { label: "Km parcourus",   val: "12,840", color: C.amber  },
        ].map(s => (
          <Card key={s.label} className="p-4 flex items-center gap-4">
            <p className="text-2xl font-extrabold" style={{ color: s.color }}>{s.val}</p>
            <p className="text-xs" style={{ color: C.muted }}>{s.label}</p>
          </Card>
        ))}
      </div>

      <Card>
        <div className="px-5 py-3.5 border-b" style={{ borderColor: C.border }}>
          <p className="font-bold text-sm" style={{ color: C.text }}>Performance par Route</p>
        </div>
        <div className="p-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={routeRevenueData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
              <XAxis type="number" tick={AXIS} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="route" tick={{ fill: C.dim, fontSize: 10 }} axisLine={false} tickLine={false} width={120} />
              <Tooltip {...CHART_TOOLTIP} formatter={(v) => [typeof v === "number" ? `${v.toLocaleString("fr-DZ")} DA` : "", "Revenus"]} />
              <Bar dataKey="revenue" radius={[0,6,6,0]} name="Revenus">
                {routeRevenueData.map((_, i) => (
                  <Cell key={i} fill={[C.primary, C.blue, C.green, C.purple, C.amber, "#f472b6"][i % 6]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {routeRevenueData.map((r, i) => (
          <Card key={r.route} className="p-4 flex items-center gap-4 hover:border-white/[0.14] transition-all cursor-pointer">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm"
              style={{ background: `${[C.primary, C.blue, C.green, C.purple, C.amber, "#f472b6"][i % 6]}20`,
                       color: [C.primary, C.blue, C.green, C.purple, C.amber, "#f472b6"][i % 6] }}>
              R-{(i + 1).toString().padStart(2, "0")}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate" style={{ color: C.text }}>{r.route}</p>
              <p className="text-xs mt-0.5" style={{ color: C.muted }}>{r.rides} trajets · {r.revenue.toLocaleString("fr-DZ")} DA</p>
            </div>
            <ChevronRight size={16} style={{ color: C.muted }} />
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Earnings Tab ─────────────────────────────────────────────────────────────

function EarningsTab() {
  const totalRev = useCountUp(47280000);
  const commission = useCountUp(4728000);
  const net = useCountUp(42552000);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { label: "Revenus bruts (DA)",     val: totalRev.toLocaleString("fr-DZ"),  color: C.blue   },
          { label: "Commission TransFlex",    val: commission.toLocaleString("fr-DZ"), color: C.amber  },
          { label: "Revenus nets (DA)",       val: net.toLocaleString("fr-DZ"),        color: C.green  },
        ].map(s => (
          <Card key={s.label} className="p-5">
            <p className="text-2xl font-extrabold" style={{ color: s.color }}>{s.val}</p>
            <p className="text-xs mt-1" style={{ color: C.muted }}>{s.label}</p>
          </Card>
        ))}
      </div>

      <Card>
        <div className="px-5 py-3.5 border-b" style={{ borderColor: C.border }}>
          <p className="font-bold text-sm" style={{ color: C.text }}>Revenus quotidiens cette semaine (DA)</p>
        </div>
        <div className="p-4 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={driverWeeklyEarnings}>
              <defs>
                <linearGradient id="earnGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.amber} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={C.amber} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={AXIS} axisLine={false} tickLine={false} />
              <YAxis tick={AXIS} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip {...CHART_TOOLTIP} formatter={(v) => [typeof v === "number" ? `${v.toLocaleString("fr-DZ")} DA` : "", "Revenus"]} />
              <Area type="monotone" dataKey="amount" stroke={C.amber} fill="url(#earnGrad)" strokeWidth={2} name="Revenus" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-5">
          <p className="font-bold text-sm mb-4" style={{ color: C.text }}>Répartition des revenus</p>
          <div className="space-y-3">
            {[
              { label: "Trajets réguliers",  pct: 68, color: C.blue   },
              { label: "Entreprises B2B",    pct: 24, color: C.green  },
              { label: "Trajets premium",    pct: 8,  color: C.amber  },
            ].map(r => (
              <div key={r.label}>
                <div className="flex justify-between text-xs mb-1.5" style={{ color: C.muted }}>
                  <span>{r.label}</span>
                  <span style={{ color: C.text }}>{r.pct}%</span>
                </div>
                <div className="h-2 rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
                  <motion.div className="h-full rounded-full" style={{ background: r.color }}
                    initial={{ width: 0 }} animate={{ width: `${r.pct}%` }} transition={{ duration: 0.9, ease: "easeOut" }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <p className="font-bold text-sm mb-4" style={{ color: C.text }}>Factures récentes</p>
          <div className="space-y-3">
            {[
              { ref: "INV-2024-11", amount: "4,280,000", status: "Payée",     date: "Nov 2024" },
              { ref: "INV-2024-10", amount: "3,960,000", status: "Payée",     date: "Oct 2024" },
              { ref: "INV-2024-09", amount: "4,120,000", status: "Payée",     date: "Sep 2024" },
              { ref: "INV-2024-12", amount: "3,840,000", status: "En attente",date: "Dec 2024" },
            ].map(inv => (
              <div key={inv.ref} className="flex items-center justify-between py-2 border-b" style={{ borderColor: C.border }}>
                <div>
                  <p className="text-sm font-bold" style={{ color: C.text }}>{inv.ref}</p>
                  <p className="text-xs" style={{ color: C.muted }}>{inv.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold" style={{ color: C.text }}>{inv.amount} DA</p>
                  <span className="text-[10px] font-bold" style={{
                    color: inv.status === "Payée" ? C.green : C.amber
                  }}>{inv.status}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Drivers Tab ──────────────────────────────────────────────────────────────

function DriversTab() {
  const STATUS_COLOR: Record<string, { text: string; bg: string; label: string }> = {
    active:  { text: C.green, bg: `${C.green}20`, label: "Actif"   },
    break:   { text: C.amber, bg: `${C.amber}20`, label: "Pause"   },
    offline: { text: C.muted, bg: "rgba(100,116,139,0.15)", label: "Inactif" },
  };

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-3 gap-3">
        {[
          { l: "Conducteurs actifs", v: driverPerformance.filter(d=>d.status==="active").length.toString(),  c: C.green  },
          { l: "Note moyenne",       v: "4.89 ★",                                                              c: C.amber  },
          { l: "Total trajets",      v: driverPerformance.reduce((a,d)=>a+d.rides,0).toLocaleString("fr-DZ"), c: C.blue   },
        ].map(s => (
          <Card key={s.l} className="p-4 flex items-center gap-4">
            <p className="text-2xl font-extrabold" style={{ color: s.c }}>{s.v}</p>
            <p className="text-xs" style={{ color: C.muted }}>{s.l}</p>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left" style={{ borderColor: C.border }}>
                {["#", "Conducteur", "Note", "Trajets", "Acceptation", "Revenus", "Statut"].map(h => (
                  <th key={h} className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: C.muted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: C.border }}>
              {driverPerformance.map((d, i) => {
                const sc = STATUS_COLOR[d.status];
                return (
                  <motion.tr key={d.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                    className="hover:bg-white/[0.02] transition-colors cursor-pointer">
                    <td className="px-5 py-4 text-xs font-mono" style={{ color: C.muted }}>#{i + 1}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ background: `${C.blue}25`, color: C.blue }}>
                          {d.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <p className="text-sm font-bold" style={{ color: C.text }}>{d.name}</p>
                          <p className="text-[10px]" style={{ color: C.muted }}>{d.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-bold" style={{ color: d.rating >= 4.9 ? C.amber : C.text }}>
                        ★ {d.rating}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold" style={{ color: C.text }}>{d.rides.toLocaleString("fr-DZ")}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.07)", minWidth: 40 }}>
                          <div className="h-full rounded-full" style={{ width: `${d.acceptance}%`, background: C.green }} />
                        </div>
                        <span className="text-xs font-bold" style={{ color: C.text }}>{d.acceptance}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm font-bold" style={{ color: C.green }}>{d.earnings.toLocaleString("fr-DZ")} DA</td>
                    <td className="px-5 py-4"><Badge color={sc.text} bg={sc.bg}>{sc.label}</Badge></td>
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

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function OperatorPortal() {
  const [activeTab, setActiveTab] = useState<OperatorTab>("overview");

  return (
    <div className="min-h-screen flex" style={{ background: C.bg, fontFamily: "Inter, sans-serif" }}>
      <Sidebar active={activeTab} setActive={setActiveTab} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar active={activeTab} setActive={setActiveTab} />
        <main className="flex-1 overflow-y-auto dark-scrollbar p-4 md:p-6">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
              {activeTab === "overview" && <OverviewTab />}
              {activeTab === "live"     && <LiveFleetTab />}
              {activeTab === "fleet"    && <FleetTab    />}
              {activeTab === "routes"   && <RoutesTab   />}
              {activeTab === "earnings" && <EarningsTab />}
              {activeTab === "drivers"  && <DriversTab  />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
