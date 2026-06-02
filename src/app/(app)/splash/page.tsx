"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { Navigation, User, ChevronRight, LayoutDashboard, Truck, Sparkles, ArrowRight, Bus, Building2 } from "lucide-react";
import { useSyncExternalStore } from "react";
import { APP_NAME, APP_TAGLINE, ROUTES } from "@/constants/app";
import type { UserRoleId } from "@/types/transflex";

const getStoredRole = (): UserRoleId | null => {
  if (typeof window === "undefined") return null;
  const saved = window.localStorage.getItem("transflex_last_role");
  return (saved === "passenger" || saved === "b2b" || saved === "driver" || saved === "company" || saved === "operator" || saved === "admin")
    ? (saved as UserRoleId)
    : null;
};

const subscribeToStoredRole = (cb: () => void) => {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
};

const ROLE_CONFIG = {
  passenger: {
    icon: User,
    title: "Passager",
    description: "Grand public — réservez des trajets partagés intelligents.",
    path: ROUTES.passenger,
    accent: "#e53935",
    bg: "rgba(229,57,53,0.15)",
    badge: "B2C",
  },
  b2b: {
    icon: Building2,
    title: "Employé Entreprise",
    description: "Votre entreprise paie — accédez à votre navette dédiée.",
    path: ROUTES.b2b,
    accent: "#f59e0b",
    bg: "rgba(245,158,11,0.14)",
    badge: "B2B",
  },
  driver: {
    icon: Bus,
    title: "Conducteur",
    description: "Naviguez sur vos routes et gérez vos passagers.",
    path: ROUTES.driver,
    accent: "#f1f5f9",
    bg: "rgba(241,245,249,0.09)",
    badge: "Driver",
  },
  company: {
    icon: Building2,
    title: "Company Dashboard",
    description: "Espace entreprise cliente — employés, navettes & RH.",
    path: ROUTES.company,
    accent: "#a78bfa",
    bg: "rgba(167,139,250,0.14)",
    badge: "Entreprise",
  },
  operator: {
    icon: Truck,
    title: "partenaire portail",
    description: "Gérez votre flotte, vos routes et vos conducteurs.",
    path: ROUTES.operator,
    accent: "#22c55e",
    bg: "rgba(34,197,94,0.12)",
    badge: "Fleet",
  },
  admin: {
    icon: LayoutDashboard,
    title: "Administrateur",
    description: "Supervision globale — toutes entreprises & opérateurs.",
    path: ROUTES.admin,
    accent: "#4d9fff",
    bg: "rgba(77,159,255,0.12)",
    badge: "Admin",
  },
} satisfies Record<UserRoleId, { icon: React.ElementType; title: string; description: string; path: string; accent: string; bg: string; badge: string }>;

const ROLE_ORDER: UserRoleId[] = ["passenger", "b2b", "driver"];

export default function SplashPage() {
  const router = useRouter();
  const lastRole = useSyncExternalStore(subscribeToStoredRole, getStoredRole, () => null);

  const handleRoleSelect = (role: UserRoleId, path: string) => {
    window.localStorage.setItem("transflex_last_role", role);
    router.push(path);
  };

  return (
    <div className="flex flex-col items-center min-h-screen gradient-cinematic relative overflow-hidden px-5 py-10 justify-center">

      {/* ── Ambient Backgrounds ─── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(229,57,53,0.18) 0%, transparent 65%)" }}
          animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-80 h-80 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,242,52,0.07) 0%, transparent 65%)" }}
          animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <div className="absolute inset-0 dot-grid-dark opacity-25" />
        {/* City grid lines */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="city-grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#city-grid)" />
        </svg>
      </div>

      {/* ── Logo Section ─── */}
      <motion.div
        initial={{ y: -48, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="z-10 flex flex-col items-center mb-10"
      >
        {/* Glow rings + logo */}
        <div className="relative mb-7 flex items-center justify-center">
          {/* Expanding rings */}
          <div className="absolute w-24 h-24 rounded-full border border-primary/25 ring-expand-1" />
          <div className="absolute w-24 h-24 rounded-full border border-primary/20 ring-expand-2" />
          <div className="absolute w-24 h-24 rounded-full border border-primary/15 ring-expand-3" />

          {/* Soft inner glow */}
          <div
            className="absolute w-28 h-28 rounded-full logo-glow-anim"
            style={{ background: "radial-gradient(circle, rgba(229,57,53,0.2) 0%, transparent 70%)", filter: "blur(12px)" }}
          />

          {/* Logo container */}
          <motion.div
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 w-24 h-24 rounded-[28px] overflow-hidden flex items-center justify-center gradient-primary shadow-premium-red border border-white/10"
          >
            <Image
              src="/logo.png"
              alt={APP_NAME}
              width={68}
              height={68}
              unoptimized
              className="object-contain drop-shadow-sm"
              priority
            />
          </motion.div>

          {/* Navigation badge */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.7, type: "spring", stiffness: 320, damping: 18 }}
            className="absolute -bottom-2 -right-2 bg-badge text-black p-1.5 rounded-full z-20 border-[2.5px] glow-yellow"
            style={{ borderColor: "#080c14" }}
          >
            <Navigation size={14} aria-hidden="true" />
          </motion.div>
        </div>

        {/* Brand name */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-[42px] font-extrabold text-white mb-1 tracking-tight text-glow-white"
        >
          {APP_NAME}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="text-[15px] font-medium mb-4"
          style={{ color: "rgba(255,255,255,0.45)" }}
        >
          {APP_TAGLINE}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.55 }}
          className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full border"
          style={{ color: "rgba(229,57,53,0.85)", background: "rgba(229,57,53,0.1)", borderColor: "rgba(229,57,53,0.2)" }}
        >
          <Sparkles size={11} />
          Plateforme MaaS · SaaS · Algérie
        </motion.div>
      </motion.div>

      {/* ── Role Cards ─── */}
      <motion.div
        initial={{ y: 48, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="z-10 flex flex-col gap-3 w-full max-w-sm"
      >
        {/* Continue button */}
        {lastRole && (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            onClick={() => handleRoleSelect(lastRole, ROLE_CONFIG[lastRole].path)}
            className="mb-1 gradient-primary text-white py-3.5 px-6 rounded-[20px] font-bold shadow-premium-red flex justify-between items-center hover:brightness-110 transition-all border border-white/10"
          >
            <span className="flex items-center gap-2 text-sm">
              Continuer en tant que {ROLE_CONFIG[lastRole].title}
            </span>
            <ArrowRight size={18} className="text-white/70" aria-hidden="true" />
          </motion.button>
        )}

        {/* Passenger + B2B + Driver */}
        <div className="flex flex-col gap-2.5">
          {ROLE_ORDER.slice(0, 3).map((roleId, i) => {
            const cfg = ROLE_CONFIG[roleId];
            const RoleIcon = cfg.icon;
            return (
              <motion.button
                key={roleId}
                type="button"
                whileHover={{ scale: 1.015, y: -2 }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => handleRoleSelect(roleId, cfg.path)}
                className="p-5 rounded-[22px] flex items-center gap-4 text-left group transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.045)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div className="p-3 rounded-2xl shrink-0" style={{ background: cfg.bg }}>
                  <RoleIcon size={22} aria-hidden="true" style={{ color: cfg.accent }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-bold text-[17px] text-white group-hover:text-primary transition-colors">{cfg.title}</h3>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
                          style={{ color: cfg.accent, background: cfg.bg }}>{cfg.badge}</span>
                  </div>
                  <p className="text-xs leading-tight" style={{ color: "rgba(255,255,255,0.38)" }}>{cfg.description}</p>
                </div>
                <ChevronRight size={18} className="shrink-0 group-hover:text-primary transition-colors" style={{ color: "rgba(255,255,255,0.18)" }} aria-hidden="true" />
              </motion.button>
            );
          })}
        </div>



        <p className="text-center text-[11px] mt-2" style={{ color: "rgba(255,255,255,0.18)" }}>
          TransFlex Technologies · v2.0 · Alger, Algérie
        </p>
      </motion.div>
    </div>
  );
}
