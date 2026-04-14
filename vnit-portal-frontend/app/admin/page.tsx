"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  const [role, setRole] = useState<string | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("role");

    if (userRole !== "admin" && userRole !== "faculty") {
      router.push("/dashboard");
      return;
    }

    if (!token) {
      router.push("/login");
      return;
    }

    setRole(userRole);

    async function loadData() {
      try {
        // ADMIN → load students
        if (userRole === "admin") {
          const res = await apiFetch("/admin/students/all");
          setStudents(res);
        }

        // FACULTY → load pending approvals
        if (userRole === "faculty") {
          const res = await apiFetch("/admin/faculty/pending");
          setPending(res);
        }

      } catch (err) {
        console.error(err);
      }
    }

    loadData();
  }, []);

  // ================= ADMIN =================
  async function assignAdvisor(student_id: number) {
    const faculty_id = prompt("Enter Faculty ID:");

    if (!faculty_id) return;

    await apiFetch("/admin/assign-advisor", {
      method: "POST",
      body: JSON.stringify({
        student_ids: [student_id],
        faculty_id: Number(faculty_id),
      }),
    });

    alert("Advisor assigned");
  }

  // ================= FACULTY =================
  async function approve(reg_id: number) {
    await apiFetch("/admin/faculty/approve", {
      method: "POST",
      body: JSON.stringify({ reg_id }),
    });

    alert("Approved");
  }

  async function reject(reg_id: number) {
    await apiFetch("/admin/faculty/reject", {
      method: "POST",
      body: JSON.stringify({ reg_id }),
    });

    alert("Rejected");
  }

  return (
    <div className="space-y-8">

      <h1 className="text-3xl font-bold text-gray-800">
        Admin Panel
      </h1>

      {/* ================= ADMIN VIEW ================= */}
      {role === "admin" && (
        <div className="bg-white p-6 rounded-xl shadow">

          <h2 className="text-xl font-semibold mb-4">
            All Students
          </h2>

          <div className="space-y-3">
            {students.map((s) => (
              <div
                key={s.student_id}
                className="flex justify-between items-center border p-3 rounded-lg"
              >
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-sm text-gray-500">{s.email}</p>
                </div>

                <button
                  onClick={() => assignAdvisor(s.student_id)}
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Assign Advisor
                </button>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ================= FACULTY VIEW ================= */}
      {role === "faculty" && (
        <div className="bg-white p-6 rounded-xl shadow">

          <h2 className="text-xl font-semibold mb-4">
            Pending Approvals
          </h2>

          <div className="space-y-3">
            {pending.map((p) => (
              <div
                key={p.reg_id}
                className="flex justify-between items-center border p-3 rounded-lg"
              >
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-sm text-gray-500">
                    {p.course_name}
                  </p>
                </div>

                <div className="space-x-2">
                  <button
                    onClick={() => approve(p.reg_id)}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => reject(p.reg_id)}
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}