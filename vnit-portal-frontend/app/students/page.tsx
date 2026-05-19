"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { motion } from "framer-motion";
import {
  User, Mail, Phone, Calendar, MapPin, BookOpen,
  Shield, Hash, Heart, Fingerprint, GraduationCap,
} from "lucide-react";

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0">
      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={15} className="text-slate-500" />
      </div>
      <div>
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p className="text-sm font-semibold text-slate-800 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <h2 className="font-black text-slate-800 text-sm uppercase tracking-wider mb-4 pb-3 border-b border-slate-100">
        {title}
      </h2>
      {children}
    </div>
  );
}

export default function Students() {
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated()) { router.push("/"); return; }
    apiFetch("/students/me")
      .then(setStudent)
      .catch(console.error);
  }, []);

  if (!student) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const fullName = [student.first_name, student.middle_name, student.last_name].filter(Boolean).join(" ");
  const initials = [student.first_name?.[0], student.last_name?.[0]].filter(Boolean).join("").toUpperCase();

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-10">
      {/* Profile Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-500/20"
      >
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-3xl font-black flex-shrink-0 border border-white/30">
            {initials}
          </div>
          <div>
            <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-1">Student Profile</p>
            <h1 className="text-2xl font-black">{fullName}</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              {student.roll_number && (
                <span className="bg-white/15 px-2.5 py-0.5 rounded-full text-xs font-bold">
                  {student.roll_number}
                </span>
              )}
              <span className="bg-white/15 px-2.5 py-0.5 rounded-full text-xs font-bold">
                M.Tech CSE
              </span>
              <span className="bg-white/15 px-2.5 py-0.5 rounded-full text-xs font-bold">
                {student.category}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Personal Details */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Section title="Personal Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
            <div>
              <InfoRow icon={User}        label="Father's Name"  value={student.father_name} />
              <InfoRow icon={User}        label="Mother's Name"  value={student.mother_name} />
              <InfoRow icon={Calendar}    label="Date of Birth"  value={student.dob} />
              <InfoRow icon={Shield}      label="Gender"         value={student.gender} />
            </div>
            <div>
              <InfoRow icon={Mail}        label="Email Address"  value={student.email} />
              <InfoRow icon={Phone}       label="Mobile"         value={student.mobile} />
              <InfoRow icon={Heart}       label="Blood Group"    value={student.blood_group} />
              <InfoRow icon={Fingerprint} label="Aadhaar"        value={student.aadhaar ? `••••••${student.aadhaar.slice(-4)}` : null} />
            </div>
          </div>
        </Section>
      </motion.div>

      {/* Academic Details */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Section title="Academic Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
            <InfoRow icon={GraduationCap} label="Program"        value="Master of Technology" />
            <InfoRow icon={BookOpen}      label="Specialization" value="Computer Science & Engineering" />
            <InfoRow icon={Hash}          label="Roll Number"    value={student.roll_number} />
            <InfoRow icon={User}          label="Faculty Advisor" value="Prof. Ashish Tiwari" />
          </div>
        </Section>
      </motion.div>

      {/* Address Details */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Section title="Address Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
            <InfoRow icon={MapPin} label="City"    value={student.city} />
            <InfoRow icon={MapPin} label="State"   value={student.state} />
            <InfoRow icon={Hash}   label="PIN Code" value={student.pin} />
            <InfoRow icon={MapPin} label="Address" value={student.address} />
          </div>
        </Section>
      </motion.div>
    </div>
  );
}