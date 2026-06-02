"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, Bus, MapPin, CheckCircle2, XCircle, Loader2, Repeat } from "lucide-react";
import { ROUTES } from "@/constants/app";
import { b2bChangeOptions } from "@/data/transflex-demo";
import type { ChangeRequestKind, ChangeRequestOption } from "@/types/transflex";

const KIND_META: Record<ChangeRequestKind, { label: string; icon: typeof Clock }> = {
  schedule:  { label: "Autre horaire",       icon: Clock },
  bus:       { label: "Autre bus",           icon: Bus },
  departure: { label: "Autre point de montée", icon: MapPin },
};

type Decision = { status: "approved" | "refused"; option: ChangeRequestOption };

export default function B2BChange() {
  const router = useRouter();
  const [checking, setChecking] = useState<string | null>(null);
  const [decision, setDecision] = useState<Decision | null>(null);

  const request = (opt: ChangeRequestOption) => {
    setDecision(null);
    setChecking(opt.id);
    // Automatic decision — no admin validation. Checks capacity + company rules.
    setTimeout(() => {
      setChecking(null);
      setDecision({ status: opt.available ? "approved" : "refused", option: opt });
    }, 1100);
  };

  // Group options by kind for display.
  const kinds = Object.keys(KIND_META) as ChangeRequestKind[];

  return (
    <div className="min-h-full bg-background pb-6">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <button
          type="button"
          aria-label="Retour"
          onClick={() => router.push(ROUTES.b2bDashboard)}
          className="w-10 h-10 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center"
        >
          <ArrowLeft size={18} className="text-text-main" />
        </button>
        <div>
          <h1 className="text-[22px] font-extrabold text-text-main tracking-tight leading-tight">Demander un changement</h1>
          <p className="text-[12px] text-text-secondary">Parmi les trajets autorisés par votre entreprise</p>
        </div>
      </div>

      {/* Options grouped by kind */}
      <div className="px-5 flex flex-col gap-5">
        {kinds.map(kind => {
          const meta = KIND_META[kind];
          const opts = b2bChangeOptions.filter(o => o.kind === kind);
          if (!opts.length) return null;
          const KindIcon = meta.icon;
          return (
            <div key={kind}>
              <h2 className="text-[11px] font-extrabold uppercase tracking-widest text-text-secondary mb-2.5 px-1 flex items-center gap-2">
                <KindIcon size={13} className="text-primary" /> {meta.label}
              </h2>
              <div className="flex flex-col gap-2.5">
                {opts.map(opt => {
                  const isChecking = checking === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={isChecking}
                      onClick={() => request(opt)}
                      className="bg-white rounded-[18px] p-4 border border-gray-100 shadow-sm flex items-center gap-3 text-left active:scale-[0.99] transition-transform disabled:opacity-60"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[14px] text-text-main">{opt.label}</p>
                        <p className="text-[12px] text-text-secondary mt-0.5">{opt.detail}</p>
                      </div>
                      {isChecking ? (
                        <Loader2 size={18} className="text-primary animate-spin shrink-0" />
                      ) : (
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0"
                              style={{ color: "#e53935", background: "rgba(229,57,53,0.1)" }}>
                          Demander
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Decision dialog */}
      <AnimatePresence>
        {decision && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
              onClick={() => setDecision(null)}
            />
            <motion.div
              key="dialog"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed left-5 right-5 max-w-sm mx-auto z-50 bg-white rounded-[28px] p-6 shadow-2xl"
              style={{ top: "50%", transform: "translateY(-50%)" }}
            >
              {decision.status === "approved" ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={30} className="text-green-500" />
                  </div>
                  <p className="text-center text-[11px] font-extrabold uppercase tracking-widest text-green-600 mb-1">Statut · Approuvé</p>
                  <h2 className="text-[20px] font-extrabold text-text-main text-center mb-2">Changement confirmé</h2>
                  <p className="text-text-secondary text-sm text-center mb-6 leading-relaxed">
                    {decision.option.label} — place réservée automatiquement. Aucune validation administrateur requise.
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-red-50 border-2 border-red-100 flex items-center justify-center mx-auto mb-4">
                    <XCircle size={30} className="text-primary" />
                  </div>
                  <p className="text-center text-[11px] font-extrabold uppercase tracking-widest text-primary mb-1">Statut · Refusé</p>
                  <h2 className="text-[20px] font-extrabold text-text-main text-center mb-2">Aucune place disponible.</h2>
                  <p className="text-text-secondary text-sm text-center mb-6 leading-relaxed">
                    {decision.option.label} n&apos;est pas disponible (capacité ou règles entreprise). Essayez une autre option.
                  </p>
                </>
              )}

              <div className="flex flex-col gap-2.5">
                {decision.status === "approved" ? (
                  <button
                    type="button"
                    onClick={() => router.push(ROUTES.b2bDashboard)}
                    className="w-full gradient-primary text-white py-3.5 rounded-[18px] font-extrabold text-[15px] shadow-premium-red flex items-center justify-center gap-2"
                  >
                    <Repeat size={16} /> Voir ma route mise à jour
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setDecision(null)}
                  className="w-full py-3.5 rounded-[18px] font-bold text-[15px] text-text-secondary border border-gray-100"
                >
                  {decision.status === "approved" ? "Fermer" : "Choisir une autre option"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
