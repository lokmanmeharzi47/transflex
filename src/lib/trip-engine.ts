"use client";

// Client-side live trip engine. A single shared instance drives a bus along a
// REAL OSRM road route and advances a booking state machine, so the route and
// tracking screens stay in sync without a backend (demo realtime layer).

import { useSyncExternalStore } from "react";
import { findPlace, nearestOnPath, haversine, walkingMinutes, type Place, type LatLng } from "./places";
import { fetchRoute, positionAt, bearing, fractionAtWaypoint, type Route } from "./routing";

export type TripPhase =
  | "idle"
  | "searching"
  | "route_found"
  | "reserved"
  | "approaching"
  | "boarding"
  | "in_trip"
  | "completed";

export interface TripState {
  phase: TripPhase;
  from: Place | null;
  to: Place | null;
  route: Route | null;
  realRoute: boolean;
  /** Where the bus boards the passenger (a real point on the route). */
  pickup: LatLng | null;
  /** Walking distance (m) from the passenger to the pickup point. */
  walkMetres: number;
  walkMinutes: number;
  /** Live bus position + heading. */
  bus: LatLng | null;
  heading: number;
  /** 0..1 progress of the bus along the whole route. */
  progress: number;
  /** fraction of the route where the passenger boards. */
  pickupFraction: number;
  /** Remaining seconds to the next relevant event (boarding, then drop-off). */
  etaSeconds: number;
  seatsTotal: number;
  seatsTaken: number;
  fareDA: number;
}

// Demo timeline (ms) — keeps the whole journey watchable while ETA values stay
// realistic (derived from OSRM leg durations).
const APPROACH_MS = 42000;
const BOARDING_MS = 5000;
const TRIP_MS = 60000;

const SEATS_TOTAL = 15;

function emptyState(): TripState {
  return {
    phase: "idle",
    from: null,
    to: null,
    route: null,
    realRoute: false,
    pickup: null,
    walkMetres: 0,
    walkMinutes: 0,
    bus: null,
    heading: 0,
    progress: 0,
    pickupFraction: 0,
    etaSeconds: 0,
    seatsTotal: SEATS_TOTAL,
    seatsTaken: 9,
    fareDA: 300,
  };
}

type Listener = () => void;
type FrameListener = (s: TripState) => void;

class TripEngine {
  private state: TripState = emptyState();
  private listeners = new Set<Listener>();
  private frameListeners = new Set<FrameListener>();
  private raf = 0;
  private startTs = 0;
  private lastNotify = 0;
  private lastBus: LatLng | null = null;
  private abort: AbortController | null = null;

  getSnapshot = (): TripState => this.state;

  subscribe = (l: Listener): (() => void) => {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  };

  /** Map subscribes here for per-frame bus movement (imperative, no re-render). */
  onFrame = (l: FrameListener): (() => void) => {
    this.frameListeners.add(l);
    return () => this.frameListeners.delete(l);
  };

  private commit(patch: Partial<TripState>, force = false) {
    this.state = { ...this.state, ...patch };
    const now = typeof performance !== "undefined" ? performance.now() : Date.now();
    if (force || now - this.lastNotify > 240) {
      this.lastNotify = now;
      this.listeners.forEach(l => l());
    }
  }

  reset() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.abort?.abort();
    this.raf = 0;
    this.lastBus = null;
    this.state = emptyState();
    this.listeners.forEach(l => l());
  }

  /**
   * Resolve from/to to real coordinates, fetch the real road route through
   * (bus origin → pickup → destination) and begin the live simulation.
   */
  async startTrip(fromQuery: string, toQuery: string): Promise<void> {
    this.reset();
    const from = findPlace(fromQuery) ?? findPlace("tafourah")!;
    const to = findPlace(toQuery) ?? findPlace("bab-ezzouar")!;
    this.commit({ phase: "searching", from, to }, true);

    // Bus starts a few km "up the line" from the pickup so it visibly approaches.
    const dLat = from.lat - to.lat;
    const dLng = from.lng - to.lng;
    const norm = Math.hypot(dLat, dLng) || 1;
    const busOrigin: LatLng = {
      lat: from.lat + (dLat / norm) * 0.045,
      lng: from.lng + (dLng / norm) * 0.045,
    };

    this.abort = new AbortController();
    const route = await fetchRoute([busOrigin, from, to], this.abort.signal);

    const pickupFraction = fractionAtWaypoint(route, 1);
    const pickupPoint = positionAt(route, pickupFraction);
    // Walking distance from the requested origin to the actual road pickup.
    const near = nearestOnPath(route.path, from);
    const walkMetres = Math.round(haversine(from, near.point));

    // Dynamic fare: base + per-km of the passenger leg.
    const tripMetres = route.legs[1]?.distance ?? route.distance;
    const fareDA = Math.round((250 + (tripMetres / 1000) * 18) / 10) * 10;

    this.commit(
      {
        phase: "route_found",
        route,
        realRoute: route.real,
        pickup: pickupPoint,
        pickupFraction,
        walkMetres,
        walkMinutes: walkingMinutes(walkMetres),
        bus: route.path[0],
        heading: bearing(route.path[0], route.path[1] ?? route.path[0]),
        etaSeconds: route.legs[0]?.duration ?? 0,
        seatsTaken: 9,
        fareDA,
      },
      true,
    );
  }

  /** Passenger reserved a seat — start the bus moving toward the pickup. */
  confirmBooking() {
    if (!this.state.route) return;
    this.commit({ phase: "reserved", seatsTaken: this.state.seatsTaken + 1 }, true);
    this.startTs = (typeof performance !== "undefined" ? performance.now() : Date.now());
    this.commit({ phase: "approaching" }, true);
    this.tick();
  }

  private tick = () => {
    const { route, pickupFraction } = this.state;
    if (!route) return;
    const now = typeof performance !== "undefined" ? performance.now() : Date.now();
    const elapsed = now - this.startTs;

    let progress: number;
    let phase: TripPhase;
    let etaSeconds: number;

    const approachDur = route.legs[0]?.duration ?? 600;
    const tripDur = route.legs[1]?.duration ?? route.duration;

    if (elapsed < APPROACH_MS) {
      const t = elapsed / APPROACH_MS;
      progress = pickupFraction * t;
      phase = "approaching";
      etaSeconds = approachDur * (1 - t);
    } else if (elapsed < APPROACH_MS + BOARDING_MS) {
      progress = pickupFraction;
      phase = "boarding";
      etaSeconds = tripDur;
    } else if (elapsed < APPROACH_MS + BOARDING_MS + TRIP_MS) {
      const t = (elapsed - APPROACH_MS - BOARDING_MS) / TRIP_MS;
      progress = pickupFraction + (1 - pickupFraction) * t;
      phase = "in_trip";
      etaSeconds = tripDur * (1 - t);
    } else {
      progress = 1;
      phase = "completed";
      etaSeconds = 0;
    }

    const bus = positionAt(route, progress);
    const heading = this.lastBus ? bearing(this.lastBus, bus) : this.state.heading;
    this.lastBus = bus;

    const seatsTaken =
      phase === "boarding" || phase === "in_trip" || phase === "completed"
        ? Math.min(this.state.seatsTotal, 10)
        : this.state.seatsTaken;

    this.state = { ...this.state, phase, progress, bus, heading, etaSeconds, seatsTaken };
    this.frameListeners.forEach(l => l(this.state));

    const phaseChanged = phase !== this.snapshotPhase;
    this.snapshotPhase = phase;
    this.commit({}, phaseChanged);

    if (phase !== "completed") {
      this.raf = requestAnimationFrame(this.tick);
    } else {
      this.commit({}, true);
    }
  };

  private snapshotPhase: TripPhase = "idle";
}

export const tripEngine = new TripEngine();

const serverSnapshot = emptyState();

export function useTrip(): TripState {
  return useSyncExternalStore(
    tripEngine.subscribe,
    tripEngine.getSnapshot,
    () => serverSnapshot,
  );
}

export const PHASE_LABEL: Record<TripPhase, string> = {
  idle: "—",
  searching: "Recherche du meilleur trajet…",
  route_found: "Trajet trouvé",
  reserved: "Place réservée",
  approaching: "Le conducteur approche",
  boarding: "Embarquement en cours",
  in_trip: "En route vers la destination",
  completed: "Trajet terminé",
};
