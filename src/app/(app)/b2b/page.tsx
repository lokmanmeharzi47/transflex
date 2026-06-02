"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { Building2, KeyRound, Mail, IdCard, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { ROUTES } from "@/constants/app";
import { corporateAccounts } from "@/data/transflex-demo";

type Method = "code" | "magic" | "employee";

const METHODS: { id: Method; label: string; icon: typeof KeyRound; hint: string; placeholder: string; defaultValue: string }[] = [
  { id: "code",     label: "Code entreprise",   icon: KeyRound, hint: "Fourni par votre employeur", placeholder: "ENT-ENTERPRISE", defaultValue: "ENT-ENTERPRISE" },
  { id: "magic",    label: "Lien magique",      icon: Mail,     hint: "Recevez un lien par e-mail", placeholder: "prenom.nom@entreprise.dz", defaultValue: "y.belkacem@entreprise.dz" },
  { id: "employee", label: "Identifiant employé", icon: IdCard, hint: "Votre matricule entreprise", placeholder: "EMP-48217", defaultValue: "EMP-48217" },
];

export default function B2BAuth() {
  const router = useRouter();
  const [method, setMethod] = useState<Method>("code");
  const [value, setValue] = useState(METHODS[0].defaultValue);
  const [sent, setSent] = useState(false);

  const active = METHODS.find(m => m.id === method)!;

  const selectMethod = (m: Method) => {
    setMethod(m);
    setValue(METHODS.find(x => x.id === m)!.defaultValue);
    setSent(false);
  };

  const handleSubmit = () => {
    if (method === "magic") {
      setSent(true);
      setTimeout(() => router.push(ROUTES.b2bDashboard), 1100);
      return;
    }
    router.push(ROUTES.b2bDashboard);
  };

  return (
    <div className="flex flex-col h-full relative overflow-hidden" style={{ background: "#070b12" }}>
      {/* Ambient */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[420px] h-[420px] rounded-full opacity-30"
             style={{ background: "radial-gradient(circle, rgba(245,158,11,0.18) 0%, transparent 65%)" }} />
        <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full opacity-20"
             style={{ background: "radial-gradient(circle, rgba(229,57,53,0.22) 0%, transparent 70%)" }} />
        <div className="absolute inset-0 dot-grid-dark opacity-20" />
      </div>

      <div className="relative z-10 flex flex-col h-full p-6 pt-10">
        {/* Logo + heading */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-7">
            <div className="w-12 h-12 rounded-[16px] overflow-hidden gradient-primary flex items-center justify-center shadow-premium-red">
              <Image src="/logo.png" alt="TransFlex" width={32} height={32} unoptimized className="object-contain" />
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full"
                 style={{ color: "#f59e0b", background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)" }}>
              <Building2 size={11} /> ESPACE ENTREPRISE
            </div>
          </div>
          <h1 className="text-[32px] font-extrabold text-white leading-tight tracking-tight mb-2">
            Connexion<br /><span className="text-gradient-primary">Entreprise</span>
          </h1>
          <p className="text-[15px]" style={{ color: "rgba(255,255,255,0.5)" }}>
            Accédez à la navette financée par votre entreprise.
          </p>
        </motion.div>

        {/* Method selector */}
        <div className="flex gap-2 mb-6">
          {METHODS.map(m => {
            const sel = m.id === method;
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => selectMethod(m.id)}
                className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-[16px] transition-all"
                style={{
                  background: sel ? "rgba(229,57,53,0.12)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${sel ? "rgba(229,57,53,0.3)" : "rgba(255,255,255,0.08)"}`,
                }}
              >
                <Icon size={18} style={{ color: sel ? "#e53935" : "rgba(255,255,255,0.5)" }} />
                <span className="text-[10px] font-bold text-center leading-tight" style={{ color: sel ? "#fff" : "rgba(255,255,255,0.45)" }}>
                  {m.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Input */}
        <div className="space-y-1.5 mb-3">
          <label htmlFor="b2b-input" className="text-[11px] font-extrabold uppercase tracking-[1.8px] ml-1" style={{ color: "rgba(255,255,255,0.4)" }}>
            {active.label}
          </label>
          <input
            id="b2b-input"
            type="text"
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder={active.placeholder}
            className="w-full p-4 rounded-[16px] text-white font-bold outline-none transition-all text-[15px]"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", caretColor: "#e53935" }}
          />
          <p className="text-[12px] ml-1" style={{ color: "rgba(255,255,255,0.35)" }}>{active.hint}</p>
        </div>

        {/* Known codes hint */}
        {method === "code" && (
          <div className="flex flex-wrap gap-2 mb-4">
            {corporateAccounts.map(a => (
              <button
                key={a.code}
                type="button"
                onClick={() => setValue(a.code)}
                className="text-[11px] font-bold px-2.5 py-1.5 rounded-full transition active:scale-95"
                style={{ color: a.logoColor, background: `${a.logoColor}1a`, border: `1px solid ${a.logoColor}33` }}
              >
                {a.code}
              </button>
            ))}
          </div>
        )}

        <div className="flex-1" />

        {/* Submit */}
        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div
              key="sent"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 rounded-[18px] mb-3"
              style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)" }}
            >
              <ShieldCheck size={20} className="text-green-400 shrink-0" />
              <p className="text-sm font-bold text-green-400">Lien envoyé — connexion en cours…</p>
            </motion.div>
          ) : (
            <motion.button
              key="submit"
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              className="w-full gradient-primary text-white py-4 rounded-[22px] font-bold shadow-premium-red flex items-center justify-center gap-2.5 text-[16px] mb-3"
            >
              {method === "magic" ? "Envoyer le lien magique" : "Accéder à ma navette"}
              <ArrowRight size={20} />
            </motion.button>
          )}
        </AnimatePresence>

        <p className="text-center text-[12px] flex items-center justify-center gap-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>
          <Sparkles size={11} /> L&apos;entreprise paie · l&apos;employé ne paie jamais
        </p>
      </div>
    </div>
  );
}
