"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export default function Dashboard() {
  const router = useRouter();

  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
  });

  const [student, setStudent] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("role");

    if (!token) {
      router.push("/login");
      return;
    }

    setRole(userRole);

    async function loadData() {
      try {
        // 🔥 ADMIN → load stats
        if (userRole === "admin") {
          const data = await apiFetch("/admin/stats");
          setStats(data);
        }

        // 🔥 STUDENT → load profile
        if (userRole === "student") {
          const data = await apiFetch("/students/me");
          setStudent(data);
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500">
            Welcome to VNIT Portal ({role})
          </p>
        </div>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            router.push("/login");
          }}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* ================= ADMIN VIEW ================= */}
      {role === "admin" && (
        <>
          {/* STATS */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-500 text-sm">Total Applications</p>
              <h2 className="text-2xl font-bold">{stats.total}</h2>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-500 text-sm">Approved</p>
              <h2 className="text-2xl font-bold text-green-600">
                {stats.approved}
              </h2>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-500 text-sm">Pending</p>
              <h2 className="text-2xl font-bold text-yellow-600">
                {stats.pending}
              </h2>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
              <h2 className="text-xl font-semibold">Admin Panel</h2>
              <p className="text-gray-500 mt-2">
                Manage students and approvals
              </p>

              <button
                onClick={() => router.push("/admin")}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Open Admin Panel
              </button>
            </div>
          </div>
        </>
      )}

      {/* ================= STUDENT VIEW ================= */}
      {role === "student" && (
        <>
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">My Profile</h2>

            {student ? (
              <div className="space-y-2 text-gray-700">
                <p><strong>Name:</strong> {student.name}</p>
                <p><strong>Email:</strong> {student.email}</p>
                <p><strong>Mobile:</strong> {student.mobile}</p>
              </div>
            ) : (
              <p>Loading profile...</p>
            )}
          </div>
        </>
      )}

      {/* ================= FACULTY VIEW ================= */}
      {role === "faculty" && (
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold">Faculty Dashboard</h2>
          <p className="text-gray-500 mt-2">
            Approve or reject student registrations
          </p>

          <button
            onClick={() => router.push("/admin")}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            View Pending Approvals
          </button>
        </div>
      )}

    </div>
  );
}