"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { MapPin, Clock, ChevronRight, CheckCircle2, XCircle, Loader2 } from "lucide-react";

const trips = [
  { id: "T-9021", from: "Tafourah", to: "Bab Ezzouar", date: "Aujourd'hui, 08:14", duration: "28 min", fare: 350, status: "completed" },
  { id: "T-9018", from: "Hydra", to: "Hussein Dey", date: "Hier, 17:42", duration: "22 min", fare: 280, status: "completed" },
  { id: "T-9015", from: "El Biar", to: "Kouba", date: "Hier, 07:55", duration: "18 min", fare: 320, status: "completed" },
  { id: "T-9012", from: "Tafourah", to: "Aéroport", date: "26 Mai, 11:20", duration: "38 min", fare: 450, status: "completed" },
  { id: "T-9008", from: "Kouba", to: "Bab Ezzouar", date: "25 Mai, 08:05", duration: "32 min", fare: 300, status: "cancelled" },
  { id: "T-9001", from: "Hydra", to: "Tafourah", date: "24 Mai, 18:10", duration: "25 min", fare: 350, status: "completed" },
];

const statusConfig = {
  completed: { label: "Terminé", icon: CheckCircle2, color: "#16a34a", bg: "rgba(22,163,74,0.08)", border: "rgba(22,163,74,0.2)" },
  cancelled:  { label: "Annulé",  icon: XCircle,      color: "#e53935", bg: "rgba(229,57,53,0.08)", border: "rgba(229,57,53,0.2)" },
  ongoing:    { label: "En cours", icon: Loader2,     color: "#2563eb", bg: "rgba(37,99,235,0.08)", border: "rgba(37,99,235,0.2)" },
};

export default function TripsScreen() {
  const router = useRouter();
  const totalSpent = trips.filter(t => t.status === "completed").reduce((s, t) => s + t.fare, 0);

  return (
    <div className="min-h-full bg-background pb-6">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-[26px] font-extrabold text-text-main tracking-tight">Mes Trajets</h1>
        <p className="text-text-secondary text-sm mt-0.5 font-medium">{trips.length} trajets · {totalSpent.toLocaleString()} DA dépensés</p>
      </div>

      {/* Summary card */}
      <div className="mx-5 mb-5 p-4 rounded-[20px] gradient-primary text-white shadow-premium-red">
        <p className="text-[11px] font-extrabold uppercase tracking-widest opacity-80 mb-1">Total ce mois</p>
        <p className="text-[32px] font-extrabold leading-none">{totalSpent.toLocaleString()} <span className="text-[16px] opacity-80">DA</span></p>
        <p className="text-[13px] opacity-70 mt-1">{trips.filter(t => t.status === "completed").length} trajets effectués</p>
      </div>

      {/* Trip list */}
      <div className="px-5 flex flex-col gap-3">
        {trips.map((trip, i) => {
          const cfg = statusConfig[trip.status as keyof typeof statusConfig];
          const StatusIcon = cfg.icon;
          return (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="bg-white rounded-[20px] p-4 border border-gray-100 shadow-sm flex items-center gap-3 cursor-pointer active:scale-[0.99] transition-transform"
              onClick={() => router.push(`/passenger/search`)}
            >
              <div className="w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                <StatusIcon size={18} style={{ color: cfg.color }} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="font-extrabold text-[14px] text-text-main truncate">{trip.from}</span>
                  <ChevronRight size={13} className="text-text-secondary shrink-0" />
                  <span className="font-extrabold text-[14px] text-text-main truncate">{trip.to}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-text-secondary font-medium">
                  <span className="flex items-center gap-1"><Clock size={10} />{trip.date}</span>
                  <span className="flex items-center gap-1"><MapPin size={10} />{trip.duration}</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className="font-extrabold text-[15px] text-text-main">{trip.fare} <span className="text-[11px] text-text-secondary">DA</span></p>
                <p className="text-[10px] font-bold mt-0.5" style={{ color: cfg.color }}>{cfg.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
