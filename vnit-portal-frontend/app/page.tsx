"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-100 to-gray-100">

      <div className="bg-white p-10 rounded-2xl shadow-xl text-center space-y-6 w-[400px]">

        <h1 className="text-3xl font-bold text-gray-800">
          VNIT Portal
        </h1>

        <p className="text-gray-500">
          Academic Management System
        </p>

        <div className="space-y-4">

          <button
            onClick={() => router.push("/dashboard")}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Go to Dashboard
          </button>

          <button
            onClick={() => router.push("/admission")}
            className="w-full border border-gray-300 py-2 rounded-lg hover:bg-gray-100 transition"
          >
            New Admission
          </button>

        </div>

      </div>

    </div>
  );
}