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
        const res = await apiFetch("/students/1"); // ✅ correct
        setStudent(res); // ✅ no .data
      } catch (err) {
        console.error(err);
      }
    }

    loadStudent();
  }, []);

  if (!student) return <div>Loading...</div>;

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">
        Student Profile
      </h2>

      <p>Name: {student.name}</p>
      <p>Email: {student.email}</p>
      <p>Mobile: {student.mobile}</p>
    </div>
  );
}
