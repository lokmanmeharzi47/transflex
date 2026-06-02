"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, ListOrdered, Wallet, User } from "lucide-react";

const NAV = [
  { id: "home",    label: "Accueil",    icon: Home,        href: "/passenger/search"  },
  { id: "trips",   label: "Trajets",    icon: ListOrdered, href: "/passenger/trips"   },
  { id: "wallet",  label: "Wallet",     icon: Wallet,      href: "/passenger/wallet"  },
  { id: "profile", label: "Profil",     icon: User,        href: "/passenger/profile" },
];

/** Pages where the nav should be hidden (onboarding / auth flow). */
const HIDE_NAV = ["/passenger", "/passenger/"];

export default function PassengerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();

  const hideNav  = HIDE_NAV.includes(pathname);

  /** Resolve which tab is "active" from the current path. */
  const activeId = (() => {
    if (pathname.startsWith("/passenger/search")   || pathname.startsWith("/passenger/route") || pathname.startsWith("/passenger/tracking")) return "home";
    if (pathname.startsWith("/passenger/trips"))   return "trips";
    if (pathname.startsWith("/passenger/wallet"))  return "wallet";
    if (pathname.startsWith("/passenger/profile")) return "profile";
    return "";
  })();

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(145deg, #0a0c12 0%, #080c14 40%, #0c0a10 100%)" }}
    >
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[480px] h-[480px] rounded-full opacity-25"
             style={{ background: "radial-gradient(circle, rgba(229,57,53,0.3) 0%, transparent 65%)" }} />
        <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full opacity-15"
             style={{ background: "radial-gradient(circle, rgba(255,242,52,0.25) 0%, transparent 70%)" }} />
        <div className="absolute inset-0 dot-grid-dark opacity-20" />
      </div>

      {/* Phone frame */}
      <div
        className="w-full max-w-md h-[100dvh] sm:h-[880px] sm:rounded-[44px] overflow-hidden bg-background relative flex flex-col"
        style={{ boxShadow: "0 40px 100px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.06)" }}
      >
        {/* Status bar */}
        <div
          className="hidden sm:flex justify-between items-center px-8 py-2.5 text-[11px] font-semibold bg-background z-50 absolute top-0 w-full rounded-t-[44px]"
          style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}
        >
          <span className="text-text-main font-bold">9:41</span>
          <div className="absolute left-1/2 -translate-x-1/2 top-2 w-28 h-6 rounded-full" style={{ background: "#111111" }} />
          <div className="flex items-center gap-1.5 text-text-main font-bold">
            <span>5G</span>
            <span>100%</span>
          </div>
        </div>

        {/* Scrollable content — shrinks to leave room for nav */}
        <div className={`flex-1 overflow-y-auto sm:pt-11 custom-scrollbar ${!hideNav ? "pb-20" : ""}`}>
          {children}
        </div>

        {/* ── Bottom Navigation ── */}
        {!hideNav && (
          <div
            className="absolute bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-2"
            style={{
              background: "rgba(255,255,255,0.96)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              borderTop: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <div className="flex items-center justify-around">
              {NAV.map(({ id, label, icon: Icon, href }) => {
                const active = activeId === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => router.push(href)}
                    className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-2xl transition-all relative"
                    style={{ minWidth: 60 }}
                    aria-label={label}
                    aria-current={active ? "page" : undefined}
                  >
                    {/* Active indicator pill */}
                    {active && (
                      <span
                        className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full"
                        style={{ background: "linear-gradient(90deg, #e53935, #b71c1c)" }}
                      />
                    )}

                    {/* Icon */}
                    <div
                      className="w-10 h-10 rounded-[14px] flex items-center justify-center transition-all"
                      style={{
                        background: active ? "rgba(229,57,53,0.10)" : "transparent",
                      }}
                    >
                      <Icon
                        size={22}
                        strokeWidth={active ? 2.2 : 1.8}
                        style={{ color: active ? "#e53935" : "#999999" }}
                      />
                    </div>

                    {/* Label */}
                    <span
                      className="text-[10px] font-extrabold tracking-wide transition-colors"
                      style={{ color: active ? "#e53935" : "#aaaaaa" }}
                    >
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
