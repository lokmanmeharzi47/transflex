"use client";

import dynamic from "next/dynamic";
import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import {
  MapPin, Search, Clock, ArrowRight, Zap, Navigation, ChevronDown,
  Users, Bus, TrendingUp, X,
} from "lucide-react";
import { ROUTES } from "@/constants/app";
import { recentSearches, nearbyBuses, activeRoutesNearby } from "@/data/transflex-demo";
import { PLACES } from "@/lib/places";
import type { Place } from "@/lib/places";

const LiveMap = dynamic(() => import("@/components/LiveMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full" style={{ background: "#0b1018" }} />
  ),
});

export default function SearchScreen() {
  const router = useRouter();
  const [from, setFrom]                   = useState("Tafourah");
  const [to, setTo]                       = useState("");
  const [toFocused, setToFocused]         = useState(false);
  const [fromFocused, setFromFocused]     = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const toInputRef = useRef<HTMLInputElement>(null);

  // Derive suggestions from "to" value
  const suggestions = useMemo(() => {
    if (to.length < 1) return [];
    const q = to.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    return PLACES.filter(p =>
      p.name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").includes(q) ||
      p.aliases.some(a => a.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").includes(q))
    ).slice(0, 6);
  }, [to]);

  const selectPlace = (place: Place) => {
    setTo(place.name);
    setShowSuggestions(false);
    toInputRef.current?.blur();
    openRoute(place.name);
  };

  const openRoute = (destination = to) => {
    if (!destination.trim()) return;
    router.push(`${ROUTES.passengerRoute}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(destination)}`);
  };

  const clearTo = () => { setTo(""); setShowSuggestions(false); toInputRef.current?.focus(); };

  const showMap = !toFocused && to.length === 0;

  // User location for the nearby map
  const userPlace = PLACES.find(p => p.name.toLowerCase() === from.toLowerCase()) ?? PLACES[0];

  return (
    <div className="flex flex-col min-h-full bg-background relative overflow-hidden">

      {/* Ambient background */}
      <div className="absolute top-0 right-0 w-52 h-52 rounded-full opacity-30 pointer-events-none"
           style={{ background: "radial-gradient(circle, rgba(229,57,53,0.14) 0%, transparent 70%)", transform: "translate(35%, -35%)" }} />

      <div className="relative z-10 flex flex-col">

        {/* ── Header ── */}
        <div className="px-6 pt-10 pb-4">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h1 className="text-[30px] font-extrabold text-text-main tracking-tight leading-none">Où allez-vous ?</h1>
              <p className="text-sm text-text-secondary font-medium mt-1.5">Trouvez votre trajet intelligent</p>
            </div>
            <button
              type="button"
              className="w-10 h-10 rounded-2xl bg-white border border-gray-100 shadow-card flex items-center justify-center hover:shadow-md transition-all"
              aria-label="Filtres"
            >
              <Navigation size={18} className="text-primary" />
            </button>
          </div>
        </div>

        {/* ── Search Card ── */}
        <div className="px-5 mb-4">
          <div
            className="glass-card-light rounded-[26px] p-4 flex flex-col gap-3 relative"
            style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)" }}
          >
            {/* Vertical connector */}
            <div
              className="absolute left-[42px] top-[50px] bottom-[50px] w-0.5 rounded-full pointer-events-none"
              style={{ background: "linear-gradient(to bottom, rgba(255,242,52,0.8), rgba(229,57,53,0.8))" }}
            />

            {/* From */}
            <div className={`flex items-center gap-3.5 relative z-10 rounded-[14px] p-2 transition-all ${fromFocused ? "bg-primary/5" : ""}`}>
              <div className="w-8 h-8 rounded-full bg-badge flex items-center justify-center shrink-0 shadow-sm border-2 border-white">
                <div className="w-2.5 h-2.5 bg-black rounded-full" />
              </div>
              <div className="flex-1">
                <p className="text-[9px] font-extrabold text-text-secondary uppercase tracking-[1.5px] mb-0.5">Départ</p>
                <label htmlFor="route-origin" className="sr-only">Origine</label>
                <input
                  id="route-origin"
                  type="text"
                  value={from}
                  onChange={e => setFrom(e.target.value)}
                  onFocus={() => setFromFocused(true)}
                  onBlur={() => setFromFocused(false)}
                  className="w-full bg-transparent outline-none font-bold text-[15px] text-text-main placeholder-gray-400"
                  placeholder="Votre position"
                />
              </div>
              <ChevronDown size={16} className="text-gray-300 shrink-0" />
            </div>

            <div className="h-px mx-2 bg-gray-100" />

            {/* To */}
            <div className={`flex items-center gap-3.5 relative z-10 rounded-[14px] p-2 transition-all ${toFocused ? "bg-primary/5" : ""}`}>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-sm border-2 border-white">
                <MapPin size={13} className="text-white" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <p className="text-[9px] font-extrabold text-text-secondary uppercase tracking-[1.5px] mb-0.5">Destination</p>
                <label htmlFor="route-destination" className="sr-only">Destination</label>
                <input
                  id="route-destination"
                  ref={toInputRef}
                  type="text"
                  value={to}
                  onChange={e => {
                    const val = e.target.value;
                    setTo(val);
                    if (val.length < 1) {
                      setShowSuggestions(false);
                    } else {
                      const q = val.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
                      const hasHits = PLACES.some(p =>
                        p.name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").includes(q) ||
                        p.aliases.some(a => a.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").includes(q))
                      );
                      setShowSuggestions(hasHits);
                    }
                  }}
                  onFocus={() => setToFocused(true)}
                  onBlur={() => setTimeout(() => setToFocused(false), 180)}
                  className="w-full bg-transparent outline-none font-bold text-[15px] text-text-main placeholder-gray-400"
                  placeholder="Où allons-nous ?"
                  autoComplete="off"
                />
              </div>
              {to.length > 0 && (
                <button type="button" onClick={clearTo} className="p-1 rounded-full hover:bg-gray-100 transition-colors" aria-label="Effacer">
                  <X size={14} className="text-gray-400" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Autocomplete dropdown ── */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              className="px-5 mb-4 overflow-hidden"
            >
              <div className="bg-white rounded-[22px] border border-gray-100 overflow-hidden shadow-premium divide-y divide-gray-50">
                {suggestions.map(place => (
                  <button
                    key={place.id}
                    type="button"
                    onMouseDown={() => selectPlace(place)}
                    className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
                      <MapPin size={14} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-[14px] text-text-main">{place.name}</p>
                      <p className="text-[11px] text-text-secondary mt-0.5">Alger</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Search Button (when destination filled, no suggestions) ── */}
        <AnimatePresence>
          {to.length > 0 && !showSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="px-5 mb-5"
            >
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: 1.01 }}
                onClick={() => openRoute()}
                className="w-full gradient-primary text-white py-4 rounded-[22px] font-bold shadow-premium-red flex items-center justify-center gap-2.5 text-[16px]"
              >
                <Search size={20} aria-hidden="true" />
                Trouver un Trajet
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Live Nearby Map ── */}
        <AnimatePresence>
          {showMap && (
            <motion.div
              key="nearby-map"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.3 }}
              className="px-5 mb-5"
            >
              <div className="relative overflow-hidden rounded-[28px]" style={{ height: 220 }}>
                <LiveMap
                  route={null}
                  nearbyVehicles={nearbyBuses}
                  user={{ lat: userPlace.lat, lng: userPlace.lng }}
                  defaultCenter={[userPlace.lat, userPlace.lng]}
                  defaultZoom={14}
                  theme="dark"
                  interactive={false}
                  autoFit={false}
                />
                {/* Overlay label */}
                <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full flex items-center gap-2 pointer-events-none"
                     style={{ background: "rgba(13,20,34,.85)", border: "1px solid rgba(255,255,255,.1)", backdropFilter: "blur(12px)" }}>
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-white text-[11px] font-bold">{nearbyBuses.length} bus actifs près de vous</span>
                </div>
                {/* Bottom fade */}
                <div className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none"
                     style={{ background: "linear-gradient(to top, rgba(255,251,234,0.6), transparent)" }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Active Routes Near You ── */}
        <AnimatePresence>
          {showMap && (
            <motion.div
              key="active-routes"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="px-5 mb-5"
            >
              <div className="flex items-center justify-between mb-3 ml-1">
                <h3 className="font-extrabold text-[15px] text-text-main">Lignes actives près de vous</h3>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[11px] font-bold text-text-secondary">En direct</span>
                </div>
              </div>
              <div className="flex flex-col gap-2.5">
                {activeRoutesNearby.map((route, idx) => {
                  const occupancyPct = ((route.seatsTotal - route.seatsLeft) / route.seatsTotal) * 100;
                  const isFull = route.seatsLeft <= 2;
                  return (
                    <motion.button
                      key={route.id}
                      type="button"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.06 * idx }}
                      onClick={() => { setFrom(route.from); setTo(route.to); openRoute(route.to); }}
                      className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-[22px] hover:shadow-md transition-all shadow-card text-left group"
                    >
                      {/* Bus icon */}
                      <div className="w-12 h-12 rounded-[16px] gradient-primary flex items-center justify-center shrink-0 shadow-sm group-hover:shadow-premium-red transition-shadow">
                        <Bus size={20} className="text-white" />
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-extrabold text-[15px] text-text-main truncate">
                            {route.from} → {route.to}
                          </p>
                          {isFull && (
                            <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-red-50 text-primary border border-red-100 shrink-0">
                              PRESQUE PLEIN
                            </span>
                          )}
                        </div>
                        {/* Occupancy bar */}
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1.5">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${occupancyPct}%`,
                              background: isFull
                                ? "linear-gradient(90deg,#e53935,#b71c1c)"
                                : "linear-gradient(90deg,#22c55e,#15803d)",
                            }}
                          />
                        </div>
                        <div className="flex items-center gap-3 text-[11px] font-bold text-text-secondary">
                          <span className="flex items-center gap-1">
                            <Users size={10} /> {route.seatsLeft} places
                          </span>
                          <span className="text-primary font-extrabold">{route.price} DA</span>
                          <span className="flex items-center gap-1 text-green-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> En direct
                          </span>
                        </div>
                      </div>
                      {/* Go arrow */}
                      <div className="flex items-center shrink-0">
                        <ArrowRight size={16} className="text-gray-300 group-hover:text-primary transition-colors" />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Quick Destinations (shown when map hidden) ── */}
        <AnimatePresence>
          {!showMap && to.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-5 mb-5"
            >
              <h3 className="font-extrabold text-[13px] text-text-secondary uppercase tracking-[1.5px] mb-3 ml-1">
                Destinations populaires
              </h3>
              <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
                {[
                  { name: "Bab Ezzouar", label: "Populaire", time: "15 min", price: "300–450 DA", color: "#e53935" },
                  { name: "Hydra",       label: "Rapide",    time: "8 min",  price: "200–320 DA", color: "#22c55e" },
                  { name: "Kouba",       label: "Proche",    time: "5 min",  price: "150–250 DA", color: "#4d9fff" },
                ].map(dest => (
                  <button
                    key={dest.name}
                    type="button"
                    onClick={() => { setTo(dest.name); openRoute(dest.name); }}
                    className="flex-shrink-0 bg-white rounded-[18px] px-4 py-3 text-left border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all shadow-card"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ background: dest.color }} />
                      <span className="text-[9px] font-extrabold uppercase tracking-wider" style={{ color: dest.color }}>{dest.label}</span>
                    </div>
                    <p className="font-extrabold text-[14px] text-text-main whitespace-nowrap">{dest.name}</p>
                    <p className="text-[11px] text-text-secondary mt-0.5">{dest.time} · {dest.price}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Recent Searches ── */}
        <div className="px-5 pb-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-[18px] text-text-main">Recherches récentes</h3>
            <button type="button" className="text-xs font-bold text-primary">Tout effacer</button>
          </div>
          <div className="flex flex-col gap-2.5">
            {recentSearches.map(item => (
              <button
                key={`${item.from}-${item.to}`}
                type="button"
                onClick={() => { setFrom(item.from); setTo(item.to); openRoute(item.to); }}
                className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-[20px] hover:shadow-md transition-all shadow-card text-left group"
              >
                <div className="w-10 h-10 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 group-hover:bg-primary/8 group-hover:border-primary/15 transition-colors">
                  <Clock size={16} className="text-gray-400 group-hover:text-primary transition-colors" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[15px] text-text-main truncate">{item.to}</p>
                  <p className="text-xs text-text-secondary mt-0.5 font-medium">{item.from} · {item.timeLabel}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <TrendingUp size={12} className="text-green-500" />
                  <ArrowRight size={16} className="text-gray-300 group-hover:text-primary transition-colors" aria-hidden="true" />
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
