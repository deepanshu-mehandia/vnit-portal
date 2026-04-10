"use client";

import { useEffect, useState } from "react";

export default function Admission() {
  const [types, setTypes] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [titles, setTitles] = useState<any[]>([]);

  const [selectedType, setSelectedType] = useState<number | "">("");
  const [selectedProgram, setSelectedProgram] = useState<number | "">("");
  const [selectedTitle, setSelectedTitle] = useState<number | "">("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [category, setCategory] = useState("");
  const [state, setState] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

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

    if (!name || !email || !mobile || !dob || !gender || !category || !state || !address) {
      alert("Fill all required fields");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("https://vnit-portal.onrender.com/admission", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          mobile,
          dob,
          gender,
          category,
          state,
          address,
          city,
          pin,
          program_type_id: selectedType,
          program_id: selectedProgram,
          program_title_id: selectedTitle,
        }),
      });

      if (!res.ok) {
        throw new Error("Server error");
      }

      const result = await res.json();

      alert(`Account Created!\n\nUsername: ${result.username}\n\nCheck you email for password`);
      window.location.reload();

    } catch (err) {
      console.error(err);
      alert("Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8 space-y-8 transition-all duration-200 hover:shadow-2xl">

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
  <div className="border rounded-xl p-6 transition-all duration-200 hover:shadow-md">
    <h2 className="text-lg font-semibold text-gray-700 mb-4">
      Program Details
    </h2>

    <div className="grid md:grid-cols-3 gap-4">

      <div>
        <label className="text-sm text-gray-600">Program Type</label>
        <select value={selectedType}
          onChange={(e) => {
            setSelectedType(e.target.value ? Number(e.target.value) : "");
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
        <select value={selectedProgram}
          disabled={!selectedType}
          onChange={(e) => {
            setSelectedProgram(e.target.value ? Number(e.target.value) : "");
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
        <select value={selectedTitle}
          disabled={!selectedProgram}
          onChange={(e) => setSelectedTitle(e.target.value ? Number(e.target.value) : "")}
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
  <div className="border rounded-xl p-6 space-y-4 transition-all duration-200 hover:shadow-md">
  <h2 className="text-lg font-semibold text-gray-700">Personal Details</h2>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

    <input
      value={name}
      placeholder="Full Name"
      className="border p-2 rounded"
      onChange={(e) => setName(e.target.value)}
    />

    <input
      value={email}
      placeholder="Email"
      className="border p-2 rounded"
      onChange={(e) => setEmail(e.target.value)}
    />

    <input
      value={mobile}
      placeholder="Mobile"
      className="border p-2 rounded"
      onChange={(e) => setMobile(e.target.value)}
    />

    <input
      value={dob}
      type="date"
      className="border p-2 rounded"
      onChange={(e) => setDob(e.target.value)}
    />

    <select value={gender}
      className="border p-2 rounded"
      onChange={(e) => setGender(e.target.value)}
    >
      <option value="">Select Gender</option>
      <option>Male</option>
      <option>Female</option>
      <option>Other</option>
    </select>

    <select value={category}
      className="border p-2 rounded"
      onChange={(e) => setCategory(e.target.value)}
    >
      <option value="">Select Category</option>
      <option>General</option>
      <option>OBC</option>
      <option>SC</option>
      <option>ST</option>
    </select>

  </div>
</div>

<div className="border rounded-xl p-6 space-y-4 transition-all duration-200 hover:shadow-md">
  <h2 className="text-lg font-semibold text-gray-700">Address Details</h2>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

    <input
      value={state}
      placeholder="State"
      className="border p-2 rounded"
      onChange={(e) => setState(e.target.value)}
    />

    <input value={city} placeholder="City" className="border p-2 rounded" onChange={(e) => setCity(e.target.value)} />

    <input value={pin} placeholder="PIN Code" className="border p-2 rounded" onChange={(e) => setPin(e.target.value)} />

    <textarea
      value={address}
      placeholder="Full Address"
      className="border p-2 rounded md:col-span-2"
      onChange={(e) => setAddress(e.target.value)}
    />

  </div>
</div>

  {/* ACTION BUTTONS */}
  <div className="flex justify-between items-center">

    <button
      onClick={() => {
        setSelectedType("");
        setSelectedProgram("");
        setSelectedTitle("");

        setPrograms([]);
        setTitles([]);

        setName("");
        setEmail("");
        setMobile("");
        setDob("");
        setGender("");
        setCategory("");
        setState("");
        setAddress("");
        setCity("");
        setPin("");
      }}
      className="text-gray-500 hover:underline"
    >
      Reset
    </button>

    <button
      onClick={handleSubmit}
      disabled={loading}
      className={`bg-green-600 text-white px-8 py-3 rounded-lg font-semibold shadow transition-all duration-200 
      ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-green-700 hover:scale-105"}`}
    >
      {loading ? "Submitting..." : "Submit Application"}
    </button>

  </div>

</div>
  );
}
