"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { Map, Clock, ShieldCheck, ArrowRight, QrCode, Zap, Eye, EyeOff } from "lucide-react";
import { ROUTES } from "@/constants/app";
import { onboardingSteps } from "@/data/transflex-demo";
import type { OnboardingIconKey } from "@/types/transflex";

const onboardingIcons: Record<OnboardingIconKey, typeof Map> = {
  map: Map,
  clock: Clock,
  shield: ShieldCheck,
};

const onboardingColors = [
  { icon: "rgba(229,57,53,0.12)", ring: "#e53935", gradient: "from-red-50 to-orange-50" },
  { icon: "rgba(255,242,52,0.18)", ring: "#f59e0b", gradient: "from-yellow-50 to-amber-50" },
  { icon: "rgba(34,197,94,0.12)",  ring: "#22c55e", gradient: "from-green-50 to-emerald-50" },
];

export default function PassengerOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [showAuth, setShowAuth] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const nextStep = () => {
    if (step < onboardingSteps.length - 1) {
      setStep(s => s + 1);
      return;
    }
    setShowAuth(true);
  };

  const handleLogin = () => {
    router.push(ROUTES.passengerSearch);
  };

  const ActiveIcon = onboardingIcons[onboardingSteps[step].icon];
  const stepColor = onboardingColors[step];

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      <AnimatePresence mode="wait">

        {/* ── Onboarding ── */}
        {!showAuth ? (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 flex flex-col h-full"
          >
            {/* Skip */}
            <div className="flex justify-between items-center pt-6 px-6">
              <div className="w-8 h-8 rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                <Image src="/logo.png" alt="TransFlex" width={32} height={32} unoptimized className="object-contain" />
              </div>
              <button
                type="button"
                onClick={() => setShowAuth(true)}
                className="text-text-secondary font-bold text-sm hover:text-text-main transition-colors px-3 py-1.5 rounded-xl hover:bg-gray-100"
              >
                Passer
              </button>
            </div>

            {/* Illustration */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 pt-4">
              <motion.div
                key={`card-${step}`}
                initial={{ opacity: 0, scale: 0.88, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 240, damping: 22 }}
                className="relative w-full max-w-[300px] aspect-square rounded-[40px] mb-10 flex items-center justify-center overflow-hidden"
                style={{ background: `linear-gradient(145deg, ${stepColor.icon} 0%, rgba(255,255,255,0.7) 100%)`, border: "1px solid rgba(0,0,0,0.04)" }}
              >
                {/* Background decor */}
                <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full opacity-40"
                     style={{ background: `radial-gradient(circle, ${stepColor.ring}22 0%, transparent 70%)` }} />
                <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full opacity-30"
                     style={{ background: `radial-gradient(circle, rgba(255,242,52,0.25) 0%, transparent 70%)` }} />

                {/* Concentric rings */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 rounded-full border opacity-15" style={{ borderColor: stepColor.ring }} />
                  <div className="absolute w-36 h-36 rounded-full border opacity-20" style={{ borderColor: stepColor.ring }} />
                </div>

                {/* Icon */}
                <div className="relative z-10 p-8 rounded-full" style={{ background: `${stepColor.icon}`, boxShadow: `0 20px 40px ${stepColor.ring}20` }}>
                  <ActiveIcon size={72} strokeWidth={1.5} aria-hidden="true" style={{ color: stepColor.ring }} />
                </div>

                {/* Corner badge */}
                <div className="absolute bottom-5 right-5 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-white flex items-center gap-1.5">
                  <Zap size={11} style={{ color: stepColor.ring }} />
                  <span className="text-[10px] font-bold text-text-main">TransFlex</span>
                </div>
              </motion.div>

              {/* Text */}
              <div className="text-center w-full px-2">
                <motion.h2
                  key={`title-${step}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[28px] font-extrabold text-text-main mb-3 leading-tight tracking-tight"
                >
                  {onboardingSteps[step].title}
                </motion.h2>
                <motion.p
                  key={`desc-${step}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 }}
                  className="text-text-secondary text-[15px] leading-relaxed px-4"
                >
                  {onboardingSteps[step].description}
                </motion.p>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="px-6 pb-10 flex flex-col items-center gap-6">
              {/* Progress dots */}
              <div className="flex gap-2 items-center" aria-label="Onboarding progress">
                {onboardingSteps.map((item, idx) => (
                  <motion.div
                    key={item.title}
                    animate={{
                      width: idx === step ? 28 : 7,
                      opacity: idx === step ? 1 : 0.35,
                    }}
                    transition={{ duration: 0.3 }}
                    className="h-1.5 rounded-full bg-primary"
                  />
                ))}
              </div>

              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.01 }}
                onClick={nextStep}
                className="w-full gradient-primary text-white py-4 rounded-[22px] font-bold flex items-center justify-center gap-2.5 shadow-premium-red text-[17px]"
              >
                {step === onboardingSteps.length - 1 ? "Commencer" : "Continuer"}
                <ArrowRight size={20} aria-hidden="true" />
              </motion.button>
            </div>
          </motion.div>

        ) : (
          /* ── Auth ── */
          <motion.div
            key="auth"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 flex flex-col h-full relative overflow-hidden"
          >
            {/* Top gradient header */}
            <div
              className="absolute top-0 left-0 right-0 h-56 pointer-events-none"
              style={{
                background: "linear-gradient(180deg, rgba(229,57,53,0.08) 0%, transparent 100%)",
              }}
            />
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none opacity-25"
                 style={{ background: "radial-gradient(circle, rgba(255,242,52,0.4) 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />

            <div className="relative z-10 flex flex-col h-full p-6">
              {/* Header */}
              <div className="pt-8 mb-8">
                {/* Logo */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 280 }}
                  className="w-16 h-16 rounded-[20px] overflow-hidden shadow-premium-red mb-6 gradient-primary flex items-center justify-center"
                >
                  <Image
                    src="/logo.png"
                    alt="TransFlex"
                    width={48}
                    height={48}
                    unoptimized
                    className="object-contain"
                  />
                </motion.div>

                <h1 className="text-[34px] font-extrabold text-text-main leading-tight tracking-tight mb-2">
                  Bienvenue sur<br />
                  <span className="text-gradient-primary">TransFlex</span>
                </h1>
                <p className="text-text-secondary text-[16px]">
                  Connectez-vous pour réserver votre trajet.
                </p>
              </div>

              {/* Form */}
              <div className="flex flex-col gap-4 flex-1">
                <div className="space-y-1.5">
                  <label
                    htmlFor="passenger-login"
                    className="text-[11px] font-extrabold text-text-secondary uppercase tracking-[1.8px] ml-1"
                  >
                    Téléphone ou E-mail
                  </label>
                  <div className="relative">
                    <input
                      id="passenger-login"
                      type="text"
                      placeholder="ex. 0550 12 34 56"
                      defaultValue="0550 12 34 56"
                      className="w-full p-4 pr-12 rounded-[16px] bg-white border border-gray-200 text-text-main font-bold shadow-card outline-none transition-all focus:border-primary focus:shadow-[0_0_0_4px_rgba(229,57,53,0.08)] text-[15px]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="passenger-password"
                    className="text-[11px] font-extrabold text-text-secondary uppercase tracking-[1.8px] ml-1"
                  >
                    Mot de passe
                  </label>
                  <div className="relative">
                    <input
                      id="passenger-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      defaultValue="password"
                      className="w-full p-4 pr-12 rounded-[16px] bg-white border border-gray-200 text-text-main font-bold shadow-card outline-none transition-all focus:border-primary focus:shadow-[0_0_0_4px_rgba(229,57,53,0.08)] text-[15px]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-text-main transition-colors"
                      aria-label={showPassword ? "Masquer" : "Afficher"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between px-1">
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <input type="checkbox" defaultChecked className="sr-only peer" aria-label="Se souvenir de moi" />
                    <span className="w-5 h-5 rounded-md border-2 border-gray-200 flex items-center justify-center group-hover:border-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30 transition-colors">
                      <span className="w-2.5 h-2.5 rounded-[2px] bg-primary transition-opacity" />
                    </span>
                    <span className="text-sm font-semibold text-text-secondary">Se souvenir de moi</span>
                  </label>
                  <button type="button" className="text-sm font-bold text-primary hover:underline">
                    Oublié?
                  </button>
                </div>

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ scale: 1.005 }}
                  onClick={handleLogin}
                  className="w-full gradient-primary text-white py-4.5 rounded-[22px] font-bold shadow-premium-red text-[17px] mt-1 transition-all"
                >
                  Se connecter
                </motion.button>

                <p className="text-center text-text-secondary text-sm font-medium">
                  Pas encore de compte?{" "}
                  <button type="button" className="text-primary font-bold hover:underline">
                    Créer un compte
                  </button>
                </p>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-gray-100" />
                  <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-medium">ou</span>
                  <div className="flex-grow border-t border-gray-100" />
                </div>

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogin}
                  className="w-full bg-white text-text-main py-4 rounded-[22px] font-bold shadow-card border border-gray-150 flex items-center justify-center gap-3 text-[15px] hover:shadow-md transition-all"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    <path d="M1 1h22v22H1z" fill="none" />
                  </svg>
                  Continuer avec Google
                </motion.button>

                {/* QR Option */}
                <button
                  type="button"
                  onClick={handleLogin}
                  className="w-full flex items-center justify-center gap-2.5 text-text-secondary hover:text-text-main font-bold py-3 text-sm transition-colors"
                >
                  <QrCode size={16} />
                  Se connecter via QR Code
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
