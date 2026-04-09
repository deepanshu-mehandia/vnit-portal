"use client";

import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Dashboard
        </h1>
        <p className="text-gray-500">
          Welcome to VNIT Portal
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
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
        {/* Admission Card */}
        <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
          <h2 className="text-xl font-semibold">New Admission</h2>
          <p className="text-gray-500 mt-2">
            Apply for a new admission
          </p>

          <button
            onClick={() => router.push("/admission")}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Start Admission
          </button>
        </div>

        {/* Future Admin */}
        <div className="bg-white p-6 rounded-xl shadow opacity-60">
          <h2 className="text-xl font-semibold">Admin Panel</h2>
          <p className="text-gray-500 mt-2">
            Manage applications (Coming next)
          </p>
        </div>

      </div>

    </div>
  );
}