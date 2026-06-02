"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import {
  Building2, MapPin, Clock, ArrowRight, Bus, Users, Navigation,
  CalendarClock, BadgeCheck, Repeat, ChevronRight, CircleDot,
} from "lucide-react";
import { ROUTES } from "@/constants/app";
import { b2bAssignedRoute, b2bEmployee, b2bPass } from "@/data/transflex-demo";

export default function B2BDashboard() {
  const router = useRouter();
  const r = b2bAssignedRoute;

  return (
    <div className="min-h-full bg-background pb-6">
      {/* Header */}
      <div className="px-5 pt-6 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] font-bold text-text-secondary">Bonjour, {b2bEmployee.name.split(" ")[0]}</p>
            <h1 className="text-[26px] font-extrabold text-text-main tracking-tight leading-tight">Ma Route</h1>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
               style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)" }}>
            <Building2 size={13} style={{ color: "#f59e0b" }} />
            <span className="text-[11px] font-bold" style={{ color: "#b45309" }}>{b2bEmployee.company}</span>
          </div>
        </div>
      </div>

      {/* ── Main Route Card ── */}
      <div className="px-5 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[28px] p-6 text-white shadow-premium-red"
          style={{ background: "linear-gradient(155deg, #1a1d27 0%, #111319 100%)" }}
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-30"
               style={{ background: "radial-gradient(circle, rgba(229,57,53,0.35) 0%, transparent 70%)" }} />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-5">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(34,197,94,0.16)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.3)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Ligne active
              </span>
              <span className="text-[11px] font-bold" style={{ color: "rgba(255,255,255,0.4)" }}>{r.lineName}</span>
            </div>

            {/* From → To */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex flex-col items-center pt-1">
                <CircleDot size={16} className="text-badge" />
                <div className="w-0.5 h-8 my-1 rounded-full" style={{ background: "rgba(255,255,255,0.2)" }} />
                <MapPin size={16} className="text-primary" />
              </div>
              <div className="flex-1">
                <div className="mb-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Montée · {r.departure}</p>
                  <p className="font-extrabold text-[16px] leading-tight">{r.boardingStop}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Descente · {r.arrival}</p>
                  <p className="font-extrabold text-[16px] leading-tight">{r.dropoffStop}</p>
                </div>
              </div>
            </div>

            {/* Meta row */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              {[
                { icon: Clock, label: "Trajet", val: "~50 min" },
                { icon: Bus,   label: "Véhicule", val: r.busId },
                { icon: Users, label: "Places", val: `${r.seatsLeft}/${r.seatsTotal}` },
              ].map(m => (
                <div key={m.label} className="rounded-[16px] p-3" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <m.icon size={14} style={{ color: "#f59e0b" }} />
                  <p className="font-extrabold text-[15px] mt-1.5 leading-none">{m.val}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>{m.label}</p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => router.push(ROUTES.b2bTracking)}
              className="w-full gradient-primary text-white py-3.5 rounded-[18px] font-bold flex items-center justify-center gap-2.5 active:scale-[0.98] transition-transform"
            >
              <Navigation size={18} /> Suivre mon bus en direct
            </button>
          </div>
        </motion.div>
      </div>

      {/* Driver chip */}
      <div className="px-5 mb-4">
        <div className="bg-white rounded-[20px] p-4 border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-full gradient-primary flex items-center justify-center shrink-0">
            <Bus size={18} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[14px] text-text-main">{r.driverName}</p>
            <p className="text-[12px] text-text-secondary truncate">{r.vehicle}</p>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-green-50 text-green-600 border border-green-100">En service</span>
        </div>
      </div>

      {/* ── Pass Entreprise ── */}
      <div className="px-5 mb-4">
        <h2 className="text-[11px] font-extrabold uppercase tracking-widest text-text-secondary mb-2.5 px-1">Pass Entreprise</h2>
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-[24px] p-5 text-white"
          style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }}
        >
          <div className="absolute -bottom-8 -right-6 w-32 h-32 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }} />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BadgeCheck size={18} />
                <span className="font-extrabold text-[15px]">{b2bPass.company}</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-white/25">ACTIF</span>
            </div>
            <p className="text-[13px] font-semibold opacity-90 mb-4">{b2bPass.plan}</p>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-75">Expire le</p>
                <p className="font-extrabold text-[15px]">{b2bPass.expiresOn}</p>
              </div>
              <div className="text-right">
                <p className="text-[28px] font-extrabold leading-none">{b2bPass.daysLeft}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-75">jours restants</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Change request CTA */}
      <div className="px-5">
        <button
          type="button"
          onClick={() => router.push(ROUTES.b2bChange)}
          className="w-full bg-white rounded-[20px] p-4 border border-gray-100 shadow-sm flex items-center gap-3 text-left active:scale-[0.99] transition-transform"
        >
          <div className="w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0" style={{ background: "rgba(229,57,53,0.1)", border: "1px solid rgba(229,57,53,0.18)" }}>
            <Repeat size={18} className="text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-[14px] text-text-main flex items-center gap-2">
              Demander un changement <CalendarClock size={13} className="text-text-secondary" />
            </p>
            <p className="text-[12px] text-text-secondary mt-0.5">Autre horaire, bus ou point de montée</p>
          </div>
          <ChevronRight size={18} className="text-gray-300" />
        </button>
      </div>
    </div>
  );
}
