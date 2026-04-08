"use client";

import { useEffect, useState } from "react";

export default function Admission() {
  const [types, setTypes] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [titles, setTitles] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedTitle, setSelectedTitle] = useState("");
  const [typeId, setTypeId] = useState("");
  const [programId, setProgramId] = useState("");

  useEffect(() => {
    fetch("https://vnit-portal.onrender.com/programs/types")
      .then(res => res.json())
      .then(setTypes);
  }, []);

  async function handleType(e: any) {
    const id = e.target.value;
    setTypeId(id);

    const res = await fetch(`https://vnit-portal.onrender.com/programs/${id}`);
    const data = await res.json();

    setPrograms(data);
    setTitles([]);
  }

  async function handleProgram(e: any) {
    const id = e.target.value;
    setProgramId(id);

    const res = await fetch(`https://vnit-portal.onrender.com/programs/titles/${id}`);
    const data = await res.json();

    setTitles(data);
  }

  async function handleSubmit() {
  try {
    await fetch("https://vnit-portal.onrender.com/admission", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
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
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Admission Form</h1>

      <select onChange={(e) => {
        setSelectedType(e.target.value);
        handleType(e);
      }}>
        <option>Select Program Type</option>
        {types.map(t => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>

      <select onChange={(e) => {
        setSelectedProgram(e.target.value);
        handleProgram(e);
      }}>
        <option>Select Program</option>
        {programs.map(p => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      <select onChange={(e) => setSelectedTitle(e.target.value)}>
        <option>Select Program Title</option>
        {titles.map(t => (
          <option key={t.id} value={t.id}>{t.title}</option>
        ))}
      </select>

      <button onClick={handleSubmit} className="bg-green-500 text-white px-4 py-2 rounded">
        Submit Admission
      </button>
    </div>
  );
}
