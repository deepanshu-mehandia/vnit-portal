"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const API = process.env.NEXT_PUBLIC_API_URL;

const stateCityMap: any = {
   "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur"],
    "Arunachal Pradesh": ["Itanagar", "Tawang"],
    "Assam": ["Guwahati", "Silchar", "Dibrugarh"],
    "Bihar": ["Patna", "Gaya", "Muzaffarpur"],
    "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur"],
    "Goa": ["Panaji", "Margao"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
    "Haryana": ["Gurgaon", "Faridabad", "Panipat"],
    "Himachal Pradesh": ["Shimla", "Dharamshala"],
    "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad"],
    "Karnataka": ["Bangalore", "Mysore", "Hubli"],
    "Kerala": ["Kochi", "Thiruvananthapuram", "Kozhikode"],
    "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik"],
    "Manipur": ["Imphal"],
    "Meghalaya": ["Shillong"],
    "Mizoram": ["Aizawl"],
    "Nagaland": ["Kohima", "Dimapur"],
    "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela"],
    "Punjab": ["Chandigarh", "Ludhiana", "Amritsar"],
    "Rajasthan": ["Jaipur", "Udaipur", "Jodhpur", "Kota"],
    "Sikkim": ["Gangtok"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
    "Telangana": ["Hyderabad", "Warangal"],
    "Tripura": ["Agartala"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Noida", "Varanasi"],
    "Uttarakhand": ["Dehradun", "Haridwar"],
    "West Bengal": ["Kolkata", "Howrah", "Durgapur"],
    "Delhi": ["New Delhi"],
    "Jammu and Kashmir": ["Srinagar", "Jammu"],
    "Ladakh": ["Leh"],
    "Chandigarh": ["Chandigarh"],
    "Puducherry": ["Puducherry"],
    "Andaman and Nicobar Islands": ["Port Blair"],
    "Dadra and Nagar Haveli and Daman and Diu": ["Daman", "Diu"]
};

export default function Admission() {
  const [types, setTypes] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [titles, setTitles] = useState<any[]>([]);

  const [selectedType, setSelectedType] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedTitle, setSelectedTitle] = useState("");

  const [cities, setCities] = useState<string[]>([]);

  const [form, setForm] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    father_name: "",
    mother_name: "",
    email: "",
    mobile: "",
    dob: "",
    gender: "",
    category: "",
    state: "",
    city: "",
    pin: "",
    address: "",
    aadhaar: "",
    blood_group: "",
  });

  const [loading, setLoading] = useState(false);

  // LOAD TYPES
  useEffect(() => {
    fetch(`${API}/programs/types`)
      .then(res => res.json())
      .then(setTypes);
  }, []);

  // TYPE CHANGE
  async function handleType(e: any) {
    const id = e.target.value;
    setSelectedType(id);
    setSelectedProgram("");
    setSelectedTitle("");

    const res = await fetch(`${API}/programs/${id}`);
    setPrograms(await res.json());
  }

  // PROGRAM CHANGE
  async function handleProgram(e: any) {
    const id = e.target.value;
    setSelectedProgram(id);
    setSelectedTitle("");

    const res = await fetch(`${API}/programs/titles/${id}`);
    setTitles(await res.json());
  }

  // STATE CHANGE
  function handleState(e: any) {
    const state = e.target.value;
    setForm({ ...form, state, city: "" });

    setCities(stateCityMap[state] || []);
  }

  function update(key: string, value: string) {
    setForm({ ...form, [key]: value });
  }

  async function handleSubmit() {
    if (!form.first_name || !form.email || !form.mobile) {
      toast.error("Fill required fields");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API}/admission`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          program_type_id: selectedType,
          program_id: selectedProgram,
          program_title_id: selectedTitle,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.detail || "Failed");
        return;
      }
      if (data.message === "You have already applied") {
        toast.error(data.message);
        return;
      }

      toast.success("Admission Successful", { duration: 2000 });

      setTimeout(() => (window.location.href = "/"), 1500);

    } catch {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-10">

      <h1 className="text-3xl font-bold">Admission Form</h1>

      {/* PROGRAM */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <h2 className="font-semibold text-lg">Program Details</h2>

        <div className="grid md:grid-cols-3 gap-4">
          <select onChange={handleType} className="input">
            <option>Program Type</option>
            {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>

          <select onChange={handleProgram} className="input">
            <option>Program</option>
            {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>

          <select onChange={(e)=>setSelectedTitle(e.target.value)} className="input">
            <option>Program Title</option>
            {titles.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>
        </div>
      </div>

      {/* PERSONAL */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <h2 className="font-semibold text-lg">Personal Details</h2>

        <div className="grid md:grid-cols-3 gap-4">
          <input placeholder="First Name" onChange={e=>update("first_name", e.target.value)} className="input"/>
          <input placeholder="Middle Name" onChange={e=>update("middle_name", e.target.value)} className="input"/>
          <input placeholder="Last Name" onChange={e=>update("last_name", e.target.value)} className="input"/>

          <input placeholder="Father Name" onChange={e=>update("father_name", e.target.value)} className="input"/>
          <input placeholder="Mother Name" onChange={e=>update("mother_name", e.target.value)} className="input"/>

          <input placeholder="Email" onChange={e=>update("email", e.target.value)} className="input"/>
          <input placeholder="Mobile" onChange={e=>update("mobile", e.target.value)} className="input"/>

          <input type="date" onChange={e=>update("dob", e.target.value)} className="input"/>

          <input placeholder="Aadhaar" onChange={e=>update("aadhaar", e.target.value)} className="input"/>
          <input placeholder="Blood Group" onChange={e=>update("blood_group", e.target.value)} className="input"/>

          <select onChange={e=>update("gender", e.target.value)} className="input">
            <option>Gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>

          <select onChange={e=>update("category", e.target.value)} className="input">
            <option>Category</option>
            <option>General</option>
            <option>OBC</option>
            <option>SC</option>
            <option>ST</option>
          </select>
        </div>
      </div>

      {/* ADDRESS */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <h2 className="font-semibold text-lg">Address Details</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <select onChange={handleState} className="input">
            <option>Select State</option>
            {Object.keys(stateCityMap).map(s => <option key={s}>{s}</option>)}
          </select>

          <select onChange={e=>update("city", e.target.value)} className="input">
            <option>Select City</option>
            {cities.map(c => <option key={c}>{c}</option>)}
          </select>

          <input placeholder="PIN" onChange={e=>update("pin", e.target.value)} className="input"/>

          <textarea placeholder="Address" onChange={e=>update("address", e.target.value)} className="input md:col-span-2"/>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-green-600 text-white px-6 py-3 rounded"
      >
        {loading ? "Submitting..." : "Submit"}
      </button>

    </div>
  );
}