"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Plus, Trash2, Info, AlertTriangle, CheckCircle, Zap, Users, GraduationCap, BookOpen } from "lucide-react";

const TYPES = [
  { value: "info",    label: "Info",    Icon: Info,          color: "bg-blue-100 text-blue-700 border-blue-200"    },
  { value: "success", label: "Success", Icon: CheckCircle,   color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { value: "warning", label: "Warning", Icon: AlertTriangle, color: "bg-amber-100 text-amber-700 border-amber-200" },
  { value: "urgent",  label: "Urgent",  Icon: Zap,           color: "bg-red-100 text-red-700 border-red-200"       },
];

const TARGETS = [
  { value: "all",     label: "Everyone",  Icon: Users         },
  { value: "student", label: "Students",  Icon: GraduationCap },
  { value: "faculty", label: "Faculty",   Icon: BookOpen      },
];

const TYPE_ICON: Record<string, any> = {
  info: Info, success: CheckCircle, warning: AlertTriangle, urgent: Zap,
};
const TYPE_COLOR: Record<string, string> = {
  info:    "bg-blue-50 border-blue-100 text-blue-700",
  success: "bg-emerald-50 border-emerald-100 text-emerald-700",
  warning: "bg-amber-50 border-amber-100 text-amber-700",
  urgent:  "bg-red-50 border-red-100 text-red-700",
};

export default function AdminNotificationsPage() {
  const router = useRouter();
  const [notifs,  setNotifs]  = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const [title,  setTitle]  = useState("");
  const [msg,    setMsg]    = useState("");
  const [type,   setType]   = useState("info");
  const [target, setTarget] = useState("all");

  useEffect(() => {
    if (localStorage.getItem("role") !== "admin") { router.push("/dashboard"); return; }
    load();
  }, []);

  async function load() {
    try {
      const data = await apiFetch("/notifications");
      setNotifs(data);
    } catch (e: any) {
      toast.error(e.message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function post() {
    if (!title.trim() || !msg.trim()) { toast.error("Title and message required"); return; }
    try {
      setPosting(true);
      await apiFetch("/notifications", {
        method: "POST",
        body: JSON.stringify({ title: title.trim(), message: msg.trim(), type, target_role: target }),
      });
      toast.success("Notification posted!");
      setTitle(""); setMsg("");
      load();
    } catch (e: any) {
      toast.error(e.message || "Failed");
    } finally {
      setPosting(false);
    }
  }

  async function del(id: number) {
    try {
      await apiFetch(`/notifications/${id}`, { method: "DELETE" });
      setNotifs(prev => prev.filter(n => n.id !== id));
      toast.success("Deleted");
    } catch (e: any) {
      toast.error(e.message || "Failed");
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-7 text-white shadow-xl"
      >
        <div className="flex items-center gap-3 mb-2">
          <Bell size={20} className="text-slate-400" />
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Administrator</p>
        </div>
        <h1 className="text-2xl font-black">Notifications</h1>
        <p className="text-slate-400 text-sm mt-1">
          Push announcements to students and faculty
        </p>
      </motion.div>

      {/* Compose form */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 space-y-4"
      >
        <h2 className="font-black text-slate-800 dark:text-slate-100 text-base flex items-center gap-2">
          <Plus size={16} /> New Notification
        </h2>

        <input
          value={title} onChange={e => setTitle(e.target.value)}
          placeholder="Title — e.g. Fee payment deadline approaching"
          className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <textarea
          value={msg} onChange={e => setMsg(e.target.value)} rows={3}
          placeholder="Write the full notification message here…"
          className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Type selector */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Type</p>
            <div className="flex gap-2 flex-wrap">
              {TYPES.map(t => (
                <button key={t.value} onClick={() => setType(t.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
                    type === t.value ? t.color : "border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  <t.Icon size={12} /> {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Audience selector */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Audience</p>
            <div className="flex gap-2 flex-wrap">
              {TARGETS.map(t => (
                <button key={t.value} onClick={() => setTarget(t.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
                    target === t.value
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  <t.Icon size={12} /> {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button onClick={post} disabled={posting || !title.trim() || !msg.trim()}
          className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Bell size={16} />
          {posting ? "Posting…" : "Post Notification"}
        </button>
      </motion.div>

      {/* Existing notifications */}
      <div>
        <h2 className="text-sm font-black text-slate-500 uppercase tracking-wider mb-3">
          Posted Notifications ({notifs.length})
        </h2>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-7 h-7 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifs.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-12 text-center">
            <Bell size={40} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-semibold">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {notifs.map((n, i) => {
                const Icon  = TYPE_ICON[n.type]  || Info;
                const color = TYPE_COLOR[n.type] || TYPE_COLOR.info;
                const targetLabel = n.target_role === "all" ? "Everyone"
                  : n.target_role === "student" ? "Students" : "Faculty";
                return (
                  <motion.div key={n.id}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 20 }} transition={{ delay: i * 0.04 }}
                    className={`flex items-start gap-4 p-4 rounded-2xl border ${color} group`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-white/60 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p className="font-black text-sm">{n.title}</p>
                        <span className="text-[10px] font-bold bg-white/60 px-2 py-0.5 rounded-full">
                          → {targetLabel}
                        </span>
                      </div>
                      <p className="text-xs opacity-80 leading-relaxed">{n.message}</p>
                      <p className="text-[10px] opacity-60 mt-1">
                        {new Date(n.created_at).toLocaleString("en-IN", {
                          day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                        })}
                      </p>
                    </div>
                    <button onClick={() => del(n.id)}
                      className="opacity-0 group-hover:opacity-100 w-8 h-8 bg-white/60 hover:bg-white rounded-xl flex items-center justify-center transition flex-shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}