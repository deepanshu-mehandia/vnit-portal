"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Building, BedDouble, Plus, Trash2, Users,
  ChevronRight, Search, X, UserCheck,
} from "lucide-react";

type Hostel   = { hostel_id: number; hostel_name: string; hostel_type: string; block_count: number; room_count: number; allocated: number };
type Block    = { block_id: number; block_name: string; room_count: number; total_capacity: number; allocated: number };
type Room     = { room_id: number; room_number: string; capacity: number; occupants: any[] };
type Student  = { student_id: number; name: string; roll_number: string };

const TYPE_COLOR: Record<string, string> = {
  boys:  "bg-blue-100 text-blue-700",
  girls: "bg-pink-100 text-pink-700",
  coed:  "bg-purple-100 text-purple-700",
};

export default function AdminHostelPage() {
  const router = useRouter();

  const [hostels,    setHostels]    = useState<Hostel[]>([]);
  const [blocks,     setBlocks]     = useState<Block[]>([]);
  const [rooms,      setRooms]      = useState<Room[]>([]);

  const [selHostel,  setSelHostel]  = useState<Hostel | null>(null);
  const [selBlock,   setSelBlock]   = useState<Block  | null>(null);

  const [loading,    setLoading]    = useState(true);

  // Add forms
  const [newHostelName, setNewHostelName] = useState("");
  const [newHostelType, setNewHostelType] = useState("boys");
  const [newBlockName,  setNewBlockName]  = useState("");
  const [newRoomNum,    setNewRoomNum]    = useState("");
  const [newRoomCap,    setNewRoomCap]    = useState("2");

  // Allocation
  const [allocSearch,    setAllocSearch]    = useState("");
  const [allocResults,   setAllocResults]   = useState<Student[]>([]);
  const [allocRoom,      setAllocRoom]      = useState<Room | null>(null);
  const [allocYear,      setAllocYear]      = useState(new Date().getFullYear() + "-" + (new Date().getFullYear() + 1));
  const [allocStudent,   setAllocStudent]   = useState<Student | null>(null);
  const [showAllocModal, setShowAllocModal] = useState(false);
  const [allocSaving,    setAllocSaving]    = useState(false);

  useEffect(() => {
    if (localStorage.getItem("role") !== "admin") { router.push("/dashboard"); return; }
    loadHostels();
  }, []);

  async function loadHostels() {
    try {
      const data = await apiFetch("/hostel/hostels");
      setHostels(data);
    } catch (e: any) {
      toast.error(e.message || "Failed to load hostels");
    } finally {
      setLoading(false);
    }
  }

  async function loadBlocks(hostel: Hostel) {
    setSelHostel(hostel);
    setSelBlock(null);
    setRooms([]);
    try {
      const data = await apiFetch(`/hostel/hostels/${hostel.hostel_id}/blocks`);
      setBlocks(data);
    } catch (e: any) {
      toast.error(e.message || "Failed");
    }
  }

  async function loadRooms(block: Block) {
    setSelBlock(block);
    try {
      const data = await apiFetch(`/hostel/blocks/${block.block_id}/rooms`);
      setRooms(data);
    } catch (e: any) {
      toast.error(e.message || "Failed");
    }
  }

  async function addHostel() {
    if (!newHostelName.trim()) { toast.error("Enter hostel name"); return; }
    try {
      await apiFetch("/hostel/hostels", {
        method: "POST",
        body: JSON.stringify({ hostel_name: newHostelName.trim(), hostel_type: newHostelType }),
      });
      toast.success("Hostel created");
      setNewHostelName("");
      loadHostels();
    } catch (e: any) { toast.error(e.message || "Failed"); }
  }

  async function addBlock() {
    if (!selHostel || !newBlockName.trim()) { toast.error("Enter block name"); return; }
    try {
      await apiFetch(`/hostel/hostels/${selHostel.hostel_id}/blocks`, {
        method: "POST",
        body: JSON.stringify({ block_name: newBlockName.trim() }),
      });
      toast.success("Block created");
      setNewBlockName("");
      loadBlocks(selHostel);
    } catch (e: any) { toast.error(e.message || "Failed"); }
  }

  async function addRoom() {
    if (!selBlock || !newRoomNum.trim()) { toast.error("Enter room number"); return; }
    try {
      await apiFetch(`/hostel/blocks/${selBlock.block_id}/rooms`, {
        method: "POST",
        body: JSON.stringify({ room_number: newRoomNum.trim(), capacity: Number(newRoomCap) }),
      });
      toast.success("Room created");
      setNewRoomNum("");
      loadRooms(selBlock);
    } catch (e: any) { toast.error(e.message || "Failed"); }
  }

  async function removeAllocation(allocation_id: number) {
    try {
      await apiFetch(`/hostel/allocations/${allocation_id}`, { method: "DELETE" });
      toast.success("Removed");
      if (selBlock) loadRooms(selBlock);
    } catch (e: any) { toast.error(e.message || "Failed"); }
  }

  // Student search for allocation
  async function searchStudents(q: string) {
    setAllocSearch(q);
    if (q.length < 2) { setAllocResults([]); return; }
    try {
      const all = await apiFetch("/admin/students/all");
      const filtered = (all as any[]).filter((s: any) =>
        s.name?.toLowerCase().includes(q.toLowerCase()) ||
        s.roll_number?.toLowerCase().includes(q.toLowerCase())
      ).slice(0, 6);
      setAllocResults(filtered);
    } catch {}
  }

  async function allocate() {
    if (!allocStudent || !allocRoom) return;
    try {
      setAllocSaving(true);
      await apiFetch("/hostel/allocate", {
        method: "POST",
        body: JSON.stringify({
          student_id:    allocStudent.student_id,
          room_id:       allocRoom.room_id,
          academic_year: allocYear,
        }),
      });
      toast.success(`${allocStudent.name} allocated to Room ${allocRoom.room_number}`);
      setShowAllocModal(false);
      setAllocStudent(null);
      setAllocSearch("");
      setAllocResults([]);
      if (selBlock) loadRooms(selBlock);
    } catch (e: any) {
      toast.error(e.message || "Failed");
    } finally {
      setAllocSaving(false);
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <>
      {/* Allocate Modal */}
      <AnimatePresence>
        {showAllocModal && allocRoom && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAllocModal(false)}
          >
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="bg-gradient-to-r from-teal-600 to-cyan-700 px-7 py-5 text-white relative">
                <button onClick={() => setShowAllocModal(false)} className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center">
                  <X size={16} />
                </button>
                <p className="text-teal-200 text-xs uppercase tracking-widest mb-0.5">Allocate Student</p>
                <h2 className="font-black text-lg">Room {allocRoom.room_number}</h2>
                <p className="text-teal-100 text-sm">{selBlock?.block_name} · {selHostel?.hostel_name}</p>
              </div>

              <div className="p-6 space-y-4">
                {/* Student search */}
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={allocSearch} onChange={e => searchStudents(e.target.value)}
                    placeholder="Search student by name or roll number…"
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {allocResults.length > 0 && !allocStudent && (
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    {allocResults.map(s => (
                      <div key={s.student_id}
                        onClick={() => { setAllocStudent(s); setAllocSearch(s.name); setAllocResults([]); }}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0"
                      >
                        <div className="w-8 h-8 bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center text-xs font-bold">
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{s.name}</p>
                          <p className="text-xs text-slate-400">{s.roll_number}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {allocStudent && (
                  <div className="flex items-center gap-3 bg-teal-50 border border-teal-100 rounded-xl px-4 py-3">
                    <UserCheck size={16} className="text-teal-600" />
                    <div className="flex-1">
                      <p className="font-bold text-teal-800 text-sm">{allocStudent.name}</p>
                      <p className="text-teal-600 text-xs">{allocStudent.roll_number}</p>
                    </div>
                    <button onClick={() => { setAllocStudent(null); setAllocSearch(""); }}
                      className="text-teal-400 hover:text-teal-600">
                      <X size={14} />
                    </button>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1.5">Academic Year</label>
                  <input value={allocYear} onChange={e => setAllocYear(e.target.value)}
                    placeholder="2025-2026"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <button onClick={allocate} disabled={!allocStudent || allocSaving}
                  className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
                >
                  <BedDouble size={16} /> {allocSaving ? "Allocating…" : "Allocate Room"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto pb-10 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-teal-600 to-cyan-700 rounded-3xl p-7 text-white shadow-xl"
        >
          <div className="flex items-center gap-2 mb-2">
            <Home size={18} className="text-teal-300" />
            <p className="text-teal-200 text-xs font-bold uppercase tracking-widest">Administrator</p>
          </div>
          <h1 className="text-2xl font-black">Hostel Management</h1>
          <div className="flex gap-4 mt-3 text-sm text-teal-100">
            <span>{hostels.length} hostels</span>
            <span>·</span>
            <span>{hostels.reduce((s, h) => s + h.room_count, 0)} rooms total</span>
            <span>·</span>
            <span>{hostels.reduce((s, h) => s + h.allocated, 0)} students allocated</span>
          </div>
        </motion.div>

        {/* Three-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── Column 1: Hostels ── */}
          <div className="space-y-3">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Building size={13} /> Hostels
            </h2>

            {/* Add hostel form */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-2">
              <input value={newHostelName} onChange={e => setNewHostelName(e.target.value)}
                placeholder="Hostel name"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <div className="flex gap-2">
                <select value={newHostelType} onChange={e => setNewHostelType(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="boys">Boys</option>
                  <option value="girls">Girls</option>
                  <option value="coed">Co-ed</option>
                </select>
                <button onClick={addHostel}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-xl transition"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Hostel list */}
            {hostels.map(h => (
              <motion.div key={h.hostel_id}
                onClick={() => loadBlocks(h)}
                className={`bg-white rounded-2xl border-2 p-4 cursor-pointer transition hover:shadow-md ${
                  selHostel?.hostel_id === h.hostel_id
                    ? "border-teal-500 shadow-md shadow-teal-100"
                    : "border-slate-100 hover:border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="font-black text-slate-800 text-sm">{h.hostel_name}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${TYPE_COLOR[h.hostel_type] || "bg-slate-100 text-slate-600"}`}>
                    {h.hostel_type}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>{h.block_count} blocks</span>
                  <span>·</span>
                  <span>{h.room_count} rooms</span>
                  <span>·</span>
                  <span>{h.allocated} allocated</span>
                  <ChevronRight size={12} className="ml-auto" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* ── Column 2: Blocks ── */}
          <div className="space-y-3">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Building size={13} /> Blocks
              {selHostel && <span className="font-normal text-slate-400">— {selHostel.hostel_name}</span>}
            </h2>

            {selHostel ? (
              <>
                {/* Add block form */}
                <div className="bg-white rounded-2xl border border-slate-100 p-4">
                  <div className="flex gap-2">
                    <input value={newBlockName} onChange={e => setNewBlockName(e.target.value)}
                      placeholder="Block name (e.g. Block A)"
                      className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <button onClick={addBlock}
                      className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-xl transition"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {blocks.map(b => (
                  <motion.div key={b.block_id}
                    onClick={() => loadRooms(b)}
                    className={`bg-white rounded-2xl border-2 p-4 cursor-pointer transition hover:shadow-md ${
                      selBlock?.block_id === b.block_id
                        ? "border-teal-500 shadow-md shadow-teal-100"
                        : "border-slate-100 hover:border-slate-200"
                    }`}
                  >
                    <p className="font-black text-slate-800 text-sm mb-1">{b.block_name}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>{b.room_count} rooms</span>
                      <span>·</span>
                      <span>Cap: {b.total_capacity}</span>
                      <span>·</span>
                      <span className={b.allocated > 0 ? "text-teal-600 font-semibold" : ""}>
                        {b.allocated} allocated
                      </span>
                      <ChevronRight size={12} className="ml-auto" />
                    </div>
                  </motion.div>
                ))}

                {blocks.length === 0 && (
                  <p className="text-slate-400 text-sm text-center py-6">No blocks yet. Add one above.</p>
                )}
              </>
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
                <Building size={32} className="text-slate-200 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">Select a hostel</p>
              </div>
            )}
          </div>

          {/* ── Column 3: Rooms ── */}
          <div className="space-y-3">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <BedDouble size={13} /> Rooms
              {selBlock && <span className="font-normal text-slate-400">— {selBlock.block_name}</span>}
            </h2>

            {selBlock ? (
              <>
                {/* Add room form */}
                <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-2">
                  <div className="flex gap-2">
                    <input value={newRoomNum} onChange={e => setNewRoomNum(e.target.value)}
                      placeholder="Room number"
                      className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <select value={newRoomCap} onChange={e => setNewRoomCap(e.target.value)}
                      className="w-20 px-2 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none"
                    >
                      {[1,2,3,4].map(n => <option key={n} value={n}>{n} bed</option>)}
                    </select>
                    <button onClick={addRoom}
                      className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-xl transition"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Room cards */}
                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                  {rooms.map(r => {
                    const full = r.occupants.length >= r.capacity;
                    return (
                      <div key={r.room_id}
                        className={`bg-white rounded-xl border p-3 transition ${
                          full ? "border-red-100 bg-red-50/30" : "border-slate-100 hover:border-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <BedDouble size={14} className="text-slate-400" />
                            <span className="font-bold text-slate-800 text-sm">Room {r.room_number}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                              full ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-700"
                            }`}>
                              {r.occupants.length}/{r.capacity}
                            </span>
                          </div>
                          {!full && (
                            <button
                              onClick={() => { setAllocRoom(r); setShowAllocModal(true); }}
                              className="text-[10px] font-bold bg-teal-600 hover:bg-teal-700 text-white px-2 py-1 rounded-lg transition"
                            >
                              + Assign
                            </button>
                          )}
                        </div>

                        {r.occupants.map(o => (
                          <div key={o.allocation_id} className="flex items-center gap-2 mt-1.5 bg-slate-50 rounded-lg px-2.5 py-1.5">
                            <Users size={11} className="text-slate-400" />
                            <span className="text-xs font-semibold text-slate-700 flex-1 truncate">{o.name}</span>
                            <span className="text-[10px] text-slate-400">{o.roll_number}</span>
                            <button onClick={() => removeAllocation(o.allocation_id)}
                              className="text-slate-300 hover:text-red-500 transition ml-1">
                              <X size={11} />
                            </button>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                  {rooms.length === 0 && (
                    <p className="text-slate-400 text-sm text-center py-6">No rooms yet. Add one above.</p>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
                <BedDouble size={32} className="text-slate-200 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">Select a block</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}