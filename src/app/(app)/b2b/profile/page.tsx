"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import {
  User, Building2, IdCard, Briefcase, Phone, BadgeCheck,
  ChevronRight, LogOut, Bell, Shield, HelpCircle,
} from "lucide-react";
import { ROUTES } from "@/constants/app";
import { b2bEmployee, b2bPass } from "@/data/transflex-demo";

const INFO = [
  { icon: User,      label: "Nom",         value: b2bEmployee.name },
  { icon: Building2, label: "Entreprise",  value: b2bEmployee.company },
  { icon: IdCard,    label: "Matricule",   value: b2bEmployee.matricule },
  { icon: Briefcase, label: "Département", value: b2bEmployee.department },
  { icon: Phone,     label: "Téléphone",   value: b2bEmployee.phone },
];

const PREFS = [
  { icon: Bell,       label: "Notifications", sub: "Alertes navette activées" },
  { icon: Shield,     label: "Confidentialité", sub: "Gérer vos données" },
  { icon: HelpCircle, label: "Aide & Support", sub: "Contact entreprise" },
];

export default function B2BProfile() {
  const router = useRouter();
  const [showLogout, setShowLogout] = useState(false);

  return (
    <div className="min-h-full bg-background pb-6 relative">
      {/* Hero */}
      <div className="relative overflow-hidden px-5 pt-8 pb-6" style={{ background: "linear-gradient(160deg, #e53935 0%, #b71c1c 100%)" }}>
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-15" style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }} />
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center shrink-0">
            <User size={28} className="text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-[22px] font-extrabold text-white leading-tight">{b2bEmployee.name}</h1>
            <div className="flex items-center gap-1.5 mt-1">
              <BadgeCheck size={13} className="text-white/80" />
              <span className="text-[12px] text-white/80 font-bold">{b2bEmployee.company} · {b2bEmployee.matricule}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enterprise pass mini */}
      <div className="px-5 -mt-4 relative z-10 mb-5">
        <div className="rounded-[18px] p-4 text-white flex items-center gap-3 shadow-lg" style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }}>
          <BadgeCheck size={22} />
          <div className="flex-1">
            <p className="font-extrabold text-[14px]">Pass {b2bPass.company} actif</p>
            <p className="text-[11px] opacity-90">{b2bPass.daysLeft} jours restants · exp. {b2bPass.expiresOn}</p>
          </div>
          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-white/25">ACTIF</span>
        </div>
      </div>

      {/* Info */}
      <div className="px-5 mb-5">
        <h2 className="text-[11px] font-extrabold uppercase tracking-widest text-text-secondary mb-2.5 px-1">Informations</h2>
        <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
          {INFO.map(item => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center gap-3 p-4">
                <div className="w-9 h-9 rounded-[12px] bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">{item.label}</p>
                  <p className="font-bold text-[14px] text-text-main truncate">{item.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Prefs */}
      <div className="px-5 mb-5">
        <h2 className="text-[11px] font-extrabold uppercase tracking-widest text-text-secondary mb-2.5 px-1">Préférences</h2>
        <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
          {PREFS.map(item => {
            const Icon = item.icon;
            return (
              <button key={item.label} type="button" className="w-full flex items-center gap-3 p-4 text-left">
                <div className="w-9 h-9 rounded-[12px] bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[14px] text-text-main">{item.label}</p>
                  <p className="text-[11px] text-text-secondary font-medium mt-0.5 truncate">{item.sub}</p>
                </div>
                <ChevronRight size={16} className="text-gray-300 shrink-0" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Logout */}
      <div className="px-5">
        <motion.button
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => setShowLogout(true)}
          className="w-full flex items-center justify-center gap-2.5 p-4 rounded-[20px] border-2 border-red-100 bg-red-50 font-extrabold text-primary text-[15px]"
        >
          <LogOut size={18} /> Se déconnecter
        </motion.button>
      </div>

      {/* Logout dialog */}
      <AnimatePresence>
        {showLogout && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-40" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
              onClick={() => setShowLogout(false)}
            />
            <motion.div
              key="dialog"
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="absolute left-5 right-5 z-50 bg-white rounded-[28px] p-6 shadow-2xl"
              style={{ top: "50%", transform: "translateY(-50%)" }}
            >
              <div className="w-14 h-14 rounded-full bg-red-50 border-2 border-red-100 flex items-center justify-center mx-auto mb-4">
                <LogOut size={22} className="text-primary" />
              </div>
              <h2 className="text-[20px] font-extrabold text-text-main text-center mb-2 tracking-tight">Se déconnecter ?</h2>
              <p className="text-text-secondary text-sm text-center mb-6 leading-relaxed">Vous quitterez l&apos;espace entreprise TransFlex.</p>
              <div className="flex flex-col gap-2.5">
                <motion.button whileTap={{ scale: 0.97 }} type="button" onClick={() => router.push(ROUTES.b2b)}
                  className="w-full gradient-primary text-white py-3.5 rounded-[18px] font-extrabold text-[15px] shadow-premium-red">
                  Confirmer
                </motion.button>
                <button type="button" onClick={() => setShowLogout(false)}
                  className="w-full py-3.5 rounded-[18px] font-bold text-[15px] text-text-secondary border border-gray-100">
                  Annuler
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
