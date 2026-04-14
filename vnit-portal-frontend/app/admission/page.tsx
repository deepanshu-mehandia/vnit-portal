"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function Admission() {
  const [types, setTypes] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [titles, setTitles] = useState<any[]>([]);

  const [selectedType, setSelectedType] = useState<number | "">("");
  const [selectedProgram, setSelectedProgram] = useState<number | "">("");
  const [selectedTitle, setSelectedTitle] = useState<number | "">("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    dob: "",
    gender: "",
    category: "",
    state: "",
    city: "",
    pin: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);

  // ================= LOAD PROGRAM TYPES =================
  useEffect(() => {
    fetch(`${API}/programs/types`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setTypes(data);
        else {
          console.error("Invalid types response", data);
          setTypes([]);
        }
      })
      .catch(err => console.error(err));
  }, []);

  // ================= HANDLE TYPE =================
  async function handleType(e: any) {
    const id = e.target.value;
    setSelectedType(id ? Number(id) : "");
    setSelectedProgram("");
    setSelectedTitle("");
    setPrograms([]);
    setTitles([]);

    if (!id) return;

    try {
      const res = await fetch(`${API}/programs/${id}`);
      const data = await res.json();

      if (Array.isArray(data)) setPrograms(data);
      else setPrograms([]);
    } catch (err) {
      console.error(err);
    }
  }

  // ================= HANDLE PROGRAM =================
  async function handleProgram(e: any) {
    const id = e.target.value;
    setSelectedProgram(id ? Number(id) : "");
    setSelectedTitle("");
    setTitles([]);

    if (!id) return;

    try {
      const res = await fetch(`${API}/programs/titles/${id}`);
      const data = await res.json();

      if (Array.isArray(data)) setTitles(data);
      else setTitles([]);
    } catch (err) {
      console.error(err);
    }
  }

  // ================= FORM UPDATE =================
  function update(key: string, value: string) {
    setForm({ ...form, [key]: value });
  }

  // ================= SUBMIT =================
  async function handleSubmit() {
    if (!selectedType || !selectedProgram || !selectedTitle) {
      alert("Select program properly");
      return;
    }

    if (!form.name || !form.email || !form.mobile) {
      alert("Fill required fields");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API}/admission`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          program_type_id: selectedType,
          program_id: selectedProgram,
          program_title_id: selectedTitle,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Submission failed");
        return;
      }

      alert(
        `Account Created!\n\nUsername: ${data.username}\n\nCheck your email for password`
      );

      window.location.href = "/";
    } catch (err) {
      console.error(err);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  }

  // ================= RESET =================
  function resetForm() {
    setSelectedType("");
    setSelectedProgram("");
    setSelectedTitle("");
    setPrograms([]);
    setTitles([]);

    setForm({
      name: "",
      email: "",
      mobile: "",
      dob: "",
      gender: "",
      category: "",
      state: "",
      city: "",
      pin: "",
      address: "",
    });
  }

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8 space-y-8">

      <h1 className="text-3xl font-bold">Student Admission</h1>

      {/* PROGRAM */}
      <div className="grid md:grid-cols-3 gap-4">
        <select onChange={handleType} value={selectedType} className="input">
          <option value="">Program Type</option>
          {types.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>

        <select onChange={handleProgram} value={selectedProgram} className="input">
          <option value="">Program</option>
          {programs.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <select onChange={(e) => setSelectedTitle(Number(e.target.value))} value={selectedTitle} className="input">
          <option value="">Program Title</option>
          {titles.map(t => (
            <option key={t.id} value={t.id}>{t.title}</option>
          ))}
        </select>
      </div>

      {/* PERSONAL */}
      <div className="grid md:grid-cols-2 gap-4">
        <input placeholder="Full Name" value={form.name} onChange={e => update("name", e.target.value)} className="input" />
        <input placeholder="Email" value={form.email} onChange={e => update("email", e.target.value)} className="input" />
        <input placeholder="Mobile" value={form.mobile} onChange={e => update("mobile", e.target.value)} className="input" />
        <input type="date" value={form.dob} onChange={e => update("dob", e.target.value)} className="input" />

        <select value={form.gender} onChange={e => update("gender", e.target.value)} className="input">
          <option value="">Gender</option>
          <option>Male</option>
          <option>Female</option>
        </select>

        <select value={form.category} onChange={e => update("category", e.target.value)} className="input">
          <option value="">Category</option>
          <option>General</option>
          <option>OBC</option>
          <option>SC</option>
          <option>ST</option>
        </select>
      </div>

      {/* ADDRESS */}
      <div className="grid md:grid-cols-2 gap-4">
        <input placeholder="State" value={form.state} onChange={e => update("state", e.target.value)} className="input" />
        <input placeholder="City" value={form.city} onChange={e => update("city", e.target.value)} className="input" />
        <input placeholder="PIN" value={form.pin} onChange={e => update("pin", e.target.value)} className="input" />
        <textarea placeholder="Address" value={form.address} onChange={e => update("address", e.target.value)} className="input md:col-span-2" />
      </div>

      {/* BUTTONS */}
      <div className="flex justify-between">
        <button onClick={resetForm} className="text-gray-500">
          Reset
        </button>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-green-600 text-white px-6 py-2 rounded"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </div>
    </div>
  );
}