"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { motion } from "framer-motion";
import {
  User, Mail, Phone, Calendar, MapPin, BookOpen,
  Shield, Hash, Heart, Fingerprint, GraduationCap, Camera,
} from "lucide-react";
import toast from "react-hot-toast";

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
  const router   = useRouter();
  const fileRef  = useRef<HTMLInputElement>(null);
  const [student,       setStudent]       = useState<any>(null);
  const [uploadingPhoto,setUploadingPhoto]= useState(false);

  useEffect(() => {
    if (!isAuthenticated()) { router.push("/"); return; }
    apiFetch("/students/me").then(setStudent).catch(console.error);
  }, []);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Max 2MB"); return; }

    // Compress to 200×200 via canvas
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = async () => {
      const canvas = document.createElement("canvas");
      const SIZE = 200;
      canvas.width = SIZE; canvas.height = SIZE;
      const ctx = canvas.getContext("2d")!;
      // crop to square
      const min = Math.min(img.width, img.height);
      const sx  = (img.width  - min) / 2;
      const sy  = (img.height - min) / 2;
      ctx.drawImage(img, sx, sy, min, min, 0, 0, SIZE, SIZE);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.8);

      try {
        setUploadingPhoto(true);
        await apiFetch("/students/me/photo", {
          method: "PATCH",
          body: JSON.stringify({ photo: dataUrl }),
        });
        setStudent((prev: any) => ({ ...prev, profile_photo: dataUrl }));
        toast.success("Photo updated!");
      } catch (err: any) {
        toast.error(err.message || "Upload failed");
      } finally {
        setUploadingPhoto(false);
      }
    };
  }

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
          {/* Avatar with upload */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl border-2 border-white/30 overflow-hidden bg-white/20 backdrop-blur flex items-center justify-center">
              {student.profile_photo ? (
                <img src={student.profile_photo} alt={fullName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-black text-white">{initials}</span>
              )}
            </div>
            {/* Upload button overlay */}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploadingPhoto}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-white text-blue-600 rounded-xl flex items-center justify-center shadow-lg hover:bg-blue-50 transition"
              title="Change photo"
            >
              {uploadingPhoto ? (
                <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera size={13} />
              )}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
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
            <InfoRow icon={GraduationCap} label="Program"         value="Master of Technology" />
            <InfoRow icon={BookOpen}      label="Specialization"  value="Computer Science & Engineering" />
            <InfoRow icon={Hash}          label="Roll Number"     value={student.roll_number} />
            <InfoRow icon={User}          label="Faculty Advisor" value="Prof. Ashish Tiwari" />
          </div>
        </Section>
      </motion.div>

      {/* Address Details */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Section title="Address Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
            <InfoRow icon={MapPin} label="City"     value={student.city} />
            <InfoRow icon={MapPin} label="State"    value={student.state} />
            <InfoRow icon={Hash}   label="PIN Code" value={student.pin} />
            <InfoRow icon={MapPin} label="Address"  value={student.address} />
          </div>
        </Section>
      </motion.div>
    </div>
  );
}