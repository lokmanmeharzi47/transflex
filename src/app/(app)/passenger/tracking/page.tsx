"use client";

import { motion, AnimatePresence } from "motion/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { QrCode as QrIcon, Phone, AlertTriangle, ArrowLeft, Navigation, Bus, Star, Shield, CheckCircle2, Users, MapPin } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { ROUTES } from "@/constants/app";
import { tripEngine, useTrip, PHASE_LABEL, type TripPhase } from "@/lib/trip-engine";
import { rideStops } from "@/data/transflex-demo";

const LiveMap = dynamic(() => import("@/components/LiveMap"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#070c14]" />,
});

const statusColor: Record<TripPhase, string> = {
  idle:        "#64748b",
  searching:   "#f59e0b",
  route_found: "#22c55e",
  reserved:    "#4d9fff",
  approaching: "#e53935",
  boarding:    "#fff234",
  in_trip:     "#22c55e",
  completed:   "#22c55e",
};

export default function TrackingScreen() {
  const router = useRouter();
  const trip   = useTrip();

  useEffect(() => {
    if (tripEngine.getSnapshot().phase === "idle") {
      tripEngine.startTrip("Tafourah", "Bab Ezzouar").then(() => tripEngine.confirmBooking());
    }
  }, []);

  const etaMin      = Math.max(0, Math.round(trip.etaSeconds / 60));
  const completed   = trip.phase === "completed";
  const boarding    = trip.phase === "boarding";
  const approaching = trip.phase === "approaching";
  const progressPct = Math.round(trip.progress * 100);

  // Compute which stops are "done" based on trip progress
  const stopsWithState = rideStops.map((stop, i) => ({
    ...stop,
    done: stop.done || (i < rideStops.length - 1 && progressPct > (i + 1) * (100 / rideStops.length)),
  }));
  const currentStopIdx  = stopsWithState.findIndex(s => !s.done);
  const stopsRemaining  = stopsWithState.filter(s => !s.done).length;

  const banner = (() => {
    switch (trip.phase) {
      case "approaching": return `Le conducteur approche · arrive dans ${Math.max(1, etaMin)} min`;
      case "boarding":    return "Embarquement en cours — montez à bord";
      case "in_trip":     return `En route · arrivée dans ${Math.max(1, etaMin)} min`;
      case "completed":   return "Trajet terminé — merci d'avoir voyagé avec TransFlex";
      default:            return PHASE_LABEL[trip.phase];
    }
  })();

  const newTrip = () => {
    tripEngine.reset();
    router.push(ROUTES.passengerSearch);
  };

  const boardingPassValue = `transflex://boarding?vehicle=TF-402&passenger=pass_12345&route=Tafourah-BabEzzouar`;

  return (
    <div className="flex flex-col h-full relative overflow-hidden" style={{ background: "#070c14" }}>

      {/* Live map — full screen background */}
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

      {/* Approaching pulse ring (shown when driver is near) */}
      <AnimatePresence>
        {(approaching || boarding) && (
          <motion.div
            key="approach-ring"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center"
          >
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="absolute rounded-full border-2"
                style={{ borderColor: approaching ? "#e53935" : "#fff234", width: 80 + i * 60, height: 80 + i * 60 }}
                animate={{ scale: [1, 2.2], opacity: [0.4, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.8, ease: "easeOut" }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <div className="relative z-10 flex justify-between items-center p-5 pt-12 pointer-events-none">
        <button
          type="button"
          aria-label="Retour"
          onClick={() => router.push(ROUTES.passengerSearch)}
          className="w-10 h-10 rounded-full flex items-center justify-center text-white pointer-events-auto"
          style={{ background: "rgba(13,20,34,.85)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(12px)" }}
        >
          <ArrowLeft size={20} />
        </button>

        <motion.div
          key={trip.phase}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs text-white pointer-events-auto"
          style={{
            background:      "rgba(13,20,34,.85)",
            border:          `1px solid ${statusColor[trip.phase]}66`,
            backdropFilter:  "blur(12px)",
            boxShadow:       `0 0 20px ${statusColor[trip.phase]}40`,
          }}
        >
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: statusColor[trip.phase] }} />
          {PHASE_LABEL[trip.phase].toUpperCase()}
        </motion.div>

        <button
          type="button"
          className="w-10 h-10 rounded-full flex items-center justify-center text-white pointer-events-auto"
          style={{ background: "rgba(13,20,34,.85)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(12px)" }}
          aria-label="Sécurité"
        >
          <Shield size={18} />
        </button>
      </div>

      {/* Driver chip */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 mx-5 mb-4"
      >
        <div
          className="inline-flex items-center gap-3 px-4 py-3 rounded-2xl"
          style={{ background: "rgba(13,20,34,.85)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(12px)" }}
        >
          <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center shrink-0">
            <Bus size={16} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">Véhicule #TF-402</p>
            <p className="text-white/50 text-[11px]">White Sprinter · Karim D.</p>
          </div>
          <div className="flex items-center gap-1 ml-2">
            <Star size={11} className="fill-badge text-badge" />
            <span className="text-white/80 text-[12px] font-bold">4.9</span>
          </div>
        </div>
      </motion.div>

      {/* ── Bottom Sheet ── */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 26, stiffness: 200, delay: 0.1 }}
        className="absolute bottom-0 left-0 w-full z-20 rounded-t-[36px] flex flex-col"
        style={{ background: "#ffffff", boxShadow: "0 -20px 60px rgba(0,0,0,0.3)", paddingTop: 12, maxHeight: "68%" }}
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />

        {/* Live status banner */}
        <div className="px-6 mb-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={trip.phase}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-sm font-bold"
              style={{ background: `${statusColor[trip.phase]}14`, color: "#111", border: `1px solid ${statusColor[trip.phase]}33` }}
            >
              <div className="w-2 h-2 rounded-full animate-pulse shrink-0" style={{ background: statusColor[trip.phase] }} />
              {banner}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="px-6 pb-8 overflow-y-auto custom-scrollbar flex-1">
          {completed ? (
            /* ── Trip Completed ── */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center py-4"
            >
              <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-4">
                <CheckCircle2 size={44} className="text-green-500" />
              </div>
              <h2 className="text-2xl font-extrabold text-text-main mb-1">Trajet terminé</h2>
              <p className="text-text-secondary text-sm mb-6">
                {trip.from?.name} → {trip.to?.name} · {trip.fareDA} DA
              </p>
              <div className="flex gap-2 mb-6">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={30} className="fill-badge text-badge" />)}
              </div>
              <button
                type="button"
                onClick={newTrip}
                className="w-full gradient-primary text-white py-4 rounded-[22px] font-bold shadow-premium-red text-[16px]"
              >
                Nouveau trajet
              </button>
            </motion.div>
          ) : (
            <>
              {/* ── ETA hero ── */}
              <div className="flex items-start justify-between mb-5">
                <div>
                  <p className="text-text-secondary text-[11px] font-extrabold uppercase tracking-[1.8px] mb-1.5">
                    {approaching ? "Arrivée du bus" : "Arrivée estimée"}
                  </p>
                  <div className="flex items-end gap-2">
                    {boarding ? (
                      <span className="text-[40px] leading-none font-extrabold text-text-main tracking-tighter">Maintenant</span>
                    ) : (
                      <>
                        <span className="text-[52px] leading-none font-extrabold text-text-main tracking-tighter">
                          {Math.max(1, etaMin)}
                        </span>
                        <span className="text-xl font-bold text-text-secondary mb-2">min</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <div className="inline-flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-xl text-sm font-extrabold text-text-main">
                    <Users size={14} className="text-primary" />
                    {trip.seatsTaken}/{trip.seatsTotal}
                  </div>
                  {stopsRemaining > 0 && (
                    <div className="inline-flex items-center gap-1.5 bg-primary/8 px-3 py-1.5 rounded-xl text-sm font-extrabold text-primary border border-primary/15">
                      <MapPin size={12} />
                      {stopsRemaining} arrêts
                    </div>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-5">
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden relative mb-2">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: "linear-gradient(90deg, #22c55e 0%, #e53935 100%)" }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.5 }}
                  />
                  <motion.div
                    className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-primary rounded-full shadow-sm"
                    animate={{ left: `calc(${progressPct}% - 10px)` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-extrabold text-text-secondary uppercase tracking-wider">
                  <span>{trip.from?.name ?? "Départ"}</span>
                  <span>{trip.to?.name ?? "Destination"}</span>
                </div>
              </div>

              {/* Remaining stops list */}
              <div className="mb-5">
                <h3 className="font-extrabold text-[12px] uppercase tracking-[1.5px] text-text-secondary mb-3">Arrêts du trajet</h3>
                <div className="relative border-l-2 border-dashed border-gray-200 ml-2 pl-5 flex flex-col gap-3">
                  {stopsWithState.map((stop, i) => {
                    const isCurrent = i === currentStopIdx;
                    return (
                      <div key={stop.name} className="relative flex items-start gap-2">
                        <div
                          className={`absolute -left-[25px] w-3 h-3 rounded-full border-2 border-white z-10 transition-all ${
                            stop.done ? "bg-green-500" : isCurrent ? "bg-primary scale-125" : "bg-gray-200"
                          }`}
                        />
                        {isCurrent && (
                          <div className="absolute -left-[25px] w-3 h-3 rounded-full bg-primary animate-ping opacity-60" />
                        )}
                        <p className={`text-[13px] font-bold leading-tight ${
                          stop.done ? "text-text-secondary line-through" : isCurrent ? "text-primary" : "text-text-main"
                        }`}>
                          {stop.name}
                        </p>
                        {isCurrent && (
                          <span className="text-[9px] font-extrabold bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20 ml-1 shrink-0">
                            Prochain
                          </span>
                        )}
                        {stop.name.includes("Vous") && (
                          <span className="text-[9px] font-extrabold bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20 ml-1 shrink-0">
                            Vous
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Real QR Boarding Pass */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[24px] p-5 mb-5 flex items-center justify-between relative overflow-hidden"
                style={{ background: "#111111" }}
              >
                <div
                  className="absolute -right-4 -top-8 w-32 h-32 rounded-full pointer-events-none"
                  style={{ background: "radial-gradient(circle, rgba(229,57,53,0.25) 0%, transparent 70%)" }}
                />
                <div className="relative z-10">
                  <p className="text-white font-extrabold text-[17px] mb-0.5">Pass d&apos;embarquement</p>
                  <p className="text-white/50 text-[13px]">Montrez ce QR au conducteur</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <QrIcon size={12} className="text-primary" />
                    <span className="text-primary text-[11px] font-bold">TF-402 · Siège #7</span>
                  </div>
                </div>
                <div className="bg-white p-2.5 rounded-[16px] relative z-10 shadow-sm" aria-label="QR code d'embarquement">
                  <QRCodeSVG
                    value={boardingPassValue}
                    size={56}
                    bgColor="#ffffff"
                    fgColor="#111111"
                    level="M"
                  />
                </div>
              </motion.div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <button
                  type="button"
                  className="bg-gray-50 border border-gray-100 py-4 rounded-[20px] flex gap-3 items-center justify-center font-bold text-text-main hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Navigation size={15} className="text-primary" />
                  </div>
                  Carte Live
                </button>
                <button
                  type="button"
                  className="bg-gray-50 border border-gray-100 py-4 rounded-[20px] flex gap-3 items-center justify-center font-bold text-text-main hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Phone size={15} className="text-green-600" />
                  </div>
                  Appeler
                </button>
              </div>

              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 text-text-secondary py-3 text-sm font-bold rounded-xl hover:bg-gray-50 hover:text-text-main transition-colors"
              >
                <AlertTriangle size={15} /> Signaler un problème
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
