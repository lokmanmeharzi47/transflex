"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import {
  Building2, BarChart3, Radio, Users, Route, FileText, Receipt,
  Bell, Settings, LogOut, ChevronRight, Download, Plus, Upload,
  X, Gauge, Clock, Leaf, CheckCircle2, XCircle, AlertCircle,
  UserMinus, Shuffle, Mail, KeyRound, ArrowRight, MapPin, Fuel, ShieldCheck,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  companyProfile, companyFleetVehicles, companyLines, companyEmployees,
  companyChangeRequests, companyInvoices, companyUsageDaily, companyUsageWeekly,
  companyUsageMonthly, companyNotifications,
} from "@/data/transflex-demo";
import type { CompanyTab, CompanyEmployee } from "@/types/transflex";
import { ROUTES } from "@/constants/app";

const FleetMap = dynamic(() => import("@/components/FleetMap"), {
  ssr: false,
  loading: () => <div className="w-full h-full" style={{ background: "#0b1120" }} />,
});

// ─── Palette (Company — violet accent) ────────────────────────────────────────

const C = {
  bg: "#0b1120", surface: "#111827", border: "rgba(255,255,255,0.08)",
  text: "#f1f5f9", muted: "#64748b", dim: "#94a3b8",
  primary: "#a78bfa", red: "#e53935", green: "#22c55e", blue: "#4d9fff", amber: "#f59e0b",
};

function useCountUp(target: number, duration = 1100) {
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
  return <div className={`rounded-2xl border ${className}`} style={{ background: C.surface, borderColor: C.border }}>{children}</div>;
}

function Badge({ children, color, bg }: { children: React.ReactNode; color: string; bg: string }) {
  return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ color, background: bg }}>{children}</span>;
}

function StatChip({ val, label, color = C.text }: { val: string | number; label: string; color?: string }) {
  return (
    <div className="rounded-xl p-3 flex flex-col gap-1" style={{ background: "rgba(255,255,255,0.04)" }}>
      <span className="text-xl font-extrabold tracking-tight" style={{ color }}>{val}</span>
      <span className="text-[11px] font-medium" style={{ color: C.muted }}>{label}</span>
    </div>
  );
}

const CHART_TOOLTIP = {
  contentStyle: { background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#f1f5f9", fontSize: 12 },
  cursor: { fill: "rgba(255,255,255,0.03)" },
};
const AXIS = { fill: "#64748b", fontSize: 11 };

const NAV: { id: CompanyTab; icon: typeof Users; label: string }[] = [
  { id: "overview",  icon: BarChart3, label: "Tableau de bord" },
  { id: "live",      icon: Radio,     label: "Live Map" },
  { id: "employees", icon: Users,     label: "Employés" },
  { id: "lines",     icon: Route,     label: "Lignes" },
  { id: "requests",  icon: Shuffle,   label: "Demandes" },
  { id: "reports",   icon: FileText,  label: "Rapports RH" },
  { id: "billing",   icon: Receipt,   label: "Facturation" },
];

const TAB_LABELS: Record<CompanyTab, string> = {
  overview: "Tableau de bord", live: "Live Map Entreprise", employees: "Gestion des Employés",
  lines: "Gestion des Lignes", requests: "Demandes de Changement", reports: "Rapports RH", billing: "Facturation",
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

function CompanyAuth({ onLogin }: { onLogin: () => void }) {
  const router = useRouter();
  const [method, setMethod] = useState<"email" | "code">("code");
  return (
    <div className="min-h-screen flex items-center justify-center p-5 relative overflow-hidden" style={{ background: C.bg }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 left-1/4 w-[420px] h-[420px] rounded-full opacity-25" style={{ background: "radial-gradient(circle, rgba(167,139,250,0.3) 0%, transparent 65%)" }} />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full opacity-20" style={{ background: "radial-gradient(circle, rgba(229,57,53,0.2) 0%, transparent 70%)" }} />
      </div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md">
        <Card className="p-7">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-[16px] flex items-center justify-center" style={{ background: `${C.primary}22`, border: `1px solid ${C.primary}44` }}>
              <Building2 size={22} style={{ color: C.primary }} />
            </div>
            <div>
              <p className="font-extrabold text-lg" style={{ color: C.text }}>Connexion Entreprise</p>
              <p className="text-xs" style={{ color: C.muted }}>Espace client sécurisé · TransFlex</p>
            </div>
          </div>

          <div className="flex gap-2 mb-5">
            {[
              { id: "code" as const,  label: "Code entreprise", icon: KeyRound },
              { id: "email" as const, label: "Email pro",       icon: Mail },
            ].map(m => {
              const sel = method === m.id;
              return (
                <button key={m.id} type="button" onClick={() => setMethod(m.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all"
                  style={{ background: sel ? `${C.primary}1f` : "rgba(255,255,255,0.04)", color: sel ? C.primary : C.dim, border: `1px solid ${sel ? `${C.primary}44` : C.border}` }}>
                  <m.icon size={15} /> {m.label}
                </button>
              );
            })}
          </div>

          <label className="text-[11px] font-extrabold uppercase tracking-widest" style={{ color: C.muted }}>
            {method === "code" ? "Code entreprise" : "Email professionnel"}
          </label>
          <input
            type="text"
            defaultValue={method === "code" ? companyProfile.code : companyProfile.email}
            className="w-full mt-1.5 mb-3 p-3.5 rounded-xl text-sm font-bold outline-none"
            style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`, color: C.text }}
          />

          {method === "code" && (
            <div className="flex flex-wrap gap-2 mb-4">
              { ["COMP-ENTERPRISE", "COMP-DJAZI", "COMP-MOBILIS"].map(c => (
                <span key={c} className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ color: C.primary, background: `${C.primary}1a`, border: `1px solid ${C.primary}33` }}>{c}</span>
              ))}
            </div>
          )}

          <button type="button" onClick={onLogin}
            className="w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 mb-2"
            style={{ background: `linear-gradient(135deg, ${C.primary}, #7c3aed)` }}>
            Accéder à l&apos;espace entreprise <ArrowRight size={18} />
          </button>
          <button type="button" disabled className="w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
            style={{ border: `1px solid ${C.border}`, color: C.dim }}>
            <ShieldCheck size={15} /> SSO entreprise (bientôt)
          </button>
          <button type="button" onClick={() => router.push(ROUTES.splash)} className="w-full text-center text-xs font-semibold mt-4" style={{ color: C.muted }}>
            Retour à l&apos;accueil
          </button>
        </Card>
      </motion.div>
    </div>
  );
}

// ─── Sidebar / TopBar ─────────────────────────────────────────────────────────

function Sidebar({ active, setActive }: { active: CompanyTab; setActive: (t: CompanyTab) => void }) {
  const router = useRouter();
  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r" style={{ background: C.surface, borderColor: C.border }}>
      <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: C.border }}>
        <div className="w-10 h-10 rounded-[14px] flex items-center justify-center flex-shrink-0" style={{ background: `${C.primary}22`, border: `1px solid ${C.primary}44` }}>
          <Building2 size={20} style={{ color: C.primary }} />
        </div>
        <div>
          <p className="font-extrabold text-sm" style={{ color: C.text }}>{companyProfile.name}</p>
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: C.muted }}>Espace Entreprise</p>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {NAV.map(({ id, icon: Icon, label }) => (
          <button key={id} type="button" onClick={() => setActive(id)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left"
            style={{ background: active === id ? `${C.primary}1f` : "transparent", color: active === id ? C.primary : C.dim }}>
            <Icon size={17} />{label}
          </button>
        ))}
      </nav>
      <div className="px-3 pb-4 border-t pt-4" style={{ borderColor: C.border }}>
        <button type="button" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold w-full text-left" style={{ color: C.muted }}>
          <Settings size={17} /> Paramètres
        </button>
        <button type="button" onClick={() => router.push(ROUTES.splash)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold w-full text-left" style={{ color: C.muted }}>
          <LogOut size={17} /> Déconnexion
        </button>
      </div>
    </aside>
  );
}

function NotificationsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const META: Record<string, { icon: typeof Bell; color: string }> = {
    delay:     { icon: Clock,       color: C.amber },
    incident:  { icon: AlertCircle, color: C.red },
    offline:   { icon: XCircle,     color: C.muted },
    occupancy: { icon: Gauge,       color: C.primary },
  };
  return (
    <AnimatePresence>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.98 }}
            className="absolute right-4 top-14 z-50 w-80 rounded-2xl border overflow-hidden shadow-2xl"
            style={{ background: C.surface, borderColor: C.border }}>
            <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: C.border }}>
              <p className="font-bold text-sm" style={{ color: C.text }}>Notifications</p>
              <button type="button" onClick={onClose} className="p-1 rounded-lg" style={{ color: C.muted }}><X size={15} /></button>
            </div>
            <div className="max-h-80 overflow-y-auto dark-scrollbar">
              {companyNotifications.map(n => {
                const m = META[n.type];
                return (
                  <div key={n.id} className="px-4 py-3 flex gap-3 border-b" style={{ borderColor: C.border, background: n.unread ? "rgba(167,139,250,0.05)" : "transparent" }}>
                    <div className="p-2 rounded-lg h-fit shrink-0" style={{ background: `${m.color}18` }}><m.icon size={15} style={{ color: m.color }} /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold" style={{ color: C.text }}>{n.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: C.muted }}>{n.detail}</p>
                      <p className="text-[10px] mt-1" style={{ color: C.muted }}>{n.time}</p>
                    </div>
                    {n.unread && <span className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ background: C.primary }} />}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function TopBar({ active, setActive }: { active: CompanyTab; setActive: (t: CompanyTab) => void }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const unread = companyNotifications.filter(n => n.unread).length;
  return (
    <header className="flex items-center gap-3 px-4 py-3 border-b shrink-0 relative" style={{ background: C.surface, borderColor: C.border }}>
      <div className="lg:hidden w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${C.primary}22` }}>
        <Building2 size={18} style={{ color: C.primary }} />
      </div>
      <div className="lg:hidden flex gap-1 overflow-x-auto flex-1">
        {NAV.map(({ id, icon: Icon }) => (
          <button key={id} type="button" onClick={() => setActive(id)} className="p-2.5 rounded-xl shrink-0 transition-all"
            style={{ background: active === id ? `${C.primary}20` : "transparent", color: active === id ? C.primary : C.muted }}>
            <Icon size={18} />
          </button>
        ))}
      </div>
      <div className="hidden lg:flex items-center gap-2 text-sm font-semibold" style={{ color: C.dim }}>
        <span>{companyProfile.name}</span><ChevronRight size={14} /><span style={{ color: C.text }}>{TAB_LABELS[active]}</span>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <button type="button" onClick={() => setNotifOpen(v => !v)} className="relative p-2 rounded-xl border" style={{ borderColor: C.border, color: C.dim }} aria-label="Notifications">
          <Bell size={16} />
          {unread > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-extrabold text-white" style={{ background: C.red }}>{unread}</span>}
        </button>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: `${C.primary}30`, color: C.primary }}>SO</div>
      </div>
      <NotificationsPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
    </header>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab() {
  const [range, setRange] = useState<"daily" | "weekly" | "monthly">("daily");
  const trips = useCountUp(companyProfile.tripsThisMonth);
  const co2 = useCountUp(companyProfile.co2SavedKg);
  const data = range === "daily" ? companyUsageDaily : range === "weekly" ? companyUsageWeekly : companyUsageMonthly;

  const KPIS = [
    { icon: Users,      label: "Employés inscrits",       val: companyProfile.enrolled,        color: C.primary },
    { icon: CheckCircle2,label: "Actifs aujourd'hui",     val: companyProfile.activeToday,     color: C.green },
    { icon: Route,      label: "Trajets ce mois",         val: trips.toLocaleString("fr-DZ"),  color: C.blue },
    { icon: Gauge,      label: "Taux d'occupation",       val: `${companyProfile.occupancyRate}%`, color: C.amber },
    { icon: Clock,      label: "Ponctualité",             val: `${companyProfile.punctuality}%`, color: C.green },
    { icon: Leaf,       label: "CO₂ économisé (kg)",       val: co2.toLocaleString("fr-DZ"),    color: C.green },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {KPIS.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-4 flex flex-col gap-2">
              <div className="p-2 rounded-lg w-fit" style={{ background: `${k.color}20` }}><k.icon size={15} style={{ color: k.color }} /></div>
              <p className="text-2xl font-extrabold tracking-tight" style={{ color: C.text }}>{k.val}</p>
              <p className="text-[11px]" style={{ color: C.muted }}>{k.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Usage chart with range toggle */}
      <Card>
        <div className="px-5 py-3.5 border-b flex items-center justify-between" style={{ borderColor: C.border }}>
          <p className="font-bold text-sm" style={{ color: C.text }}>Utilisation des navettes</p>
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
            {([["daily", "Jour"], ["weekly", "Semaine"], ["monthly", "Mois"]] as const).map(([r, lbl]) => (
              <button key={r} type="button" onClick={() => setRange(r)}
                className="px-3 py-1 rounded-lg text-xs font-bold transition-all"
                style={{ background: range === r ? `${C.primary}25` : "transparent", color: range === r ? C.primary : C.muted }}>
                {lbl}
              </button>
            ))}
          </div>
        </div>
        <div className="p-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            {range === "monthly" ? (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="label" tick={AXIS} axisLine={false} tickLine={false} />
                <YAxis tick={AXIS} axisLine={false} tickLine={false} />
                <Tooltip {...CHART_TOOLTIP} />
                <Line type="monotone" dataKey="trips" stroke={C.primary} strokeWidth={2.5} dot={{ r: 3 }} name="Trajets" />
                <Line type="monotone" dataKey="employees" stroke={C.blue} strokeWidth={2} dot={false} name="Employés" />
              </LineChart>
            ) : range === "weekly" ? (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="label" tick={AXIS} axisLine={false} tickLine={false} />
                <YAxis tick={AXIS} axisLine={false} tickLine={false} />
                <Tooltip {...CHART_TOOLTIP} />
                <Bar dataKey="trips" fill={C.primary} radius={[6, 6, 0, 0]} name="Trajets" />
              </BarChart>
            ) : (
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="coUsage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.primary} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={C.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="label" tick={AXIS} axisLine={false} tickLine={false} />
                <YAxis tick={AXIS} axisLine={false} tickLine={false} />
                <Tooltip {...CHART_TOOLTIP} />
                <Area type="monotone" dataKey="trips" stroke={C.primary} fill="url(#coUsage)" strokeWidth={2} name="Trajets" dot={false} />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

// ─── Live Map Tab ─────────────────────────────────────────────────────────────

const FLEET_STATUS: Record<string, { text: string; bg: string; label: string }> = {
  active:      { text: C.green,  bg: `${C.green}20`,           label: "En service" },
  delayed:     { text: C.amber,  bg: `${C.amber}20`,           label: "Retard" },
  maintenance: { text: C.blue,   bg: `${C.blue}20`,            label: "En pause" },
  offline:     { text: C.muted,  bg: "rgba(100,116,139,0.15)", label: "Incident" },
};

function LiveTab() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = companyFleetVehicles.find(v => v.id === selectedId) ?? null;
  return (
    <div className="space-y-4">
      <p className="text-sm" style={{ color: C.muted }}>
        Suivi en temps réel des navettes <span style={{ color: C.text }} className="font-bold">{companyProfile.name}</span> uniquement.
      </p>
      <div className="grid lg:grid-cols-[1fr_320px] gap-4">
        <Card className="overflow-hidden relative">
          <div className="absolute top-3 left-3 z-[500] flex flex-wrap gap-2">
            {Object.entries(FLEET_STATUS).map(([k, s]) => (
              <span key={k} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
                style={{ background: "rgba(17,24,39,0.85)", color: s.text, border: `1px solid ${s.text}33`, backdropFilter: "blur(8px)" }}>
                <span className="w-2 h-2 rounded-full" style={{ background: s.text }} /> {s.label}
              </span>
            ))}
          </div>
          <div style={{ height: 540 }}>
            <FleetMap vehicles={companyFleetVehicles} selectedId={selectedId} onSelect={setSelectedId} />
          </div>
        </Card>

        <Card className="p-0 overflow-hidden flex flex-col">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div key={selected.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="flex flex-col h-full">
                <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: C.border }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm" style={{ background: `${FLEET_STATUS[selected.status].text}20`, color: FLEET_STATUS[selected.status].text }}>
                      {selected.id.replace("TF-", "")}
                    </div>
                    <div>
                      <p className="font-extrabold text-sm" style={{ color: C.text }}>{selected.id}</p>
                      <Badge color={FLEET_STATUS[selected.status].text} bg={FLEET_STATUS[selected.status].bg}>{FLEET_STATUS[selected.status].label}</Badge>
                    </div>
                  </div>
                  <button type="button" aria-label="Fermer" onClick={() => setSelectedId(null)} className="p-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.05)", color: C.dim }}><X size={16} /></button>
                </div>
                <div className="p-5 space-y-4">
                  {[
                    { icon: Users,  label: "Chauffeur", val: selected.driver },
                    { icon: Route,  label: "Ligne", val: selected.route },
                    { icon: MapPin, label: "Prochain arrêt", val: selected.nextStop },
                  ].map(row => (
                    <div key={row.label} className="flex items-center gap-3">
                      <div className="p-2 rounded-lg shrink-0" style={{ background: "rgba(255,255,255,0.04)" }}><row.icon size={15} style={{ color: C.dim }} /></div>
                      <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: C.muted }}>{row.label}</p><p className="text-sm font-bold truncate" style={{ color: C.text }}>{row.val}</p></div>
                    </div>
                  ))}
                  <div className="grid grid-cols-2 gap-3">
                    <StatChip val={`${selected.passengers}/${selected.capacity}`} label="Occupation" />
                    <StatChip val={`${selected.speed} km/h`} label="Vitesse" color={C.blue} />
                    <StatChip val={selected.eta > 0 ? `${selected.eta} min` : "—"} label="ETA" color={C.amber} />
                    <StatChip val={`${selected.fuel}%`} label="Carburant" color={selected.fuel > 50 ? C.green : C.amber} />
                  </div>
                  <div className="flex items-center gap-2 text-xs" style={{ color: C.muted }}>
                    <Fuel size={13} style={{ color: selected.fuel > 50 ? C.green : C.amber }} />
                    <div className="flex-1 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
                      <div className="h-full rounded-full" style={{ width: `${selected.fuel}%`, background: selected.fuel > 50 ? C.green : C.amber }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center text-center h-full py-16 px-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(255,255,255,0.05)" }}><Radio size={24} style={{ color: C.muted }} /></div>
                <p className="font-bold text-sm" style={{ color: C.text }}>Sélectionnez une navette</p>
                <p className="text-xs mt-1.5" style={{ color: C.muted }}>Cliquez sur un bus de la carte pour voir ses informations en direct.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </div>
  );
}

// ─── Employees Tab ────────────────────────────────────────────────────────────

function AddEmployeeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden"
        style={{ background: C.surface, borderColor: C.border }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: C.border }}>
          <p className="font-bold text-sm" style={{ color: C.text }}>Ajouter un employé</p>
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-white/5 transition-colors" style={{ color: C.muted }}><X size={16} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-bold mb-1.5 block" style={{ color: C.dim }}>Nom complet</label>
            <input type="text" className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none transition-colors focus:border-white/20" style={{ background: "rgba(255,255,255,0.02)", borderColor: C.border, color: C.text }} placeholder="ex: Omar B." />
          </div>
          <div>
            <label className="text-xs font-bold mb-1.5 block" style={{ color: C.dim }}>Matricule</label>
            <input type="text" className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none transition-colors focus:border-white/20" style={{ background: "rgba(255,255,255,0.02)", borderColor: C.border, color: C.text }} placeholder="ex: EMP-204" />
          </div>
          <div>
            <label className="text-xs font-bold mb-1.5 block" style={{ color: C.dim }}>Département</label>
            <input type="text" className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none transition-colors focus:border-white/20" style={{ background: "rgba(255,255,255,0.02)", borderColor: C.border, color: C.text }} placeholder="ex: IT" />
          </div>
          <div>
            <label className="text-xs font-bold mb-1.5 block" style={{ color: C.dim }}>Ligne de transport</label>
            <select className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none appearance-none" style={{ background: "rgba(255,255,255,0.02)", borderColor: C.border, color: C.text }}>
              {companyLines.map(l => (
                <option key={l.id} value={l.id} className="bg-gray-900">{l.name} - {l.from}</option>
              ))}
            </select>
          </div>
          <button type="button" onClick={onClose} className="w-full py-3 mt-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]" style={{ background: C.primary }}>
            Confirmer l&apos;ajout
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function EmployeesTab() {
  const [rows, setRows] = useState<CompanyEmployee[]>(() => companyEmployees.map(e => ({ ...e })));
  const [search, setSearch] = useState("");
  const filtered = rows.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.matricule.toLowerCase().includes(search.toLowerCase()) ||
    e.department.toLowerCase().includes(search.toLowerCase()),
  );
  const toggleStatus = (id: string) =>
    setRows(rs => rs.map(e => e.id === id ? { ...e, status: e.status === "active" ? "inactive" : "active" } : e));
  const reassign = (id: string) => {
    const lines = companyLines.map(l => l.id);
    setRows(rs => rs.map(e => {
      if (e.id !== id) return e;
      const next = lines[(lines.indexOf(e.line) + 1) % lines.length];
      return { ...e, line: next };
    }));
  };

  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {showAddModal && <AddEmployeeModal open={showAddModal} onClose={() => setShowAddModal(false)} />}
      </AnimatePresence>

      <div className="flex flex-wrap items-center gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher employé, matricule…"
          className="flex-1 min-w-[200px] rounded-xl border px-4 py-2.5 text-sm outline-none" style={{ background: C.surface, borderColor: C.border, color: C.text }} />
        <button type="button" className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold" style={{ borderColor: C.border, color: C.dim }}>
          <Upload size={14} /> Import CSV
        </button>
        <button type="button" onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95" style={{ background: C.primary }}>
          <Plus size={14} /> Ajouter employé
        </button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left" style={{ borderColor: C.border }}>
                {["Nom", "Matricule", "Département", "Ligne", "Statut", "Actions"].map(h => (
                  <th key={h} className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: C.muted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((e, i) => (
                <motion.tr key={e.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-t" style={{ borderColor: C.border }}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: `${C.primary}25`, color: C.primary }}>
                        {e.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <span className="text-sm font-bold" style={{ color: C.text }}>{e.name}</span>
                      {e.activeToday && <span className="w-2 h-2 rounded-full" style={{ background: C.green }} title="Actif aujourd'hui" />}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs font-mono" style={{ color: C.muted }}>{e.matricule}</td>
                  <td className="px-5 py-4 text-sm" style={{ color: C.dim }}>{e.department}</td>
                  <td className="px-5 py-4"><Badge color={C.primary} bg={`${C.primary}1f`}>{e.line}</Badge></td>
                  <td className="px-5 py-4">
                    {e.status === "active"
                      ? <Badge color={C.green} bg={`${C.green}20`}>Actif</Badge>
                      : <Badge color={C.muted} bg="rgba(100,116,139,0.15)">Inactif</Badge>}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => reassign(e.id)} aria-label="Réaffecter une ligne"
                        className="p-1.5 rounded-lg" style={{ background: `${C.blue}15`, color: C.blue }} title="Réaffecter une ligne"><Shuffle size={14} /></button>
                      <button type="button" onClick={() => toggleStatus(e.id)} aria-label="Désactiver l'employé"
                        className="p-1.5 rounded-lg" style={{ background: `${C.red}15`, color: C.red }} title="Activer / Désactiver"><UserMinus size={14} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── Lines Tab ────────────────────────────────────────────────────────────────

function LinesTab() {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {companyLines.map((l, i) => {
        const occPct = Math.round((l.occupancy / l.capacity) * 100);
        return (
          <motion.div key={l.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-extrabold" style={{ color: C.text }}>{l.name}</p>
                  <p className="text-xs mt-0.5 flex items-center gap-1.5" style={{ color: C.muted }}>
                    <MapPin size={11} /> {l.from} → {l.to}
                  </p>
                </div>
                <Badge color={C.primary} bg={`${C.primary}1f`}>{l.id}</Badge>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <StatChip val={l.enrolled} label="Inscrits" color={C.primary} />
                <StatChip val={`${l.occupancy}/${l.capacity}`} label="Occupation" />
                <StatChip val={`${l.punctuality}%`} label="Ponctualité" color={C.green} />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5" style={{ color: C.muted }}>
                  <span>Taux d&apos;occupation</span><span style={{ color: C.text }}>{occPct}%</span>
                </div>
                <div className="h-2 rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
                  <motion.div className="h-full rounded-full" style={{ background: occPct > 85 ? C.red : C.primary }}
                    initial={{ width: 0 }} animate={{ width: `${occPct}%` }} transition={{ duration: 0.8 }} />
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Requests Tab ─────────────────────────────────────────────────────────────

function RequestsTab() {
  return (
    <div className="space-y-4">
      <Card className="p-4 flex items-start gap-3">
        <div className="p-2 rounded-lg shrink-0" style={{ background: `${C.primary}18` }}><Shuffle size={16} style={{ color: C.primary }} /></div>
        <div>
          <p className="font-bold text-sm" style={{ color: C.text }}>Demandes traitées automatiquement</p>
          <p className="text-xs mt-0.5" style={{ color: C.muted }}>Approbation / refus selon la capacité et les règles entreprise. Consultation uniquement — aucune validation manuelle.</p>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left" style={{ borderColor: C.border }}>
                {["Employé", "Ligne actuelle", "Ligne demandée", "Motif", "Statut", "Heure"].map(h => (
                  <th key={h} className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: C.muted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {companyChangeRequests.map((r, i) => (
                <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="border-t" style={{ borderColor: C.border }}>
                  <td className="px-5 py-4 text-sm font-bold" style={{ color: C.text }}>{r.employee}</td>
                  <td className="px-5 py-4 text-sm" style={{ color: C.dim }}>{r.currentLine}</td>
                  <td className="px-5 py-4 text-sm" style={{ color: C.dim }}>{r.requestedLine}</td>
                  <td className="px-5 py-4 text-xs" style={{ color: C.muted }}>{r.reason}</td>
                  <td className="px-5 py-4">
                    {r.status === "approved"
                      ? <Badge color={C.green} bg={`${C.green}20`}>Approuvé auto</Badge>
                      : <Badge color={C.red} bg={`${C.red}20`}>Refusé auto</Badge>}
                  </td>
                  <td className="px-5 py-4 text-xs" style={{ color: C.muted }}>{r.time}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── Reports Tab ──────────────────────────────────────────────────────────────

function ReportsTab() {
  const reports = [
    { title: "Présence transport", desc: "Suivi de présence des employés sur les navettes.", icon: CheckCircle2, color: C.green },
    { title: "Utilisation des navettes", desc: "Trajets, occupation et fréquence par ligne.", icon: Route, color: C.primary },
    { title: "Taux de participation", desc: "Part des employés inscrits réellement actifs.", icon: Users, color: C.blue },
    { title: "Retards", desc: "Historique de ponctualité et retards constatés.", icon: Clock, color: C.amber },
  ];
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {reports.map((r, i) => (
        <motion.div key={r.title} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
          <Card className="p-5 flex flex-col gap-4 h-full">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl shrink-0" style={{ background: `${r.color}1f` }}><r.icon size={18} style={{ color: r.color }} /></div>
              <div>
                <p className="font-bold text-sm" style={{ color: C.text }}>{r.title}</p>
                <p className="text-xs mt-0.5" style={{ color: C.muted }}>{r.desc}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-auto">
              <button type="button" className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold" style={{ background: `${C.red}15`, color: C.red }}>
                <FileText size={14} /> PDF
              </button>
              <button type="button" className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold" style={{ background: `${C.green}15`, color: C.green }}>
                <Download size={14} /> Excel
              </button>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Billing Tab ──────────────────────────────────────────────────────────────

function BillingTab() {
  const current = companyInvoices[0];
  return (
    <div className="space-y-5">
      <div className="grid md:grid-cols-3 gap-3">
        <Card className="p-5 md:col-span-1" >
          <p className="text-xs" style={{ color: C.muted }}>Facture actuelle · {current.period}</p>
          <p className="text-3xl font-extrabold mt-1.5" style={{ color: C.text }}>{current.total.toLocaleString("fr-DZ")}<span className="text-base ml-1" style={{ color: C.muted }}>DA</span></p>
          <Badge color={C.amber} bg={`${C.amber}20`}>En attente</Badge>
          <button type="button" className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: C.primary }}>
            <Download size={14} /> Télécharger PDF
          </button>
        </Card>
        <Card className="p-5 flex flex-col justify-center"><StatChip val={current.employees} label="Employés facturés" color={C.primary} /></Card>
        <Card className="p-5 flex flex-col justify-center"><StatChip val={`${companyProfile.costPerEmployee.toLocaleString("fr-DZ")} DA`} label="Coût par employé / mois" color={C.amber} /></Card>
      </div>

      <Card className="overflow-hidden">
        <div className="px-5 py-3.5 border-b" style={{ borderColor: C.border }}><p className="font-bold text-sm" style={{ color: C.text }}>Historique des factures</p></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left" style={{ borderColor: C.border }}>
                {["Référence", "Période", "Employés", "Total", "Statut", ""].map(h => (
                  <th key={h} className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: C.muted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {companyInvoices.map((inv, i) => (
                <motion.tr key={inv.ref} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="border-t" style={{ borderColor: C.border }}>
                  <td className="px-5 py-4 text-sm font-bold" style={{ color: C.text }}>{inv.ref}</td>
                  <td className="px-5 py-4 text-sm" style={{ color: C.dim }}>{inv.period}</td>
                  <td className="px-5 py-4 text-sm" style={{ color: C.dim }}>{inv.employees}</td>
                  <td className="px-5 py-4 text-sm font-bold" style={{ color: C.text }}>{inv.total.toLocaleString("fr-DZ")} DA</td>
                  <td className="px-5 py-4">
                    {inv.status === "paid"
                      ? <Badge color={C.green} bg={`${C.green}20`}>Payée</Badge>
                      : <Badge color={C.amber} bg={`${C.amber}20`}>En attente</Badge>}
                  </td>
                  <td className="px-5 py-4">
                    <button type="button" className="p-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.05)", color: C.dim }} aria-label="Télécharger"><Download size={14} /></button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function CompanyPortal() {
  const [authed, setAuthed] = useState(false);
  const [activeTab, setActiveTab] = useState<CompanyTab>("overview");

  if (!authed) return <CompanyAuth onLogin={() => setAuthed(true)} />;

  return (
    <div className="min-h-screen flex" style={{ background: C.bg, fontFamily: "Inter, sans-serif" }}>
      <Sidebar active={activeTab} setActive={setActiveTab} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar active={activeTab} setActive={setActiveTab} />
        <main className="flex-1 overflow-y-auto dark-scrollbar p-4 md:p-6">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
              {activeTab === "overview"  && <OverviewTab />}
              {activeTab === "live"      && <LiveTab />}
              {activeTab === "employees" && <EmployeesTab />}
              {activeTab === "lines"     && <LinesTab />}
              {activeTab === "requests"  && <RequestsTab />}
              {activeTab === "reports"   && <ReportsTab />}
              {activeTab === "billing"   && <BillingTab />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
