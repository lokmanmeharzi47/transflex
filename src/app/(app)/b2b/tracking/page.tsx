"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bus, Navigation, MapPin, Gauge, Route as RouteIcon, Bell, CircleDot } from "lucide-react";
import { ROUTES } from "@/constants/app";
import { tripEngine, useTrip, PHASE_LABEL } from "@/lib/trip-engine";
import { b2bAssignedRoute } from "@/data/transflex-demo";
import { formatKm } from "@/lib/places";

const LiveMap = dynamic(() => import("@/components/LiveMap"), {
  ssr: false,
  loading: () => <div className="w-full h-full" style={{ background: "#070c14" }} />,
});

export default function B2BTracking() {
  const router = useRouter();
  const trip = useTrip();
  const r = b2bAssignedRoute;

  useEffect(() => {
    if (tripEngine.getSnapshot().phase === "idle") {
      tripEngine.startTrip(r.from, r.to).then(() => tripEngine.confirmBooking());
    }
  }, [r.from, r.to]);

  const etaMin = Math.max(1, Math.round(trip.etaSeconds / 60));
  const progressPct = Math.round(trip.progress * 100);
  const totalDist = trip.route?.distance ?? 0;
  const remainingDist = totalDist * (1 - trip.progress);
  const approaching = trip.phase === "approaching";
  const boarding = trip.phase === "boarding";

  return (
    <div className="flex flex-col h-full relative overflow-hidden" style={{ background: "#070c14" }}>
      {/* Live map */}
      <div className="absolute inset-0 z-0">
        <LiveMap
          route={trip.route}
          showBus
          follow
          user={trip.from}
          pickup={trip.pickup}
          destination={trip.to}
          theme="dark"
          autoFit
          interactive
        />
        <div className="absolute bottom-0 w-full h-40 bg-gradient-to-t from-[#070c14] to-transparent pointer-events-none" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex justify-between items-center p-5 pt-12 pointer-events-none">
        <button
          type="button"
          aria-label="Retour"
          onClick={() => router.push(ROUTES.b2bDashboard)}
          className="w-10 h-10 rounded-full flex items-center justify-center text-white pointer-events-auto"
          style={{ background: "rgba(13,20,34,.85)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(12px)" }}
        >
          <ArrowLeft size={20} />
        </button>
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs text-white pointer-events-auto"
          style={{ background: "rgba(13,20,34,.85)", border: "1px solid rgba(229,57,53,.4)", backdropFilter: "blur(12px)" }}
        >
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          {PHASE_LABEL[trip.phase].toUpperCase()}
        </div>
      </div>

      {/* Arrival notification */}
      <AnimatePresence>
        {(approaching || boarding) && (
          <motion.div
            key="notif"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative z-10 mx-5 mb-2"
          >
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                 style={{ background: "rgba(229,57,53,0.92)", boxShadow: "0 10px 30px rgba(229,57,53,0.4)" }}>
              <Bell size={18} className="text-white shrink-0" />
              <p className="text-white font-bold text-sm">
                {boarding ? "Votre bus est à l'arrêt — montez à bord" : `Votre bus arrive dans ${etaMin} minute${etaMin > 1 ? "s" : ""}`}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom sheet */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 26, stiffness: 200, delay: 0.1 }}
        className="absolute bottom-0 left-0 w-full z-20 rounded-t-[36px] flex flex-col bg-white"
        style={{ boxShadow: "0 -20px 60px rgba(0,0,0,0.3)", paddingTop: 12, maxHeight: "66%" }}
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />

        <div className="px-6 pb-8 overflow-y-auto custom-scrollbar flex-1">
          {/* Bus chip */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-full gradient-primary flex items-center justify-center shrink-0">
              <Bus size={18} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-[15px] text-text-main">{r.busId} · {r.driverName}</p>
              <p className="text-[12px] text-text-secondary">{r.lineName}</p>
            </div>
          </div>

          {/* ETA + metrics */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-text-secondary text-[11px] font-extrabold uppercase tracking-[1.8px] mb-1.5">Arrivée estimée</p>
              {boarding ? (
                <span className="text-[40px] leading-none font-extrabold text-text-main tracking-tighter">Maintenant</span>
              ) : (
                <div className="flex items-end gap-2">
                  <span className="text-[52px] leading-none font-extrabold text-text-main tracking-tighter">{etaMin}</span>
                  <span className="text-xl font-bold text-text-secondary mb-2">min</span>
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="inline-flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-xl text-sm font-extrabold text-text-main">
                <RouteIcon size={14} className="text-primary" /> {formatKm(remainingDist)}
              </div>
              <div className="inline-flex items-center gap-1.5 bg-primary/8 px-3 py-1.5 rounded-xl text-sm font-extrabold text-primary border border-primary/15">
                <Gauge size={13} /> {progressPct}%
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden relative mb-2">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #f59e0b 0%, #e53935 100%)" }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-extrabold text-text-secondary uppercase tracking-wider">
              <span>{r.from}</span>
              <span>{r.to}</span>
            </div>
          </div>

          {/* Stops */}
          <h3 className="font-extrabold text-[12px] uppercase tracking-[1.5px] text-text-secondary mb-3">Ma ligne</h3>
          <div className="relative border-l-2 border-dashed border-gray-200 ml-2 pl-5 flex flex-col gap-4">
            <div className="relative">
              <CircleDot size={14} className="absolute -left-[27px] text-badge bg-white rounded-full" />
              <p className="font-bold text-[14px] text-text-main leading-tight">{r.boardingStop}</p>
              <p className="text-[12px] text-text-secondary">Montée · {r.departure}</p>
            </div>
            <div className="relative">
              <MapPin size={14} className="absolute -left-[27px] text-primary bg-white rounded-full" />
              <p className="font-bold text-[14px] text-text-main leading-tight">{r.dropoffStop}</p>
              <p className="text-[12px] text-text-secondary">Descente · {r.arrival}</p>
            </div>
          </div>

          {/* Navigation note */}
          <div className="mt-6 flex items-center gap-3 p-4 rounded-[18px]" style={{ background: "#fafafa", border: "1px solid #eee" }}>
            <Navigation size={18} className="text-primary shrink-0" />
            <p className="text-[13px] text-text-secondary font-medium">
              Position GPS du bus mise à jour en temps réel. Aucun paiement requis — financé par {r.to.includes("Ezzouar") ? "votre entreprise" : "l'entreprise"}.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
