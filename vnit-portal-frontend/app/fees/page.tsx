"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { apiFetch } from "@/lib/api";

export default function Fees() {
  const router = useRouter();
  const [fees, setFees] = useState<any[]>([]);

  // ✅ auth check
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
    }
  }, []);

  // ✅ fetch data
  useEffect(() => {
    async function loadFees() {
      try {
        const res = await apiFetch("/fees/demand/1");
        setFees(res);
      } catch (err) {
        console.error(err);
      }
    }

    loadFees();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Fee Demands</h2>

      {fees.map((f: any) => (
        <div key={f.demand_id} className="bg-white p-4 shadow mb-3">
          Amount: ₹{f.amount}
          <br />
          Status: {f.status}
        </div>
      ))}
    </div>
  );
}
