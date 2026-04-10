"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) return null;

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500">Welcome to VNIT Portal</p>
        </div>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            router.push("/login");
          }}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Total Applications</p>
          <h2 className="text-2xl font-bold">128</h2>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Approved</p>
          <h2 className="text-2xl font-bold text-green-600">54</h2>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Pending</p>
          <h2 className="text-2xl font-bold text-yellow-600">74</h2>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="grid md:grid-cols-2 gap-6">

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold">New Admission</h2>
          <p className="text-gray-500 mt-2">
            Apply for a new admission
          </p>

          <button
            onClick={() => router.push("/admission")}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Start Admission
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow opacity-60">
          <h2 className="text-xl font-semibold">Admin Panel</h2>
          <p className="text-gray-500 mt-2">
            Coming next
          </p>
        </div>

      </div>

    </div>
  );
}