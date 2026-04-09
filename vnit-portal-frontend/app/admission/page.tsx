"use client";

import { useEffect, useState } from "react";

export default function Admission() {
  const [types, setTypes] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [titles, setTitles] = useState<any[]>([]);

  const [selectedType, setSelectedType] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedTitle, setSelectedTitle] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    fetch("https://vnit-portal.onrender.com/programs/types")
      .then(res => res.json())
      .then(setTypes);
  }, []);

  async function handleType(e: any) {
    const id = e.target.value;

    const res = await fetch(`https://vnit-portal.onrender.com/programs/${id}`);
    const data = await res.json();

    setPrograms(data);
    setTitles([]);
  }

  async function handleProgram(e: any) {
    const id = e.target.value;

    const res = await fetch(`https://vnit-portal.onrender.com/programs/titles/${id}`);
    const data = await res.json();

    setTitles(data);
  }

  async function handleSubmit() {
    // ✅ VALIDATION HERE
    if (!selectedType || !selectedProgram || !selectedTitle) {
      alert("Select program properly");
      return;
    }

    if (!name || !email) {
      alert("Fill all details");
      return;
    }

    try {
      await fetch("https://vnit-portal.onrender.com/admission", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          program_type_id: selectedType,
          program_id: selectedProgram,
          program_title_id: selectedTitle,
        }),
      });

      alert("Admission submitted");
    } catch (err) {
      console.error(err);
      alert("Failed");
    }
  }

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8 space-y-8">

  {/* HEADER */}
  <div>
    <h1 className="text-3xl font-bold text-gray-800">
      Student Admission Form
    </h1>
    <p className="text-gray-500 mt-1">
      Fill in your details to apply for admission
    </p>
  </div>

  {/* PROGRAM DETAILS */}
  <div className="border rounded-xl p-6">
    <h2 className="text-lg font-semibold text-gray-700 mb-4">
      Program Details
    </h2>

    <div className="grid md:grid-cols-3 gap-4">

      <div>
        <label className="text-sm text-gray-600">Program Type</label>
        <select
          onChange={(e) => {
            setSelectedType(e.target.value);
            handleType(e);
          }}
          className="w-full mt-1 border p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select</option>
          {types.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm text-gray-600">Program</label>
        <select
          disabled={!selectedType}
          onChange={(e) => {
            setSelectedProgram(e.target.value);
            handleProgram(e);
          }}
          className="w-full mt-1 border p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select</option>
          {programs.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm text-gray-600">Program Title</label>
        <select
          disabled={!selectedProgram}
          onChange={(e) => setSelectedTitle(e.target.value)}
          className="w-full mt-1 border p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select</option>
          {titles.map(t => (
            <option key={t.id} value={t.id}>{t.title}</option>
          ))}
        </select>
      </div>

    </div>
  </div>

  {/* PERSONAL DETAILS */}
  <div className="border rounded-xl p-6">
    <h2 className="text-lg font-semibold text-gray-700 mb-4">
      Personal Details
    </h2>

    <div className="grid md:grid-cols-3 gap-4">

      <div>
        <label className="text-sm text-gray-600">Full Name</label>
        <input
          className="w-full mt-1 border p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <label className="text-sm text-gray-600">Email</label>
        <input
          className="w-full mt-1 border p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div>
        <label className="text-sm text-gray-600">Mobile</label>
        <input
          className="w-full mt-1 border p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

    </div>
  </div>

  {/* ACTION BUTTONS */}
  <div className="flex justify-between items-center">

    <button className="text-gray-500 hover:underline">
      Reset
    </button>

    <button
      onClick={handleSubmit}
      className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold shadow"
    >
      Submit Application
    </button>

  </div>

</div>
  );
}
