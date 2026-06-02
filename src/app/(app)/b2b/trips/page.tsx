"use client";

import { motion } from "motion/react";
import { CheckCircle2, XCircle, Clock, Bus, User } from "lucide-react";
import { b2bTrips } from "@/data/transflex-demo";
import type { B2BTripStatus } from "@/types/transflex";

const statusConfig: Record<B2BTripStatus, { label: string; icon: typeof CheckCircle2; color: string; bg: string; border: string }> = {
  completed: { label: "Terminé",  icon: CheckCircle2, color: "#16a34a", bg: "rgba(22,163,74,0.08)", border: "rgba(22,163,74,0.2)" },
  cancelled: { label: "Annulé",   icon: XCircle,      color: "#e53935", bg: "rgba(229,57,53,0.08)", border: "rgba(229,57,53,0.2)" },
  upcoming:  { label: "À venir",  icon: Clock,        color: "#2563eb", bg: "rgba(37,99,235,0.08)", border: "rgba(37,99,235,0.2)" },
};

export default function B2BTrips() {
  const done = b2bTrips.filter(t => t.status === "completed").length;

  return (
    <div className="min-h-full bg-background pb-6">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-[26px] font-extrabold text-text-main tracking-tight">Mes Trajets</h1>
        <p className="text-text-secondary text-sm mt-0.5 font-medium">{b2bTrips.length} trajets · {done} effectués · 0 DA payé</p>
      </div>

      {/* List */}
      <div className="px-5 flex flex-col gap-3">
        {b2bTrips.map((trip, i) => {
          const cfg = statusConfig[trip.status];
          const StatusIcon = cfg.icon;
          return (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="bg-white rounded-[20px] p-4 border border-gray-100 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0"
                     style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                  <StatusIcon size={18} style={{ color: cfg.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-[14px] text-text-main truncate">{trip.line}</p>
                  <p className="text-[11px] text-text-secondary font-medium flex items-center gap-1 mt-0.5">
                    <Clock size={10} /> {trip.date}
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0"
                      style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                  {cfg.label}
                </span>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-text-secondary font-medium pl-1">
                <span className="flex items-center gap-1.5"><User size={11} className="text-text-secondary" /> {trip.driver}</span>
                <span className="flex items-center gap-1.5"><Bus size={11} className="text-text-secondary" /> {trip.vehicle}</span>
                <span className="ml-auto font-mono text-text-secondary/70">{trip.id}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
