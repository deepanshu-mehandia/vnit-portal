"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { apiFetch } from "../utils/api";

export default function AttendancePage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [attendance, setAttendance] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/my-courses`)
    .then(setCourses)
    .catch((err) => toast.error(err.message));
  }, []);

  async function loadStudents(offering_id: number) {
  try {
    setSelectedCourse(offering_id);

    const data = await apiFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/attendance/course/${offering_id}`
    );

    setStudents(data);

    const initial: any = {};
    data.forEach((s: any) => {
      initial[s.student_id] = "present";
    });
    setAttendance(initial);

  } catch (err: any) {
    toast.error(err.message);
  }
}

  async function submitAttendance() {
  try {
    setLoading(true);

    const records = Object.keys(attendance).map((id) => ({
      student_id: Number(id),
      status: attendance[id],
    }));

    await apiFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/attendance/mark`,
      {
        method: "POST",
        body: JSON.stringify({
          offering_id: selectedCourse,
          date: new Date().toISOString().split("T")[0],
          records,
        }),
      }
    );

    toast.success("Attendance saved");

  } catch (err: any) {
    toast.error(err.message);
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Mark Attendance</h1>

      {/* COURSE SELECT */}
      <select
        onChange={(e) => loadStudents(Number(e.target.value))}
        className="border p-2 mb-6"
      >
        <option value="">Select Course</option>
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