"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { motion } from "framer-motion";
import { Home, MapPin, BedDouble, Building, Phone, AlertCircle } from "lucide-react";

export default function HostelPage() {
  const router = useRouter();
  const [hostel,  setHostel]  = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) { router.push("/"); return; }
    const studentId = localStorage.getItem("student_id");
    if (!studentId) { router.push("/dashboard"); return; }

    apiFetch(`/hostel/room/${studentId}`)
      .then(setHostel)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const allocated = hostel && hostel.room !== "not allocated";

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
        className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-3xl p-7 text-white shadow-xl shadow-teal-500/20"
      >
        <p className="text-teal-100 text-xs font-bold uppercase tracking-widest mb-1">Student Housing</p>
        <h1 className="text-2xl font-black mb-1">Hostel Information</h1>
        <p className="text-teal-100 text-sm">Your current room allocation details</p>
      </motion.div>

      {allocated ? (
        <>
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
          >
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 px-6 py-5 border-b border-teal-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center">
                  <Home size={24} />
                </div>
                <div>
                  <p className="text-xs text-teal-600 font-bold uppercase tracking-wider">Room Allocated</p>
                  <p className="text-xl font-black text-slate-800">Room {hostel.room}</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {[
                { icon: Building, label: "Hostel",      value: hostel.hostel },
                { icon: MapPin,   label: "Block",       value: hostel.block },
                { icon: BedDouble, label: "Room Number", value: hostel.room },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-4 py-3 border-b border-slate-50 last:border-0">
                  <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon size={18} className="text-teal-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">{label}</p>
                    <p className="text-base font-bold text-slate-800 mt-0.5">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Rules / info card */}
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.2 }}
            className="bg-teal-50 border border-teal-100 rounded-2xl p-5 flex gap-3"
          >
            <AlertCircle size={18} className="text-teal-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-teal-800 font-semibold text-sm">Hostel Timings</p>
              <p className="text-teal-700 text-xs mt-1 leading-relaxed">
                Gates close at 10:00 PM. Visitors are allowed only between 10 AM – 6 PM in common areas.
                For maintenance requests, contact the Hostel Warden's office.
              </p>
            </div>
          </motion.div>
        </>
      ) : (
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center"
        >
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home size={28} className="text-slate-400" />
          </div>
          <h2 className="text-lg font-black text-slate-800 mb-2">No Room Allocated</h2>
          <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
            You have not been allocated a hostel room yet. Please contact the Hostel Administration Office for assistance.
          </p>
          <div className="mt-6 p-4 bg-slate-50 rounded-xl inline-flex items-center gap-2 text-slate-600 text-sm">
            <Phone size={15} />
            <span>Hostel Admin: +91 712 225 0506</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}