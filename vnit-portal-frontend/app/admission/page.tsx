"use client";

import { useEffect, useState } from "react";

export default function Admission() {
  const [types, setTypes] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [titles, setTitles] = useState<any[]>([]);

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

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Admission Form</h1>

      <select onChange={handleType} className="border p-2 w-full">
        <option>Select Program Type</option>
        {types.map(t => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>

      <select onChange={handleProgram} className="border p-2 w-full">
        <option>Select Program</option>
        {programs.map(p => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      <select className="border p-2 w-full">
        <option>Select Program Title</option>
        {titles.map(t => (
          <option key={t.id}>{t.title}</option>
        ))}
      </select>
    </div>
  );
}
