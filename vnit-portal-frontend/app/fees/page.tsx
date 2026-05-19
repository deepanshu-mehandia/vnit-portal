"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { apiFetch } from "@/lib/api";

export default function Fees() {
  const router = useRouter();
  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/");
      return;
    }

    async function loadFees() {
      try {
        const studentId = localStorage.getItem("student_id");
        if (!studentId) {
          router.push("/dashboard");
          return;
        }
        const res = await apiFetch(`/fees/demand/${studentId}`);
        setFees(res || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadFees();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold">Fee Demands</h2>

      {fees.length === 0 ? (
        <p className="text-gray-500">No fee demands found.</p>
      ) : (
        fees.map((f: any) => (
          <div
            key={f.demand_id}
            className="bg-white p-4 shadow rounded-xl flex justify-between items-center"
          >
            <div>
              <p className="text-lg font-semibold">₹{f.amount}</p>
              <p className="text-sm text-gray-500">Demand ID: {f.demand_id}</p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                f.status === "paid"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {f.status}
            </span>
          </div>
        ))
      )}
    </div>
  );
}