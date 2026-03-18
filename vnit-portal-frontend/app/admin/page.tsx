"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useRouter } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"
import Chart from "@/components/charts"
import { getUserRole } from "@/lib/auth"

useEffect(() => {

  if (!isAuthenticated()) {
    router.push("/login")
  }

  if (getUserRole() !== "admin") {
    router.push("/dashboard")
  }

}, [])

export default function AdminDashboard(){

  const [stats, setStats] = useState<any>({})
  const [courses, setCourses] = useState<any[]>([])
  const [recent, setRecent] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login")
    }
  }, [])
  
  useEffect(() => {
    Promise.all([
      api("/admin/stats"),
      api("/admin/course-popularity"),
      api("/admin/recent")
    ]).then(([s, c, r]) => {
      setStats(s)
      setCourses(c)
      setRecent(r)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="p-6">Loading dashboard...</div>

  return (

    <div className="p-6 space-y-6">

      {/* Title */}
      <h1 className="text-3xl font-bold">
        Admin Dashboard
      </h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow">
          <p className="text-sm">Students</p>
          <h2 className="text-2xl font-bold">{stats.students}</h2>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow">
          <p className="text-sm">Registrations</p>
          <h2 className="text-2xl font-bold">{stats.registrations}</h2>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow">
          <p className="text-sm">Courses</p>
          <h2 className="text-2xl font-bold">{stats.courses}</h2>
        </div>

      </div>

      {/* Charts + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-xl shadow">

          <h2 className="text-lg font-semibold mb-4">
            Course Popularity
          </h2>

          <Chart data={courses} />

        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow">

          <h2 className="text-lg font-semibold mb-4">
            Recent Registrations
          </h2>

          <div className="space-y-2">
            {recent.map((r, i) => (
              <div key={i} className="flex justify-between text-sm border-b pb-1">
                <span>{r.student}</span>
                <span className="text-gray-500">{r.course}</span>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  )
}
