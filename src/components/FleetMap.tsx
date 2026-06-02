"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import type { FleetVehicle } from "@/types/transflex";

interface FleetMapProps {
  vehicles: FleetVehicle[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const STATUS_COLOR: Record<string, string> = {
  active:      "#22c55e",
  delayed:     "#f59e0b",
  maintenance: "#4d9fff",
  offline:     "#64748b",
};

const TILE = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

function busIcon(v: FleetVehicle, selected: boolean) {
  const color = STATUS_COLOR[v.status] ?? "#64748b";
  const moving = v.speed > 0;
  return L.divIcon({
    className: "tf-fleet-wrap",
    html: `<div class="tf-fleet ${selected ? "tf-fleet-sel" : ""}" style="--fc:${color}">
      ${moving ? `<div class="tf-fleet-glow"></div>` : ""}
      <div class="tf-fleet-body">${v.id.replace("TF-", "")}</div>
    </div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });
}

export default function FleetMap({ vehicles, selectedId, onSelect }: FleetMapProps) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});

  // init
  useEffect(() => {
    if (!elRef.current || mapRef.current) return;
    const map = L.map(elRef.current, {
      zoomControl: false,
      attributionControl: false,
      zoomAnimation: true,
    }).setView([36.748, 3.08], 12);
    L.tileLayer(TILE, { maxZoom: 19, detectRetina: true }).addTo(map);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    requestAnimationFrame(() => map.invalidateSize());
    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
      markersRef.current = {};
    };
  }, []);

  // draw markers
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    layer.clearLayers();
    markersRef.current = {};

    const pts: L.LatLngExpression[] = [];
    vehicles.forEach(v => {
      if (v.lat == null || v.lng == null) return;
      const marker = L.marker([v.lat, v.lng], {
        icon: busIcon(v, v.id === selectedId),
        zIndexOffset: v.id === selectedId ? 1000 : 0,
      }).addTo(layer);
      marker.on("click", () => onSelect(v.id));
      marker.bindTooltip(
        `<b>${v.id}</b> · ${v.driver}<br/>${v.speed} km/h · ${v.passengers}/${v.capacity} pass.`,
        { className: "tf-tooltip", direction: "top", offset: [0, -14] },
      );
      markersRef.current[v.id] = marker;
      pts.push([v.lat, v.lng]);
    });

    if (pts.length && !selectedId) {
      mapRef.current?.fitBounds(L.latLngBounds(pts), { padding: [50, 50], maxZoom: 13 });
    }
  }, [vehicles, selectedId, onSelect]);

  // pan to selected
  useEffect(() => {
    if (!selectedId) return;
    const v = vehicles.find(x => x.id === selectedId);
    if (v?.lat != null && v?.lng != null) {
      mapRef.current?.panTo([v.lat, v.lng], { animate: true, duration: 0.5 });
    }
  }, [selectedId, vehicles]);

  return (
    <>
      <style>{`
        .tf-fleet-wrap { background: transparent; }
        .tf-fleet { position: relative; width: 38px; height: 38px; cursor: pointer; }
        .tf-fleet-glow { position: absolute; inset: -6px; border-radius: 50%;
          background: radial-gradient(circle, var(--fc) 0%, transparent 70%); opacity: .4;
          animation: tf-fleet-pulse 2s ease-out infinite; }
        .tf-fleet-body { position: absolute; inset: 0; border-radius: 12px; background: var(--fc);
          border: 2.5px solid #0b1120; display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 900; color: #0b1120; font-family: sans-serif;
          box-shadow: 0 4px 12px rgba(0,0,0,.5); transition: transform .2s; }
        .tf-fleet-sel .tf-fleet-body { transform: scale(1.2); border-color: #fff;
          box-shadow: 0 0 0 3px var(--fc), 0 6px 18px rgba(0,0,0,.6); }
        @keyframes tf-fleet-pulse { 0% { transform: scale(.7); opacity:.6 } 100% { transform: scale(2.2); opacity:0 } }
        .tf-tooltip { background:#111827!important;color:#fff!important;border:1px solid rgba(255,255,255,.12)!important;
          border-radius:10px!important;font-size:12px!important;font-weight:600!important;padding:6px 10px!important; }
        .tf-tooltip::before { border-top-color:#111827!important; }
        .leaflet-control-zoom { border:none!important;box-shadow:0 8px 24px rgba(0,0,0,.4)!important;border-radius:12px!important;overflow:hidden; }
        .leaflet-control-zoom a { background:rgba(17,24,39,.95)!important;color:#fff!important;border:1px solid rgba(255,255,255,.08)!important;
          width:34px!important;height:34px!important;line-height:32px!important;font-size:18px!important; }
        .leaflet-control-zoom a:hover { background:rgba(229,57,53,.9)!important; }
      `}</style>
      <div ref={elRef} className="w-full h-full" role="application" aria-label="Carte flotte en temps réel" />
    </>
  );
}
