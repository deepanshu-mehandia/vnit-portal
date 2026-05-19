"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { motion } from "framer-motion";
import { Wallet, CreditCard, CheckCircle, Clock, AlertCircle, Receipt } from "lucide-react";

export default function Fees() {
  const router  = useRouter();
  const [fees,   setFees]    = useState<any[]>([]);
  const [loading,setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) { router.push("/"); return; }
    const studentId = localStorage.getItem("student_id");
    if (!studentId) { router.push("/dashboard"); return; }
    apiFetch(`/fees/demand/${studentId}`)
      .then(d => setFees(d || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const total   = fees.reduce((s, f) => s + (f.amount || 0), 0);
  const paid    = fees.filter(f => f.status === "paid").reduce((s, f) => s + f.amount, 0);
  const pending = total - paid;

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
        className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl p-7 text-white shadow-xl shadow-amber-500/20"
      >
        <p className="text-amber-100 text-xs font-bold uppercase tracking-widest mb-1">Academic Year 2025–26</p>
        <h1 className="text-2xl font-black mb-4">Fee Management</h1>
        <div className="flex flex-wrap gap-4">
          <div className="bg-white/15 rounded-xl px-4 py-2 text-center">
            <p className="text-xl font-black">₹{total.toLocaleString()}</p>
            <p className="text-amber-100 text-xs">Total Demand</p>
          </div>
          <div className="bg-white/15 rounded-xl px-4 py-2 text-center">
            <p className="text-xl font-black">₹{paid.toLocaleString()}</p>
            <p className="text-amber-100 text-xs">Paid</p>
          </div>
          <div className="bg-white/15 rounded-xl px-4 py-2 text-center">
            <p className="text-xl font-black">₹{pending.toLocaleString()}</p>
            <p className="text-amber-100 text-xs">Pending</p>
          </div>
        </div>
      </motion.div>

      {fees.length === 0 ? (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
          className="bg-white rounded-2xl border border-slate-100 p-12 text-center"
        >
          <Receipt size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-semibold">No fee demands found</p>
          <p className="text-slate-400 text-sm mt-1">Fee demands will appear here once generated</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {fees.map((f: any, i: number) => {
            const isPaid = f.status === "paid";
            return (
              <motion.div
                key={f.demand_id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className={`bg-white rounded-2xl border shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-all ${
                  isPaid ? "border-emerald-100" : "border-amber-100"
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isPaid ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                }`}>
                  {isPaid ? <CheckCircle size={20} /> : <Clock size={20} />}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-800">Demand #{f.demand_id}</p>
                  <p className="text-slate-400 text-sm">Academic Fee Demand</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-lg text-slate-800">₹{(f.amount || 0).toLocaleString()}</p>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    isPaid
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}>
                    {isPaid ? "Paid" : "Pending"}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Info card */}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }}
        className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex gap-3"
      >
        <AlertCircle size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-blue-800 font-semibold text-sm">Payment Information</p>
          <p className="text-blue-600 text-xs mt-0.5 leading-relaxed">
            For fee payment or discrepancies, contact the Academic Section at VNIT Nagpur or visit the Finance Office.
          </p>
        </div>
      </motion.div>
    </div>
  );
}