"use client";

import { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Clock, Users, CreditCard, CheckCircle2, Navigation2, MapPin, Footprints, Route as RouteIcon, Wifi, Bus, Star } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { ROUTES } from "@/constants/app";
import { paymentOptions } from "@/data/transflex-demo";
import { tripEngine, useTrip } from "@/lib/trip-engine";
import { formatDuration } from "@/lib/routing";
import { formatKm } from "@/lib/places";

const LiveMap = dynamic(() => import("@/components/LiveMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#0b1018] flex items-center justify-center">
      <span className="text-white/50 text-sm font-bold">Chargement de la carte…</span>
    </div>
  ),
});

function RouteInner() {
  const router = useRouter();
  const params = useSearchParams();
  const trip = useTrip();
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedPay, setSelectedPay] = useState(paymentOptions.find(p => p.selected)?.id ?? "wallet");

  const from = params.get("from") ?? "Tafourah";
  const to = params.get("to") ?? "Bab Ezzouar";

  useEffect(() => {
    tripEngine.startTrip(from, to);
  }, [from, to]);

  const searching = trip.phase === "idle" || trip.phase === "searching";
  const ready = trip.route !== null && !searching;

  const tripLeg = trip.route?.legs[1] ?? trip.route?.legs[0];
  const etaLabel = tripLeg ? formatDuration(tripLeg.duration) : "—";
  const distLabel = tripLeg ? formatKm(tripLeg.distance) : "—";
  const seatsLeft = trip.seatsTotal - trip.seatsTaken;

  const confirmAndPay = () => {
    tripEngine.confirmBooking();
    router.push(ROUTES.passengerTracking);
  };

  return (
    <div className="flex flex-col h-full bg-[#0b1018] relative overflow-hidden">
      {/* Live map background */}
      <div className="absolute inset-0 z-0 h-[58%]">
        <LiveMap
          route={trip.route}
          user={trip.from}
          pickup={trip.pickup}
          destination={trip.to}
          theme="dark"
          autoFit
          interactive
        />
        <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-[#0b1018] to-transparent pointer-events-none" />
      </div>

      {/* Header */}
      <div className="relative z-10 pt-7 px-5 flex justify-between items-center pointer-events-none">
        <button
          type="button"
          aria-label="Retour"
          onClick={() => router.back()}
          className="p-3 rounded-full pointer-events-auto text-white transition-colors"
          style={{ background: "rgba(13,20,34,.85)", border: "1px solid rgba(255,255,255,.12)", backdropFilter: "blur(12px)" }}
        >
          <ArrowLeft size={20} />
        </button>
        <div
          className="px-4 py-2 rounded-full pointer-events-auto text-white flex items-center gap-2 font-bold text-xs"
          style={{ background: "rgba(13,20,34,.85)", border: "1px solid rgba(255,255,255,.12)", backdropFilter: "blur(12px)" }}
        >
          {ready ? (
            <><CheckCircle2 size={14} className="text-green-400" /> Trajet trouvé</>
          ) : (
            <><div className="w-2 h-2 rounded-full bg-primary animate-pulse" /> Calcul en cours</>
          )}
        </div>
      </div>

      {/* Realtime badge */}
      {ready && (
        <div className="relative z-10 px-5 mt-3 pointer-events-none">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold text-white"
            style={{ background: "rgba(229,57,53,.18)", border: "1px solid rgba(229,57,53,.4)", backdropFilter: "blur(12px)" }}
          >
            <Wifi size={12} className="text-primary" />
            {trip.realRoute ? "Itinéraire routier réel (OSRM)" : "Itinéraire estimé (hors-ligne)"}
          </div>
        </div>
      )}

      {/* Bottom sheet */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 26, stiffness: 220 }}
        className="absolute bottom-0 left-0 w-full bg-white z-20 flex flex-col"
        style={{ height: "62%", borderRadius: "36px 36px 0 0", boxShadow: "0 -16px 48px rgba(0,0,0,0.35)" }}
      >
        <div className="pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* sheet content */}
        <div className="px-5 flex-1 overflow-y-auto custom-scrollbar pb-8">
          <AnimatePresence>
            {!ready ? (
              <motion.div
                key="loading"
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-6 pb-8 bg-white z-10"
              >
                <div className="relative">
                  <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ background: "rgba(229,57,53,0.06)", border: "2px solid rgba(229,57,53,0.12)" }}>
                    <Navigation2 size={32} className="text-primary" />
                  </div>
                  <svg className="absolute top-0 left-0 w-24 h-24 animate-[spin_1.8s_linear_infinite]" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="47" fill="none" stroke="#e53935" strokeWidth="3.5" strokeDasharray="35 200" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="text-center">
                  <h2 className="text-xl font-extrabold mb-2 text-text-main tracking-tight">Recherche du meilleur trajet…</h2>
                  <p className="text-text-secondary text-sm px-6 leading-relaxed">Calcul d&apos;itinéraire routier réel et regroupement des passagers.</p>
                </div>
                {/* skeletons */}
                <div className="w-full space-y-3 px-2">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="h-12 rounded-2xl shimmer-light" />
                  ))}
                </div>
              </motion.div>
            ) : !showConfirm ? (
              <motion.div key="details" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col h-full">
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <h2 className="text-[22px] font-extrabold text-text-main leading-tight mb-1 tracking-tight">
                      {trip.from?.name} → {trip.to?.name}
                    </h2>
                    <p className="text-text-secondary text-sm flex items-center gap-1.5 font-medium">
                      <Clock size={14} /> Arrivée à destination dans ~{etaLabel}
                    </p>
                  </div>
                  <div className={`px-3 py-1.5 rounded-[12px] text-xs font-extrabold flex items-center gap-1.5 shadow-sm border ${seatsLeft <= 3 ? "bg-red-50 text-primary border-red-200" : "bg-badge text-black border-yellow-300"}`}>
                    <Users size={14} /> {seatsLeft} places
                  </div>
                </div>

                {/* metrics */}
                <div className="grid grid-cols-3 gap-2.5 mb-5">
                  <Metric icon={<Clock size={15} className="text-primary" />} label="Durée" value={etaLabel} />
                  <Metric icon={<RouteIcon size={15} className="text-primary" />} label="Distance" value={distLabel} />
                  <Metric icon={<Footprints size={15} className="text-primary" />} label="Marche" value={`${trip.walkMinutes} min`} />
                </div>

                {/* fare */}
                <div className="flex items-center gap-4 bg-background p-4 rounded-[20px] mb-5 border border-gray-100">
                  <div className="flex-1">
                    <p className="text-[11px] uppercase tracking-wider text-text-secondary mb-1 font-bold">Prix dynamique</p>
                    <p className="text-[26px] font-extrabold text-primary leading-none">{trip.fareDA} <span className="text-sm text-text-main">DA</span></p>
                  </div>
                  <div className="w-px h-10 bg-gray-200" />
                  <div className="flex-1 text-right">
                    <p className="text-[11px] uppercase tracking-wider text-text-secondary mb-1 font-bold">Point de prise</p>
                    <p className="text-sm font-bold text-text-main leading-tight mt-1">{formatKm(trip.walkMetres)} à pied</p>
                  </div>
                </div>

                {/* Driver preview chip */}
                <div className="flex items-center gap-3 p-3 rounded-[18px] mb-5 border border-gray-100"
                     style={{ background: "#fafafa" }}>
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center shrink-0">
                    <Bus size={16} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-[14px] text-text-main">Karim Mansouri · TF-402</p>
                    <p className="text-[12px] text-text-secondary">White Sprinter 2021 · 9 passagers</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={13} className="fill-badge text-badge" />
                    <span className="font-extrabold text-[13px] text-text-main">4.9</span>
                  </div>
                </div>

                {/* route line */}
                <div className="mb-4 flex-1">
                  <h3 className="font-extrabold text-sm mb-4 text-text-main uppercase tracking-wider">Votre trajet partagé</h3>
                  <div className="relative border-l-2 border-dashed border-gray-200 ml-3 pl-6 flex flex-col gap-5">
                    <Stop dot="pickup" label={`${trip.from?.name} (Prise en charge)`} sub={`${formatKm(trip.walkMetres)} de marche`} />
                    <Stop dot="bus" label="Hydra" sub="Arrêt intermédiaire" />
                    <Stop dot="bus" label="Hussein Dey" sub="Arrêt intermédiaire" />
                    <Stop dot="bus" label="Bus partagé · TF-402" sub="9 passagers à bord" />
                    <Stop dot="dest" label={`${trip.to?.name} (Destination)`} sub={`Arrivée ~${etaLabel}`} />
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ scale: 1.01 }}
                  type="button"
                  onClick={() => setShowConfirm(true)}
                  className="w-full gradient-primary text-white py-4 rounded-[24px] font-bold mt-2 shadow-premium-red transition-all text-[16px]"
                >
                  Réserver · {trip.fareDA} DA
                </motion.button>
              </motion.div>
            ) : (
              <motion.div key="pay" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col h-full">
                <h2 className="text-[22px] font-extrabold mb-6 text-text-main tracking-tight">Mode de paiement</h2>
                <div className="flex flex-col gap-3 mb-auto">
                  {paymentOptions.map(opt => {
                    const selected = selectedPay === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedPay(opt.id)}
                        className={`p-4 rounded-[20px] border-2 flex items-center gap-4 transition-all group ${selected ? "border-primary bg-primary/5 shadow-sm" : "border-gray-100 hover:border-gray-300"}`}
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${selected ? "bg-primary text-white shadow-md" : "bg-gray-50 text-gray-400"}`}>
                          <CreditCard size={22} />
                        </div>
                        <div className="text-left flex-1">
                          <p className={`font-bold ${selected ? "text-text-main" : "text-text-secondary"}`}>{opt.label}</p>
                          {selected && <p className="text-[11px] font-bold text-primary uppercase mt-0.5 tracking-wider">Sélectionné</p>}
                        </div>
                        {selected && <CheckCircle2 className="text-primary" size={20} />}
                      </button>
                    );
                  })}
                </div>
                {/* QR preview */}
                <div className="flex items-center gap-4 p-4 rounded-[20px] border border-gray-100 mb-5" style={{ background: "#fafafa" }}>
                  <div className="bg-white p-2 rounded-[12px] border border-gray-100 shadow-sm">
                    <QRCodeSVG
                      value={`transflex://booking?route=TF-402&fare=${trip.fareDA}&pay=${selectedPay}`}
                      size={48}
                      bgColor="#ffffff"
                      fgColor="#111111"
                      level="M"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-[13px] text-text-main">Pass d&apos;embarquement prêt</p>
                    <p className="text-[12px] text-text-secondary mt-0.5">Montrez ce QR au conducteur lors de l&apos;embarquement</p>
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={confirmAndPay}
                  className="w-full gradient-primary text-white py-4 rounded-[24px] font-bold mt-2 shadow-premium-red text-[16px]"
                >
                  Confirmer la réservation
                </motion.button>
                <button type="button" onClick={() => setShowConfirm(false)} className="w-full text-text-secondary hover:text-text-main font-bold py-4 mt-2 transition-colors">
                  Retour au trajet
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-background rounded-[16px] p-3 border border-gray-100 flex flex-col gap-1">
      <div className="flex items-center gap-1.5">{icon}<span className="text-[10px] font-extrabold uppercase tracking-wider text-text-secondary">{label}</span></div>
      <span className="text-[15px] font-extrabold text-text-main">{value}</span>
    </div>
  );
}

function Stop({ dot, label, sub }: { dot: "pickup" | "bus" | "dest"; label: string; sub: string }) {
  const styles =
    dot === "pickup" ? "bg-primary border-white scale-125"
    : dot === "bus" ? "bg-badge border-white"
    : "bg-text-main border-white";
  return (
    <div className="relative">
      <div className={`absolute -left-[31px] w-3.5 h-3.5 rounded-full border-2 shadow-sm z-10 ${styles}`} />
      <p className="font-bold text-text-main text-[15px] leading-tight">{label}</p>
      <p className="text-text-secondary text-xs mt-0.5">{sub}</p>
    </div>
  );
}

export default function RouteScreen() {
  return (
    <Suspense fallback={<div className="h-full bg-[#0b1018]" />}>
      <RouteInner />
    </Suspense>
  );
}
