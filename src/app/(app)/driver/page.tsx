"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  Navigation, Users, MapPin, AlertCircle, CheckCircle, QrCode, X,
  Clock, Battery, ArrowUpRight, Signpost, User, Camera, Car, Star,
  Edit2, XCircle, Route, Power,
} from "lucide-react";
import { EXISTING_BOARDINGS, VEHICLE_CAPACITY } from "@/constants/app";
import {
  initialDriverPassengers, initialDriverProfile, initialDriverVehicle,
  driverRecentTrips,
} from "@/data/transflex-demo";
import type { DriverPassenger } from "@/types/transflex";

type ActiveTab = "map" | "passengers" | "trips" | "profile";

// ─── Trips Tab (history — no financials) ──────────────────────────────────────

function TripsTab() {
  return (
    <div className="absolute inset-0 flex flex-col p-5 pb-40 overflow-y-auto dark-scrollbar z-10" style={{ background: "#080c14" }}>
      <h2 className="text-[32px] font-extrabold tracking-tight text-white mb-1 pt-1">Mes Trajets</h2>
      <p className="text-sm font-medium mb-6" style={{ color: "rgba(255,255,255,0.45)" }}>Historique des trajets effectués</p>

      {/* Summary chips */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { icon: Route, val: String(driverRecentTrips.length), label: "Trajets" },
          { icon: Users, val: String(driverRecentTrips.reduce((a, t) => a + t.passengers, 0)), label: "Passagers" },
          { icon: Star,  val: "4.92", label: "Note moy." },
        ].map(s => (
          <div key={s.label} className="rounded-[20px] p-4 flex flex-col items-center gap-1"
               style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <s.icon size={18} className="text-primary" />
            <p className="font-extrabold text-lg text-white">{s.val}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* History list */}
      <div className="rounded-[24px] overflow-hidden" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center justify-between p-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <h3 className="font-extrabold text-white">Derniers Trajets</h3>
        </div>
        <div>
          {driverRecentTrips.map(t => (
            <div key={t.id} className="flex items-center gap-4 px-5 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="w-10 h-10 rounded-2xl bg-primary/12 flex items-center justify-center shrink-0" style={{ border: "1px solid rgba(229,57,53,0.15)" }}>
                <Route size={16} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{t.from} → {t.to}</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{t.passengers} passagers · {t.duration} · {t.time}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-[12px]"
                   style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.2)" }}>
                <CheckCircle size={13} className="text-green-400" />
                <span className="text-[11px] font-bold text-green-400">Terminé</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Driver App ──────────────────────────────────────────────────────────

export default function DriverApp() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("map");
  const [isOnline, setIsOnline] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<"idle" | "success">("idle");
  const [routeState, setRouteState] = useState<"traffic" | "detour" | "dismissed">("traffic");

  const [profileImg, setProfileImg] = useState(initialDriverProfile.avatarSrc);
  const [bio, setBio] = useState(initialDriverProfile.bio);
  const [vehicleMake, setVehicleMake] = useState(initialDriverVehicle.make);
  const [vehicleYear, setVehicleYear] = useState(initialDriverVehicle.year);
  const [licensePlate, setLicensePlate] = useState(initialDriverVehicle.licensePlate);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [passengers, setPassengers] = useState<DriverPassenger[]>(() =>
    initialDriverPassengers.map(p => ({ ...p }))
  );
  const occupiedCount = passengers.filter(p => p.checked).length + EXISTING_BOARDINGS;

  useEffect(() => {
    if (isScanning) {
      const timer = setTimeout(() => {
        setScanStatus("success");
        setPassengers(curr => {
          let boarded = false;
          return curr.map(p => {
            if (!boarded && !p.checked) { boarded = true; return { ...p, checked: true }; }
            return p;
          });
        });
        setTimeout(() => setIsScanning(false), 1500);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isScanning]);

  const handleManualBoarding = (idx: number) => {
    setPassengers(curr => curr.map((p, i) => i === idx ? { ...p, checked: true } : p));
  };

  const navItems = [
    { id: "map"        as ActiveTab, icon: MapPin, label: "Nav"     },
    { id: "passengers" as ActiveTab, icon: Users,  label: "Manifest", badge: passengers.filter(p => !p.checked).length },
    { id: "trips"      as ActiveTab, icon: Route,  label: "Trajets" },
    { id: "profile"    as ActiveTab, icon: User,   label: "Profil"  },
  ];

  return (
    <div className="flex flex-col h-[100dvh] text-white relative font-sans overflow-hidden select-none" style={{ background: "#080c14" }}>
      {/* QR Scanner Overlay */}
      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute inset-0 z-50 flex flex-col" style={{ background: "#080c14" }}
          >
            <div className="p-6 flex justify-between items-center z-10 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)" }}>
              <h2 className="text-white font-bold text-lg tracking-tight">Scanner le Pass</h2>
              <button type="button" aria-label="Fermer" onClick={() => setIsScanning(false)}
                className="p-2.5 rounded-full transition active:scale-95"
                style={{ background: "rgba(255,255,255,0.08)" }}>
                <X size={20} className="text-white" />
              </button>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
              <div className="absolute inset-0 dot-grid-dark opacity-20" />
              <div className="w-72 h-72 rounded-[40px] relative mb-12 flex items-center justify-center overflow-hidden"
                   style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
                {["top-0 left-0 border-t-4 border-l-4 rounded-tl-[40px]", "top-0 right-0 border-t-4 border-r-4 rounded-tr-[40px]", "bottom-0 left-0 border-b-4 border-l-4 rounded-bl-[40px]", "bottom-0 right-0 border-b-4 border-r-4 rounded-br-[40px]"].map(cls => (
                  <div key={cls} className={`absolute w-12 h-12 border-primary ${cls}`} />
                ))}
                <motion.div
                  animate={{ y: ["-100%", "300%"] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                  className="absolute w-full h-10 bg-gradient-to-b from-transparent via-primary/25 to-transparent"
                />
                <QrCode size={80} strokeWidth={1.5} style={{ color: "rgba(255,255,255,0.2)" }} />
              </div>
              <div className="text-center z-10 max-w-xs">
                <h3 className="text-2xl font-extrabold mb-3 tracking-tight text-white">
                  {scanStatus === "success" ? "Vérifié !" : "Prêt à Scanner"}
                </h3>
                <p className={scanStatus === "success" ? "text-green-400 text-base font-bold" : "text-base font-medium"} style={scanStatus !== "success" ? { color: "rgba(255,255,255,0.45)" } : {}}>
                  {scanStatus === "success" ? "Passager enregistré. Continuation..." : "Alignez le QR du passager dans le cadre."}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* System Status Bar */}
      <div
        className="flex justify-between items-center px-5 py-3 text-[11px] font-mono tracking-widest shrink-0 z-20"
        style={{ background: "#080c14", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-3">
          {/* Mini logo */}
          <div className="w-6 h-6 rounded-lg overflow-hidden gradient-primary flex items-center justify-center">
            <Image src="/logo.png" alt="TF" width={16} height={16} unoptimized className="object-contain" />
          </div>
          <button
            type="button"
            onClick={() => setIsOnline(v => !v)}
            aria-label={isOnline ? "Passer hors ligne" : "Passer en ligne"}
            className="flex items-center gap-1.5 px-2 py-1 rounded-full transition active:scale-95"
            style={{
              color: isOnline ? "#22c55e" : "rgba(255,255,255,0.4)",
              background: isOnline ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.06)",
              border: `1px solid ${isOnline ? "rgba(34,197,94,0.25)" : "rgba(255,255,255,0.1)"}`,
            }}
          >
            <Power size={11} className={isOnline ? "animate-pulse" : ""} />
            {isOnline ? "EN LIGNE" : "HORS LIGNE"}
          </button>
          <span style={{ color: "rgba(255,255,255,0.35)" }}>RT-402</span>
        </div>
        <div className="flex items-center gap-4" style={{ color: "rgba(255,255,255,0.45)" }}>
          <span className="flex items-center gap-1.5"><Clock size={11} /> 15:45</span>
          <span className="flex items-center gap-1.5"><Battery size={11} /> 92%</span>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 flex flex-col relative overflow-hidden" style={{ background: "#080c14" }}>
        <AnimatePresence mode="wait">
          {activeTab === "map" && (
            <motion.div key="map" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.3 }} className="absolute inset-0 flex flex-col">
              {/* Dashboard Metrics */}
              <div className="p-5 grid grid-cols-2 gap-3 shrink-0 z-10 relative">
                <div className="rounded-3xl p-5 flex flex-col justify-between aspect-square"
                     style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)" }}>
                  <span className="uppercase tracking-widest text-[10px] font-bold" style={{ color: "rgba(255,255,255,0.4)" }}>Prochaine Station</span>
                  <div>
                    <span className="text-4xl font-extrabold tracking-tighter line-clamp-1 pb-1 text-white">Hydra</span>
                    <span className="text-primary font-bold text-sm">5 min</span>
                  </div>
                </div>
                <div className="rounded-3xl p-5 flex flex-col justify-between aspect-square"
                     style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)" }}>
                  <span className="uppercase tracking-widest text-[10px] font-bold" style={{ color: "rgba(255,255,255,0.4)" }}>Vitesse</span>
                  <div>
                    <span className="text-5xl font-extrabold tracking-tighter text-white">42</span>
                    <span className="font-bold text-sm" style={{ color: "rgba(255,255,255,0.5)" }}> km/h</span>
                  </div>
                </div>
              </div>

              {/* Turn-by-turn */}
              <div className="px-5 relative z-10 -mt-1">
                <div className="rounded-3xl p-5 flex items-center gap-4"
                     style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 10px_40px rgba(0,0,0,0.4)" }}>
                  <div className="bg-primary/15 p-3 rounded-2xl shrink-0" style={{ border: "1px solid rgba(229,57,53,0.2)" }}>
                    <ArrowUpRight size={26} className="text-primary" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold tracking-tight text-white mb-0.5">
                      {routeState !== "detour" ? "200m" : "50m"}
                    </h3>
                    <p className="font-medium text-sm leading-tight" style={{ color: "rgba(255,255,255,0.5)" }}>
                      {routeState !== "detour" ? "Tournez à droite sur Rue Didouche Mourad" : "Prenez la sortie vers le Tunnel d'Alger"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Traffic Alert */}
              <AnimatePresence>
                {routeState === "traffic" && (
                  <div className="absolute top-52 left-0 w-full px-6 z-20 pointer-events-none translate-y-6">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ delay: 0.5 }}
                      className="bg-[#FCF7D3]/95 backdrop-blur-xl border border-[#F6EAA2] rounded-[32px] p-5 flex gap-4 pointer-events-auto shadow-[0_15px_40px_rgba(230,180,40,0.2)]"
                    >
                      <div className="bg-[#FDF08A] w-12 h-12 rounded-full flex items-center justify-center shrink-0">
                        <AlertCircle size={22} className="text-[#A47715]" strokeWidth={2} />
                      </div>
                      <div className="flex-1 pt-0.5">
                        <p className="text-[17px] font-bold text-[#A26C08] mb-1.5 leading-tight">Trafic Intense Détecté</p>
                        <p className="text-[15px] text-[#A68832] mb-4 leading-snug font-medium">Accident sur la route habituelle. Détour disponible.</p>
                        <div className="flex flex-wrap gap-2.5">
                          <button type="button" onClick={() => setRouteState("detour")} className="bg-[#EAB11A] text-[#201500] text-[15px] font-bold px-5 py-3 rounded-[16px] active:scale-95 transition flex items-center gap-2 shadow-sm hover:bg-[#DFA110]">
                            <Signpost size={20} strokeWidth={2.5} /> Accepter le Détour
                          </button>
                          <button type="button" onClick={() => setRouteState("dismissed")} className="bg-[#FCF175] text-[#8F6A10] text-[14px] font-bold px-6 py-3 rounded-[16px] active:scale-95 transition">
                            Refuser
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* Radar */}
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
                <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(circle at center, #000 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
                <div className="relative w-80 h-80 flex items-center justify-center translate-y-16">
                  {[0, 10, 20].map(inset => (
                    <div key={inset} className="absolute border border-gray-200 rounded-full" style={{ inset }} />
                  ))}
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-full border-r-2 border-r-primary" style={{ background: "conic-gradient(from 0deg, transparent 70%, rgba(229, 57, 53, 0.05) 100%)" }} />
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 320 320">
                    {routeState !== "detour" ? (
                      <>
                        <path d="M 160 160 L 180 133" stroke="#22c55e" strokeWidth="6" strokeLinecap="round" className="opacity-80" />
                        <path d="M 180 133 L 200 106" stroke="#fbbf24" strokeWidth="6" strokeLinecap="round" className="opacity-80" strokeDasharray="4 4" />
                        <path d="M 200 106 L 220 80" stroke="#e53935" strokeWidth="6" strokeLinecap="round" strokeDasharray="6 4" />
                      </>
                    ) : (
                      <>
                        <path d="M 160 160 L 195 140" stroke="#e53935" strokeWidth="6" strokeLinecap="round" className="opacity-30" strokeDasharray="6 4" />
                        <path d="M 195 140 L 220 80" stroke="#22c55e" strokeWidth="6" strokeLinecap="round" className="opacity-80" />
                      </>
                    )}
                  </svg>
                  <div className="absolute w-4 h-4 bg-primary rounded-full translate-x-[60px] -translate-y-[80px] shadow-[0_0_20px_rgba(229,57,53,0.5)]">
                    <div className="absolute inset-[-12px] border-2 border-primary/30 rounded-full animate-ping" />
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold tracking-widest uppercase bg-primary text-white px-2 py-0.5 rounded-[10px] shadow-lg">Hydra</div>
                  </div>
                  <div className="relative z-10 w-16 h-16 bg-white border border-gray-100 rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
                    <Navigation size={28} className="text-primary fill-primary -rotate-45" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "passengers" && (
            <motion.div key="passengers" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.3 }} className="absolute inset-0 flex flex-col p-5 pb-40 overflow-y-auto dark-scrollbar z-10" style={{ background: "#080c14" }}>
              <div className="flex items-end justify-between mb-7 pt-1">
                <div>
                  <h2 className="text-[32px] font-extrabold tracking-tight text-white mb-1">Manifeste</h2>
                  <p className="text-primary font-bold tracking-wider text-[11px] uppercase">Arrêt Hydra &middot; {passengers.filter(p => !p.checked).length} en attente</p>
                </div>
                <button type="button" aria-label="Scanner le pass" onClick={() => { setScanStatus("idle"); setIsScanning(true); }}
                  className="w-14 h-14 gradient-primary text-white rounded-[20px] flex items-center justify-center active:scale-95 transition-all shadow-premium-red">
                  <QrCode size={24} strokeWidth={2.5} />
                </button>
              </div>
              <div className="flex flex-col gap-3">
                {passengers.map((p, i) => (
                  <div key={p.id} className="p-5 rounded-[22px] flex justify-between items-center transition"
                       style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${p.checked ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.08)"}` }}>
                    <div>
                      <h3 className="font-extrabold text-[16px] flex items-center gap-2 mb-1.5 text-white">
                        {p.name}
                        {p.checked && <CheckCircle size={16} className="text-green-400" strokeWidth={2.5} />}
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest font-bold" style={{ color: "rgba(255,255,255,0.38)" }}>
                        <span>{p.destination}</span>
                        <span className="w-1 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.2)" }} />
                        <span className={p.paymentMethod === "Entreprise" ? "text-primary" : "text-white/50"}>{p.paymentMethod} — {p.fare}</span>
                      </div>
                    </div>
                    {!p.checked ? (
                      <button type="button" onClick={() => handleManualBoarding(i)}
                        className="px-5 py-2.5 rounded-[14px] font-bold text-xs tracking-widest uppercase active:scale-95 transition"
                        style={{ background: "rgba(229,57,53,0.12)", color: "#e53935", border: "1px solid rgba(229,57,53,0.2)" }}>
                        Bord
                      </button>
                    ) : (
                      <div className="px-5 py-2.5 rounded-[14px] font-bold text-xs uppercase tracking-widest"
                           style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }}>
                        OK ✓
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "trips" && (
            <motion.div key="trips" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.3 }}>
              <TripsTab />
            </motion.div>
          )}

          {activeTab === "profile" && (
            <motion.div key="profile" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.3 }} className="absolute inset-0 flex flex-col p-5 pb-40 overflow-y-auto dark-scrollbar z-10" style={{ background: "#080c14" }}>
              <h2 className="text-[32px] font-extrabold tracking-tight text-white mb-6 pt-1">Profil</h2>

              <div className="flex flex-col items-center mb-8">
                <div className="relative mb-4">
                  <div className="w-28 h-28 rounded-full overflow-hidden flex items-center justify-center" style={{ border: "3px solid rgba(229,57,53,0.4)", boxShadow: "0 0 30px rgba(229,57,53,0.2)" }}>
                    {profileImg ? (
                      <Image src={profileImg} alt={`Photo de ${initialDriverProfile.name}`} width={112} height={112} sizes="112px" className="w-full h-full object-cover" unoptimized={profileImg.startsWith("data:")} priority />
                    ) : (
                      <User size={40} className="text-gray-400" />
                    )}
                  </div>
                  <button type="button" aria-label="Changer la photo" onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full border-[3px] border-white shadow-md active:scale-95 transition-transform">
                    <Camera size={16} />
                  </button>
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={e => {
                    if (e.target.files?.[0]) {
                      const reader = new FileReader();
                      reader.onload = ev => { if (typeof ev.target?.result === "string") setProfileImg(ev.target.result); };
                      reader.readAsDataURL(e.target.files[0]);
                    }
                  }} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{initialDriverProfile.name}</h3>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <Star size={14} className="fill-badge text-badge" />
                  <span className="font-bold text-sm text-white">{initialDriverProfile.rating}</span>
                  <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>({initialDriverProfile.rides} trajets)</span>
                </div>
              </div>

              <div className="rounded-[24px] p-5 mb-4" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-extrabold text-xs tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>Bio</h4>
                  <Edit2 size={16} style={{ color: "rgba(255,255,255,0.3)" }} />
                </div>
                <textarea value={bio} onChange={e => setBio(e.target.value)}
                  className="w-full bg-transparent border-none outline-none resize-none font-medium dark-scrollbar text-white"
                  style={{ caretColor: "#e53935" }} rows={3} placeholder="Parlez de vous..." />
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { icon: CheckCircle, color: "#22c55e", label: "Acceptation", val: "98%", sub: "Excellent" },
                  { icon: XCircle,     color: "#f87171", label: "Annulation",  val: "2%",  sub: "Très bon"  },
                ].map(m => (
                  <div key={m.label} className="rounded-[22px] p-5 flex flex-col justify-between"
                       style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="flex items-center gap-2 mb-3">
                      <m.icon size={15} style={{ color: m.color }} />
                      <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>{m.label}</span>
                    </div>
                    <div>
                      <span className="text-3xl font-extrabold text-white">{m.val}</span>
                      <p className="text-[11px] font-medium mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>{m.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-[24px] overflow-hidden" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)" }}>
                  <div className="bg-primary/15 p-2 rounded-xl" style={{ border: "1px solid rgba(229,57,53,0.15)" }}><Car size={18} className="text-primary" /></div>
                  <h4 className="font-extrabold text-white">Véhicule</h4>
                </div>
                <div className="p-5 flex flex-col gap-4">
                  {[
                    { label: "Marque & Modèle", val: vehicleMake, set: setVehicleMake, colSpan: 2 },
                    { label: "Année",           val: vehicleYear, set: setVehicleYear, colSpan: 1 },
                    { label: "Plaque",          val: licensePlate, set: setLicensePlate, colSpan: 1, upper: true },
                  ].map(f => (
                    <div key={f.label}>
                      <label className="text-[10px] font-bold tracking-widest uppercase mb-1.5 block" style={{ color: "rgba(255,255,255,0.35)" }}>{f.label}</label>
                      <input type="text" value={f.val} onChange={e => f.set(e.target.value)}
                        className={`w-full bg-transparent pb-1.5 outline-none text-white font-bold transition ${f.upper ? "uppercase" : ""}`}
                        style={{ borderBottom: "1px solid rgba(255,255,255,0.12)", caretColor: "#e53935" }} />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Navigation */}
        <div className="absolute bottom-0 left-0 w-full z-30 pointer-events-none">
          <div
            className="pt-20 pb-6 px-4 pointer-events-auto"
            style={{ background: "linear-gradient(to top, #080c14 55%, transparent)" }}
          >
            {/* Capacity Bar */}
            <div className="mb-4 px-1">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold uppercase tracking-[1.5px]" style={{ color: "rgba(255,255,255,0.45)" }}>
                  Capacité: {occupiedCount}/{VEHICLE_CAPACITY}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-primary">
                  {VEHICLE_CAPACITY - occupiedCount} places libres
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, #e53935, #ff6659)", boxShadow: "0 0 8px rgba(229,57,53,0.6)" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(occupiedCount / VEHICLE_CAPACITY) * 100}%` }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Tab Bar */}
            <div
              className="flex gap-1 p-1.5 rounded-[26px]"
              style={{
                background: "rgba(13,20,34,0.92)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset",
              }}
            >
              {navItems.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className="flex-1 h-14 rounded-[20px] font-bold flex items-center justify-center gap-1.5 transition-all outline-none text-[12px] relative"
                  style={{
                    background: activeTab === item.id ? "rgba(229,57,53,0.15)" : "transparent",
                    color: activeTab === item.id ? "#e53935" : "rgba(255,255,255,0.35)",
                    border: activeTab === item.id ? "1px solid rgba(229,57,53,0.25)" : "1px solid transparent",
                    boxShadow: activeTab === item.id ? "0 0 16px rgba(229,57,53,0.2)" : "none",
                  }}
                >
                  <item.icon size={16} />
                  <span className={activeTab === item.id ? "font-extrabold" : "font-semibold"}>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-extrabold gradient-primary text-white"
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
