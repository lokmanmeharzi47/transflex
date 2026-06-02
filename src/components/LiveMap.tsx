"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import type { LatLng } from "@/lib/places";
import type { Route } from "@/lib/routing";
import { tripEngine, type TripState } from "@/lib/trip-engine";
import type { NearbyBus } from "@/types/transflex";

interface LiveMapProps {
  route: Route | null;
  showBus?: boolean;
  user?: LatLng | null;
  pickup?: LatLng | null;
  destination?: LatLng | null;
  nearbyVehicles?: NearbyBus[];
  /** Override map center (lat, lng) on init. */
  defaultCenter?: [number, number];
  defaultZoom?: number;
  theme?: "dark" | "light";
  interactive?: boolean;
  autoFit?: boolean;
  follow?: boolean;
  className?: string;
}

const TILES = {
  dark:  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  light: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
};

const ll = (p: LatLng): L.LatLngExpression => [p.lat, p.lng];

function pinIcon(color: string, glyph: string, size = 34) {
  return L.divIcon({
    className: "tf-pin-wrap",
    html: `<div class="tf-pin" style="--c:${color};width:${size}px;height:${size}px">${glyph}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
  });
}

const busIcon = () =>
  L.divIcon({
    className: "tf-bus-wrap",
    html: `<div class="tf-bus-glow"></div><div class="tf-bus-rotor"><div class="tf-bus-arrow"></div></div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });

const userIcon = () =>
  L.divIcon({
    className: "tf-user-wrap",
    html: `<div class="tf-user-pulse"></div><div class="tf-user-dot"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });

const pickupIcon = () =>
  L.divIcon({
    className: "tf-pickup-wrap",
    html: `<div class="tf-pickup-pulse"></div><div class="tf-pickup-pulse tf-delay"></div><div class="tf-pickup-core"></div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });

const nearbyBusIcon = (seatsLeft: number) =>
  L.divIcon({
    className: "tf-nearby-wrap",
    html: `<div class="tf-nearby-bus">
      <div class="tf-nearby-glow"></div>
      <div class="tf-nearby-body">
        <div class="tf-nearby-label">${seatsLeft}</div>
      </div>
    </div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });

export default function LiveMap({
  route,
  showBus = false,
  user = null,
  pickup = null,
  destination = null,
  nearbyVehicles,
  defaultCenter,
  defaultZoom = 13,
  theme = "dark",
  interactive = true,
  autoFit = true,
  follow = false,
  className = "",
}: LiveMapProps) {
  const elRef        = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<L.Map | null>(null);
  const routeLayer   = useRef<L.LayerGroup | null>(null);
  const markerLayer  = useRef<L.LayerGroup | null>(null);
  const nearbyLayer  = useRef<L.LayerGroup | null>(null);
  const busMarker    = useRef<L.Marker | null>(null);
  const fittedRef    = useRef(false);

  // ── init map ──
  useEffect(() => {
    if (!elRef.current || mapRef.current) return;

    const center: L.LatLngExpression = defaultCenter ?? [36.755, 3.064];

    const map = L.map(elRef.current, {
      zoomControl:       false,
      attributionControl: false,
      dragging:          interactive,
      scrollWheelZoom:   interactive,
      doubleClickZoom:   interactive,
      touchZoom:         interactive,
      zoomAnimation:     true,
      fadeAnimation:     true,
      preferCanvas:      false,
    }).setView(center, defaultZoom);

    L.tileLayer(TILES[theme], { maxZoom: 19, detectRetina: true }).addTo(map);
    if (interactive) L.control.zoom({ position: "bottomright" }).addTo(map);

    routeLayer.current  = L.layerGroup().addTo(map);
    markerLayer.current = L.layerGroup().addTo(map);
    nearbyLayer.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    requestAnimationFrame(() => map.invalidateSize());

    return () => {
      map.remove();
      mapRef.current    = null;
      routeLayer.current  = null;
      markerLayer.current = null;
      nearbyLayer.current = null;
      busMarker.current   = null;
      fittedRef.current   = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, interactive]);

  // ── draw route + static markers ──
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !routeLayer.current || !markerLayer.current) return;

    routeLayer.current.clearLayers();
    markerLayer.current.clearLayers();
    busMarker.current = null;

    if (route && route.path.length > 1) {
      const coords = route.path.map(ll);
      // dark casing
      L.polyline(coords, { color: "#000", weight: 12, opacity: 0.3, lineCap: "round", lineJoin: "round" }).addTo(routeLayer.current);
      // outer glow
      L.polyline(coords, { color: "#ff5b57", weight: 10, opacity: 0.28, className: "tf-route-glow", lineCap: "round", lineJoin: "round" }).addTo(routeLayer.current);
      // inner glow
      L.polyline(coords, { color: "#ff8a80", weight: 6, opacity: 0.2, lineCap: "round", lineJoin: "round" }).addTo(routeLayer.current);
      // animated core
      L.polyline(coords, { color: "#e53935", weight: 3.5, opacity: 1, className: "tf-route-core", lineCap: "round", lineJoin: "round" }).addTo(routeLayer.current);
    }

    if (destination) L.marker(ll(destination), { icon: pinIcon("#111111", "■") }).addTo(markerLayer.current);
    if (pickup)      L.marker(ll(pickup),      { icon: pickupIcon() }).addTo(markerLayer.current);
    if (user)        L.marker(ll(user),        { icon: userIcon()   }).addTo(markerLayer.current);

    if (autoFit && route && route.path.length > 1 && !fittedRef.current) {
      const bounds = L.latLngBounds(route.path.map(ll));
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 15 });
      fittedRef.current = true;
    }
  }, [route, user, pickup, destination, autoFit]);

  // reset fit flag when route identity changes
  useEffect(() => { fittedRef.current = false; }, [route]);

  // ── live bus animation ──
  useEffect(() => {
    if (!showBus) return;
    const map = mapRef.current;
    if (!map || !markerLayer.current) return;

    const place = (s: TripState) => {
      if (!s.bus || !markerLayer.current) return;
      if (!busMarker.current) {
        busMarker.current = L.marker(ll(s.bus), { icon: busIcon(), zIndexOffset: 1000 }).addTo(markerLayer.current);
      } else {
        busMarker.current.setLatLng(ll(s.bus));
      }
      const el    = busMarker.current.getElement();
      const rotor = el?.querySelector<HTMLElement>(".tf-bus-rotor");
      if (rotor) rotor.style.transform = `rotate(${s.heading}deg)`;
      if (follow) map.panTo(ll(s.bus), { animate: true, duration: 0.4 });
    };

    place(tripEngine.getSnapshot());
    const unsub = tripEngine.onFrame(place);
    return unsub;
  }, [showBus, follow]);

  // ── nearby vehicles with drift animation ──
  useEffect(() => {
    const layer = nearbyLayer.current;
    if (!layer || !nearbyVehicles?.length) return;

    layer.clearLayers();

    // Mutable positions that drift
    const positions = nearbyVehicles.map(v => ({ lat: v.lat, lng: v.lng }));
    const markers: L.Marker[] = [];

    nearbyVehicles.forEach((vehicle, i) => {
      const marker = L.marker([positions[i].lat, positions[i].lng], {
        icon: nearbyBusIcon(vehicle.seatsLeft),
        zIndexOffset: 600,
      }).addTo(layer);

      marker.bindTooltip(
        `<b>${vehicle.id}</b><br/>${vehicle.route}<br/><span style="color:#22c55e;font-weight:700">${vehicle.seatsLeft} places · ${vehicle.eta} min</span>`,
        { className: "tf-tooltip", direction: "top", offset: [0, -8] },
      );
      markers.push(marker);
    });

    // Gentle drift every 1.8 s
    const interval = setInterval(() => {
      nearbyVehicles.forEach((_, i) => {
        const heading = nearbyVehicles[i].heading * (Math.PI / 180);
        const speed   = 0.00008 + Math.random() * 0.00012;
        positions[i]  = {
          lat: positions[i].lat + Math.cos(heading) * speed,
          lng: positions[i].lng + Math.sin(heading) * speed,
        };
        markers[i]?.setLatLng([positions[i].lat, positions[i].lng]);
      });
    }, 1800);

    return () => {
      clearInterval(interval);
      layer.clearLayers();
    };
  }, [nearbyVehicles]);

  return (
    <>
      <style>{`
        /* Route line */
        .tf-route-glow { filter: blur(7px); }
        .tf-route-core { stroke-dasharray: 14 10; animation: tf-dash 1.2s linear infinite; }
        @keyframes tf-dash { to { stroke-dashoffset: -24; } }

        /* Main bus marker */
        .tf-pin { display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:700;
          background:var(--c);border:2.5px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);
          box-shadow:0 6px 16px rgba(0,0,0,.4); }
        .tf-pin > * { transform:rotate(45deg); }

        .tf-bus-wrap, .tf-user-wrap, .tf-pickup-wrap { position:relative; }
        .tf-bus-glow { position:absolute;inset:-8px;border-radius:50%;
          background:radial-gradient(circle,rgba(229,57,53,.6) 0%,transparent 70%);animation:tf-pulse 1.5s ease-out infinite; }
        .tf-bus-rotor { position:absolute;inset:0;display:flex;align-items:center;justify-content:center;transition:transform .25s linear; }
        .tf-bus-arrow { width:0;height:0;border-left:9px solid transparent;border-right:9px solid transparent;
          border-bottom:22px solid #fff;filter:drop-shadow(0 0 8px rgba(229,57,53,1));position:relative; }
        .tf-bus-arrow::after { content:"";position:absolute;left:-7px;top:7px;width:14px;height:14px;border-radius:50%;
          background:#e53935;box-shadow:0 0 12px #e53935; }

        /* User dot */
        .tf-user-dot { position:absolute;inset:4px;border-radius:50%;background:#4d9fff;border:2.5px solid #fff;
          box-shadow:0 0 10px rgba(77,159,255,.9); }
        .tf-user-pulse { position:absolute;inset:0;border-radius:50%;background:rgba(77,159,255,.35);animation:tf-pulse 2s ease-out infinite; }

        /* Pickup beacon */
        .tf-pickup-core { position:absolute;inset:8px;border-radius:50%;background:#fff234;border:2px solid #fff;
          box-shadow:0 0 12px rgba(255,242,52,.9); }
        .tf-pickup-pulse { position:absolute;inset:0;border-radius:50%;border:2.5px solid #fff234;animation:tf-ring 2s ease-out infinite; }
        .tf-pickup-pulse.tf-delay { animation-delay:1s; }

        /* Nearby vehicle markers */
        .tf-nearby-wrap { position:relative; }
        .tf-nearby-bus  { position:relative;width:34px;height:34px; }
        .tf-nearby-glow { position:absolute;inset:-5px;border-radius:50%;
          background:radial-gradient(circle,rgba(255,242,52,.35) 0%,transparent 70%);animation:tf-pulse 2.5s ease-out infinite; }
        .tf-nearby-body { position:absolute;inset:0;border-radius:50%;background:rgba(255,242,52,.92);border:2.5px solid #fff;
          display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(255,242,52,.5); }
        .tf-nearby-label { font-size:11px;font-weight:900;color:#111;line-height:1;font-family:sans-serif; }

        /* Tooltip */
        .tf-tooltip { background:#0d1422!important;color:#fff!important;border:1px solid rgba(255,255,255,.12)!important;
          border-radius:10px!important;font-size:12px!important;font-weight:600!important;padding:6px 10px!important;
          box-shadow:0 8px 24px rgba(0,0,0,.5)!important; }
        .tf-tooltip::before { border-top-color:#0d1422!important; }

        @keyframes tf-pulse { 0%{transform:scale(.8);opacity:.8} 100%{transform:scale(2.5);opacity:0} }
        @keyframes tf-ring   { 0%{transform:scale(.6);opacity:.9} 100%{transform:scale(2.8);opacity:0} }

        /* Zoom controls */
        .leaflet-control-zoom { border:none!important;box-shadow:0 8px 24px rgba(0,0,0,.4)!important;border-radius:14px!important;overflow:hidden; }
        .leaflet-control-zoom a { background:rgba(13,20,34,.92)!important;color:#fff!important;border:1px solid rgba(255,255,255,.08)!important;
          width:38px!important;height:38px!important;line-height:36px!important;font-size:20px!important; }
        .leaflet-control-zoom a:hover { background:rgba(229,57,53,.9)!important; }
      `}</style>
      <div ref={elRef} className={`w-full h-full ${className}`} role="application" aria-label="Carte en temps réel" />
    </>
  );
}
