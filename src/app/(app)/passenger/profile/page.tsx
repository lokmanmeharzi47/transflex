"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  User, Phone, Mail, MapPin, Shield, Bell, HelpCircle,
  ChevronRight, LogOut, Star, CheckCircle2,
} from "lucide-react";

const STATS = [
  { label: "Trajets", value: "47" },
  { label: "Note",    value: "4.8★" },
  { label: "DA économisés", value: "12 400" },
];

const MENU = [
  {
    section: "Compte",
    items: [
      { icon: User,    label: "Informations personnelles", sub: "Nom, photo, date de naissance" },
      { icon: Phone,   label: "Téléphone",                 sub: "+213 699 *** ***" },
      { icon: Mail,    label: "Email",                      sub: "meharzilokman47@gmail.com" },
      { icon: MapPin,  label: "Adresse principale",         sub: "Tafourah, Alger" },
    ],
  },
  {
    section: "Préférences",
    items: [
      { icon: Bell,    label: "Notifications",              sub: "Alertes trajet activées" },
      { icon: Shield,  label: "Confidentialité",            sub: "Gérer vos données" },
      { icon: HelpCircle, label: "Aide & Support",          sub: "FAQ, contact, signalement" },
    ],
  },
];

export default function ProfileScreen() {
  const router = useRouter();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = () => {
    setShowLogoutDialog(false);
    router.push("/passenger");
  };

  return (
    <div className="min-h-full bg-background pb-6 relative">
      {/* Hero */}
      <div className="relative overflow-hidden px-5 pt-8 pb-6" style={{ background: "linear-gradient(160deg, #e53935 0%, #b71c1c 100%)" }}>
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-15" style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }} />

        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center shrink-0">
            <User size={28} className="text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-[22px] font-extrabold text-white leading-tight">Mehar Zilokman</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <CheckCircle2 size={13} className="text-white/70" />
              <span className="text-[12px] text-white/70 font-bold">Compte vérifié</span>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-white/20 px-2.5 py-1.5 rounded-full border border-white/30">
            <Star size={12} className="text-yellow-300 fill-yellow-300" />
            <span className="text-white font-extrabold text-[13px]">4.8</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {STATS.map(s => (
            <div key={s.label} className="bg-white/15 backdrop-blur-sm rounded-[16px] p-3 text-center border border-white/20">
              <p className="font-extrabold text-[18px] text-white leading-tight">{s.value}</p>
              <p className="text-[10px] text-white/70 font-bold mt-0.5 uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Menu sections */}
      <div className="px-5 mt-5 flex flex-col gap-5">
        {MENU.map(section => (
          <div key={section.section}>
            <h2 className="text-[11px] font-extrabold uppercase tracking-widest text-text-secondary mb-2.5 px-1">{section.section}</h2>
            <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
              {section.items.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={i}
                    type="button"
                    whileTap={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                    className="w-full flex items-center gap-3 p-4 text-left"
                  >
                    <div className="w-9 h-9 rounded-[12px] bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                      <Icon size={16} className="text-text-secondary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[14px] text-text-main">{item.label}</p>
                      <p className="text-[11px] text-text-secondary font-medium mt-0.5 truncate">{item.sub}</p>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 shrink-0" />
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Logout */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => setShowLogoutDialog(true)}
          className="w-full flex items-center justify-center gap-2.5 p-4 rounded-[20px] border-2 border-red-100 bg-red-50 font-extrabold text-primary text-[15px]"
        >
          <LogOut size={18} />
          Se déconnecter
        </motion.button>
      </div>

      {/* Logout confirmation dialog */}
      <AnimatePresence>
        {showLogoutDialog && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40"
              style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
              onClick={() => setShowLogoutDialog(false)}
            />
            <motion.div
              key="dialog"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="absolute left-5 right-5 z-50 bg-white rounded-[28px] p-6 shadow-2xl"
              style={{ top: "50%", transform: "translateY(-50%)" }}
            >
              <div className="w-14 h-14 rounded-full bg-red-50 border-2 border-red-100 flex items-center justify-center mx-auto mb-4">
                <LogOut size={22} className="text-primary" />
              </div>
              <h2 className="text-[20px] font-extrabold text-text-main text-center mb-2 tracking-tight">Se déconnecter ?</h2>
              <p className="text-text-secondary text-sm text-center mb-6 leading-relaxed">Vous devrez vous reconnecter pour accéder à votre compte et réserver des trajets.</p>

              <div className="flex flex-col gap-2.5">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={handleLogout}
                  className="w-full gradient-primary text-white py-3.5 rounded-[18px] font-extrabold text-[15px] shadow-premium-red"
                >
                  Confirmer
                </motion.button>
                <button
                  type="button"
                  onClick={() => setShowLogoutDialog(false)}
                  className="w-full py-3.5 rounded-[18px] font-bold text-[15px] text-text-secondary border border-gray-100"
                >
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
