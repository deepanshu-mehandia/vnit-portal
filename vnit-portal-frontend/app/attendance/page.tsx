"use client";

import { useEffect, useState } from "react";

export default function AttendancePage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [attendance, setAttendance] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/available`)
      .then(res => res.json())
      .then(setCourses);
  }, []);

  async function loadStudents(offering_id: number) {
    setSelectedCourse(offering_id);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/attendance/course/${offering_id}`
    );

    const data = await res.json();
    setStudents(data);

    // initialize attendance
    const initial: any = {};
    data.forEach((s: any) => {
      initial[s.student_id] = "present";
    });
    setAttendance(initial);
  }

  async function submitAttendance() {
    const token = localStorage.getItem("token");

    const records = Object.keys(attendance).map((id) => ({
      student_id: Number(id),
      status: attendance[id],
    }));

    setLoading(true);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/attendance/mark`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          offering_id: selectedCourse,
          date: new Date().toISOString().split("T")[0],
          records,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.detail || "Failed");
      return;
    }

    alert("Attendance saved");
    setLoading(false);
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Mark Attendance</h1>

      {/* COURSE SELECT */}
      <select
        onChange={(e) => loadStudents(Number(e.target.value))}
        className="border p-2 mb-6"
      >
        <option>Select Course</option>
        {courses.map((c) => (
          <option key={c.offering_id} value={c.offering_id}>
            {c.course_code}
          </option>
        ))}
      </select>

      {/* STUDENTS */}
      {students.map((s) => (
        <div key={s.student_id} className="flex justify-between p-2 border-b">
          <span>{s.name}</span>

          <select
            value={attendance[s.student_id]}
            onChange={(e) =>
              setAttendance({
                ...attendance,
                [s.student_id]: e.target.value,
              })
            }
          >
            <option value="present">Present</option>
            <option value="absent">Absent</option>
          </select>
        </div>
      ))}

      {students.length > 0 && (
        <button
          onClick={submitAttendance}
          className="mt-6 bg-green-600 text-white px-6 py-2 rounded"
        >
          {loading ? "Saving..." : "Submit Attendance"}
        </button>
      )}
    </div>
  );
}