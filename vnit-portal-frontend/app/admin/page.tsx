"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { isAuthenticated, getUserRole } from "@/lib/auth";
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("@/components/charts"), {
	ssr: false,
});

export default function AdminPage() {
  const router = useRouter();

  const [stats, setStats] = useState<any>({});
  const [courses, setCourses] = useState<any[]>([]);
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ AUTH GUARD
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    if (getUserRole() !== "admin") {
      router.push("/dashboard");
      return;
    }
  }, []);

  // ✅ DATA FETCH
  useEffect(() => {
    async function fetchData() {
      const [s, c, r] = await Promise.all([
        apiFetch("/admin/stats"),
        apiFetch("/admin/course-popularity"),
        apiFetch("/admin/recent"),
      ]);

      setStats(s);
      setCourses(c);
      setRecent(r);
      setLoading(false);
    }

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-3xl font-bold">
        Admin Dashboard
      </h1>

      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="bg-blue-500 text-white p-6 rounded-xl">
          <p>Students</p>
          <h2>{stats.students}</h2>
        </div>

        <div className="bg-green-500 text-white p-6 rounded-xl">
          <p>Registrations</p>
          <h2>{stats.registrations}</h2>
        </div>

        <div className="bg-purple-500 text-white p-6 rounded-xl">
          <p>Courses</p>
          <h2>{stats.courses}</h2>
        </div>

      </div>

      {/* Charts + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-xl shadow">
          <h2 className="mb-4">Course Popularity</h2>
          <Chart data={courses} />
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow">
          <h2 className="mb-4">Recent Registrations</h2>

          {recent.map((r, i) => (
            <div key={i} className="flex justify-between text-sm border-b pb-1">
              <span>{r.student}</span>
              <span>{r.course}</span>
            </div>
          ))}

        </div>

      </div>

    </div>
  );
}
