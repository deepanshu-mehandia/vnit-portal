"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { apiFetch } from "@/lib/api";

export default function Students() {
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);

  // 🔐 auth check
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
    }
  }, []);

  // 📦 fetch data
  useEffect(() => {
    async function loadStudent() {
      try {
        const res = await apiFetch("/students/me");
        setStudent(res);
      } catch (err) {
        console.error(err);
      }
    }

    loadStudent();
  }, []);

  if (!student) return <div className="p-6">Loading...</div>;

  const fullName = `${student.first_name} ${student.middle_name || ""} ${student.last_name}`;

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8">

      <h1 className="text-3xl font-bold">Student Profile</h1>

      {/* PERSONAL DETAILS */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-4">Personal Details</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <p><b>Full Name:</b> {fullName}</p>
          <p><b>Email:</b> {student.email}</p>
          <p><b>Mobile:</b> {student.mobile}</p>
          <p><b>Date of Birth:</b> {student.dob}</p>
          <p><b>Gender:</b> {student.gender}</p>
          <p><b>Category:</b> {student.category}</p>
          <p><b>Blood Group:</b> {student.blood_group}</p>
          <p><b>Aadhaar:</b> {student.aadhaar}</p>
          <p><b>Father Name:</b> {student.father_name}</p>
          <p><b>Mother Name:</b> {student.mother_name}</p>
        </div>
      </div>

      {/* ACADEMIC DETAILS */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-4">Academic Details</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <p><b>Program Type ID:</b> {student.program_type_id}</p>
          <p><b>Program ID:</b> {student.program_id}</p>
          <p><b>Program Title ID:</b> {student.program_title_id}</p>
          <p><b>Branch ID:</b> {student.branch_id}</p>
          <p><b>Advisor ID:</b> {student.advisor_id}</p>
          <p><b>Roll Number:</b> {student.roll_number}</p>
        </div>
      </div>

      {/* ADDRESS */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-4">Address Details</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <p><b>State:</b> {student.state}</p>
          <p><b>City:</b> {student.city}</p>
          <p><b>PIN:</b> {student.pin}</p>
          <p className="md:col-span-2">
            <b>Address:</b> {student.address}
          </p>
        </div>
      </div>

    </div>
  );
}