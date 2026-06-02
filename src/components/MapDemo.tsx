"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import { ALGIERS_MAP_CENTER } from "@/constants/app";
import { mapLocations } from "@/data/transflex-demo";

const MARKER_SIZE = 28;

const customMarkerIcon = (color: string, label: string) =>
  new L.DivIcon({
    html: `<div style="background-color: ${color}; color: ${color === "#fff234" ? "black" : "white"}; width: ${MARKER_SIZE}px; height: ${MARKER_SIZE}px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2.5px solid white; font-weight: bold; font-size: 13px; font-family: sans-serif; transition: transform 0.3s; transform-origin: bottom center;" class="animate-bounce-in">${label}</div>`,
    className: "custom-marker-icon",
    iconSize: [MARKER_SIZE, MARKER_SIZE],
    iconAnchor: [MARKER_SIZE / 2, MARKER_SIZE],
  });

interface MapDemoProps {
  onProgress?: (step: number) => void;
}

export default function MapDemo({ onProgress }: MapDemoProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    if (!mapRef.current || leafletMap.current) {
      return;
    }

    leafletMap.current = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false,
      zoomAnimation: true,
      fadeAnimation: true,
      markerZoomAnimation: true,
    }).setView([ALGIERS_MAP_CENTER.lat, ALGIERS_MAP_CENTER.lng], ALGIERS_MAP_CENTER.zoom);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(leafletMap.current);

    window.requestAnimationFrame(() => {
      leafletMap.current?.invalidateSize();
    });

    mapLocations.forEach((location, index) => {
      const timer = window.setTimeout(() => {
        if (!leafletMap.current) {
          return;
        }

        const isDestination = index === mapLocations.length - 1;
        const marker = L.marker([location.lat, location.lng], {
          icon: customMarkerIcon(isDestination ? "#e53935" : "#111111", isDestination ? "D" : `${index + 1}`),
        });

        marker.addTo(leafletMap.current);
        onProgress?.(index);

        if (isDestination) {
          const routeLine = mapLocations.map((item) => [item.lat, item.lng] as L.LatLngExpression);

          polylineRef.current = L.polyline(routeLine, {
            color: "#e53935",
            weight: 5,
            opacity: 0.8,
            lineJoin: "round",
            lineCap: "round",
            className: "animated-polyline",
          }).addTo(leafletMap.current);

          leafletMap.current.flyToBounds(polylineRef.current.getBounds(), {
            padding: [40, 40],
            duration: 1.5,
            easeLinearity: 0.25,
          });

          onProgress?.(99);
        }
      }, index * 400 + 400);

      timersRef.current.push(timer);
    });

    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current = [];
      leafletMap.current?.remove();
      leafletMap.current = null;
      polylineRef.current = null;
    };
  }, [onProgress]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .animated-polyline {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: dash 2s ease-in-out forwards;
        }
        @keyframes dash {
          to {
            stroke-dashoffset: 0;
          }
        }
        .animate-bounce-in {
          animation: bounce-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
        }
        @keyframes bounce-in {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      ` }} />
      <div ref={mapRef} className="w-full h-full z-0 pointer-events-none" aria-label="Animated Algiers shared route map" role="application" />
    </>
  );
}
