"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegistrationPage() {
  const router = useRouter();

  const [form, setForm] = useState<any>({
    program_type_id: "",
    program_id: "",
    program_title_id: "",
    category: "",

    first_name: "",
    middle_name: "",
    last_name: "",
    father_name: "",
    mother_name: "",
    gender: "",
    blood_group: "",
    dob: "",
    mobile: "",
    email: "",
    aadhaar: "",

    address: "",
    country: "India",
    state: "",
    city: "",
    pin: "",
  });

  const [loading, setLoading] = useState(false);

  function update(key: string, value: any) {
    setForm({ ...form, [key]: value });
  }

  async function handleSubmit() {
    // 🔥 basic validation
    if (!form.first_name || !form.email || !form.mobile) {
      alert("Fill all required fields");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admission`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name:
              form.first_name +
              " " +
              (form.middle_name || "") +
              " " +
              form.last_name,
            email: form.email,
            mobile: form.mobile,
            dob: form.dob,
            gender: form.gender,
            category: form.category,
            state: form.state,
            address: form.address,
            program_type_id: Number(form.program_type_id),
            program_id: Number(form.program_id),
            program_title_id: Number(form.program_title_id),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Registration failed");
        return;
      }

      alert("Registration successful! Check your email.");

      router.push("/");
    } catch (err) {
      console.error(err);
      alert("Error occurred");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    window.location.reload();
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">

      <h1 className="text-3xl font-bold">Student Registration</h1>

      {/* ================= PROGRAM ================= */}
      <section className="bg-white p-6 rounded-xl shadow space-y-4">
        <h2 className="text-xl font-semibold">Program Details</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <input placeholder="Program Type ID" onChange={(e) => update("program_type_id", e.target.value)} className="input" />
          <input placeholder="Program ID" onChange={(e) => update("program_id", e.target.value)} className="input" />
          <input placeholder="Program Title ID" onChange={(e) => update("program_title_id", e.target.value)} className="input" />
          <input placeholder="Category" onChange={(e) => update("category", e.target.value)} className="input" />
        </div>
      </section>

      {/* ================= PERSONAL ================= */}
      <section className="bg-white p-6 rounded-xl shadow space-y-4">
        <h2 className="text-xl font-semibold">Personal Details</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <input placeholder="First Name*" onChange={(e) => update("first_name", e.target.value)} className="input" />
          <input placeholder="Middle Name" onChange={(e) => update("middle_name", e.target.value)} className="input" />
          <input placeholder="Last Name" onChange={(e) => update("last_name", e.target.value)} className="input" />
          <input placeholder="Father Name" onChange={(e) => update("father_name", e.target.value)} className="input" />
          <input placeholder="Mother Name" onChange={(e) => update("mother_name", e.target.value)} className="input" />
          <input placeholder="Gender" onChange={(e) => update("gender", e.target.value)} className="input" />
          <input placeholder="Blood Group" onChange={(e) => update("blood_group", e.target.value)} className="input" />
          <input type="date" onChange={(e) => update("dob", e.target.value)} className="input" />
          <input placeholder="Mobile*" onChange={(e) => update("mobile", e.target.value)} className="input" />
          <input placeholder="Email*" onChange={(e) => update("email", e.target.value)} className="input" />
          <input placeholder="Aadhaar No" onChange={(e) => update("aadhaar", e.target.value)} className="input" />
        </div>
      </section>

      {/* ================= ADDRESS ================= */}
      <section className="bg-white p-6 rounded-xl shadow space-y-4">
        <h2 className="text-xl font-semibold">Address Details</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <input placeholder="Address" onChange={(e) => update("address", e.target.value)} className="input" />
          <input placeholder="Country" defaultValue="India" onChange={(e) => update("country", e.target.value)} className="input" />
          <input placeholder="State" onChange={(e) => update("state", e.target.value)} className="input" />
          <input placeholder="City" onChange={(e) => update("city", e.target.value)} className="input" />
          <input placeholder="PIN" onChange={(e) => update("pin", e.target.value)} className="input" />
        </div>
      </section>

      {/* BUTTONS */}
      <div className="flex gap-4">
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-6 py-2 rounded"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>

        <button
          onClick={handleReset}
          className="bg-gray-300 px-6 py-2 rounded"
        >
          Reset
        </button>
      </div>
    </div>
  );
}