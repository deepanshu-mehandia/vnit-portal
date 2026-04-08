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
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg space-y-6">

        <h1 className="text-3xl font-bold text-gray-800">
          Student Admission Form
        </h1>

        {/* PROGRAM DETAILS */}
        <div>
          <h2 className="text-lg font-semibold mb-2 text-gray-700">
            Program Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <select
              onChange={(e) => {
                setSelectedType(e.target.value);
                handleType(e);
              }}
              className="border p-2 rounded"
            >
              <option value="">Select Program Type</option>
              {types.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>

            <select
              onChange={(e) => {
                setSelectedProgram(e.target.value);
                handleProgram(e);
              }}
              className="border p-2 rounded"
            >
              <option value="">Select Program</option>
              {programs.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            <select
              onChange={(e) => setSelectedTitle(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="">Select Program Title</option>
              {titles.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>

          </div>
        </div>

        <hr />

        {/* PERSONAL DETAILS */}
        <div>
          <h2 className="text-lg font-semibold mb-2 text-gray-700">
            Personal Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <input
              placeholder="Full Name"
              className="border p-2 rounded"
              onChange={(e) => setName(e.target.value)}
            />

            <input
              placeholder="Email"
              className="border p-2 rounded"
              onChange={(e) => setEmail(e.target.value)}
            />

          </div>
        </div>

        {/* BUTTON */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
          >
            Submit Application
          </button>
        </div>

      </div>
    </div>
  );
}
