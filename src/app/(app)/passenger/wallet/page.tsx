"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Plus, ArrowDownLeft, ArrowUpRight, CreditCard, Smartphone, Wallet, Shield } from "lucide-react";

const transactions = [
  { id: 1, label: "Trajet Tafourah → Bab Ezzouar", type: "debit",  amount: 350, date: "Aujourd'hui, 08:14" },
  { id: 2, label: "Recharge BaridiMob",             type: "credit", amount: 2000, date: "Hier, 15:30"       },
  { id: 3, label: "Trajet Hydra → Hussein Dey",      type: "debit",  amount: 280, date: "Hier, 17:42"       },
  { id: 4, label: "Recharge CCP",                    type: "credit", amount: 5000, date: "25 Mai, 10:00"    },
  { id: 5, label: "Trajet El Biar → Kouba",          type: "debit",  amount: 320, date: "25 Mai, 07:55"     },
  { id: 6, label: "Trajet Tafourah → Aéroport",      type: "debit",  amount: 450, date: "24 Mai, 11:20"     },
];

const methods = [
  { id: "wallet",    label: "Wallet TransFlex", icon: Wallet,     last4: null,   color: "#e53935" },
  { id: "cib",       label: "Carte CIB",        icon: CreditCard, last4: "1184", color: "#16a34a" },
  { id: "baridimob", label: "BaridiMob",        icon: Smartphone, last4: "4921", color: "#2563eb" },
  { id: "edahabia",  label: "Edahabia",         icon: CreditCard, last4: "7703", color: "#f59e0b" },
];

const BALANCE = 6_600;

export default function WalletScreen() {
  const [showTopup, setShowTopup] = useState(false);

  return (
    <div className="min-h-full bg-background pb-6">
      {/* Balance card */}
      <div className="px-5 pt-6 pb-4">
        <div className="relative overflow-hidden rounded-[28px] p-6 gradient-primary text-white shadow-premium-red">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }} />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }} />
          <p className="text-[12px] font-extrabold uppercase tracking-widest opacity-70 mb-2">Solde TransFlex</p>
          <p className="text-[42px] font-extrabold leading-none">{BALANCE.toLocaleString()} <span className="text-[20px] opacity-70">DA</span></p>
          <p className="text-[13px] opacity-60 mt-2 font-medium flex items-center gap-1.5"><Shield size={12} /> Solde sécurisé</p>

          <motion.button
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={() => setShowTopup(true)}
            className="mt-5 flex items-center gap-2 bg-white/20 border border-white/30 px-4 py-2.5 rounded-[14px] font-bold text-[13px] backdrop-blur-sm"
          >
            <Plus size={16} /> Recharger
          </motion.button>
        </div>
      </div>

      {/* Payment methods */}
      <div className="px-5 mb-5">
        <h2 className="font-extrabold text-[15px] text-text-main uppercase tracking-wider mb-3">Moyens de paiement</h2>
        <div className="flex flex-col gap-2.5">
          {methods.map((m, i) => {
            const Icon = m.icon;
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-white rounded-[18px] p-3.5 border border-gray-100 flex items-center gap-3 shadow-sm"
              >
                <div className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0" style={{ background: `${m.color}15`, border: `1px solid ${m.color}25` }}>
                  <Icon size={18} style={{ color: m.color }} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-[14px] text-text-main">{m.label}</p>
                  {m.last4 && <p className="text-[11px] text-text-secondary font-medium">•••• {m.last4}</p>}
                </div>
                <div className="w-2 h-2 rounded-full" style={{ background: m.color }} />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Transaction history */}
      <div className="px-5">
        <h2 className="font-extrabold text-[15px] text-text-main uppercase tracking-wider mb-3">Historique</h2>
        <div className="flex flex-col gap-2.5">
          {transactions.map((tx, i) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white rounded-[18px] p-3.5 border border-gray-100 flex items-center gap-3 shadow-sm"
            >
              <div className={`w-9 h-9 rounded-[12px] flex items-center justify-center shrink-0 ${tx.type === "credit" ? "bg-green-50" : "bg-red-50"}`}>
                {tx.type === "credit"
                  ? <ArrowDownLeft size={16} className="text-green-600" />
                  : <ArrowUpRight size={16} className="text-red-500" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[13px] text-text-main leading-tight truncate">{tx.label}</p>
                <p className="text-[11px] text-text-secondary mt-0.5 font-medium">{tx.date}</p>
              </div>
              <p className={`font-extrabold text-[14px] shrink-0 ${tx.type === "credit" ? "text-green-600" : "text-primary"}`}>
                {tx.type === "credit" ? "+" : "-"}{tx.amount.toLocaleString()} DA
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
