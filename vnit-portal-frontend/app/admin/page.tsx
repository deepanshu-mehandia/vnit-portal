"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"

export default function AdminDashboard(){

  const [stats, setStats] = useState<any>({})
  const [courses, setCourses] = useState<any[]>([])
  const [recent, setRecent] = useState<any[]>([])

  useEffect(() => {

    api("/admin/stats").then(setStats)
    api("/admin/course-popularity").then(setCourses)
    api("/admin/recent").then(setRecent)

  }, [])

  return (

    <div className="p-6 space-y-8">

      <h1 className="text-2xl font-bold">
        Admin Dashboard
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">

        <div className="bg-white p-4 shadow rounded">
          Students: {stats.students}
        </div>

        <div className="bg-white p-4 shadow rounded">
          Registrations: {stats.registrations}
        </div>

        <div className="bg-white p-4 shadow rounded">
          Courses: {stats.courses}
        </div>

      </div>

      {/* Course popularity */}
      <div className="bg-white p-4 shadow rounded">

        <h2 className="font-semibold mb-3">
          Course Popularity
        </h2>

        {courses.map((c, i) => (
          <div key={i} className="flex justify-between border-b py-1">
            <span>{c.course}</span>
            <span>{c.count}</span>
          </div>
        ))}

      </div>

      {/* Recent registrations */}
      <div className="bg-white p-4 shadow rounded">

        <h2 className="font-semibold mb-3">
          Recent Registrations
        </h2>

        {recent.map((r, i) => (
          <div key={i} className="flex justify-between border-b py-1">
            <span>{r.student}</span>
            <span>{r.course}</span>
          </div>
        ))}

      </div>

    </div>
  )
}
