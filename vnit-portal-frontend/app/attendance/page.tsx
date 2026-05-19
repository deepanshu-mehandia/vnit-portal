"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { apiFetch } from "@/lib/api";

export default function AttendancePage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [attendance, setAttendance] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch("/attendance/my-courses")
      .then(setCourses)
      .catch((err: any) => toast.error(err.message));
  }, []);

  async function loadStudents(offering_id: number) {
    try {
      setSelectedCourse(offering_id);
      const data = await apiFetch(`/attendance/course/${offering_id}`);
      setStudents(data);

      const initial: Record<number, string> = {};
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
        status: attendance[Number(id)],
      }));

      await apiFetch("/attendance/mark", {
        method: "POST",
        body: JSON.stringify({
          offering_id: selectedCourse,
          date: new Date().toISOString().split("T")[0],
          records,
        }),
      });

      toast.success("Attendance saved");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Mark Attendance</h1>

      <select
        onChange={(e) => loadStudents(Number(e.target.value))}
        className="border p-2 mb-6 rounded-lg w-full max-w-xs"
      >
        <option value="">Select Course</option>
        {courses.map((c) => (
          <option key={c.offering_id} value={c.offering_id}>
            {c.course_code} — {c.course_name}
          </option>
        ))}
      </select>

      <div className="space-y-1">
        {students.map((s) => (
          <div
            key={s.student_id}
            className="flex justify-between items-center p-3 border-b"
          >
            <span className="font-medium">{s.name}</span>
            <select
              value={attendance[s.student_id]}
              onChange={(e) =>
                setAttendance({ ...attendance, [s.student_id]: e.target.value })
              }
              className="border p-1 rounded"
            >
              <option value="present">Present</option>
              <option value="absent">Absent</option>
            </select>
          </div>
        ))}
      </div>

      {students.length > 0 && (
        <button
          onClick={submitAttendance}
          disabled={loading}
          className="mt-6 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Submit Attendance"}
        </button>
      )}
    </div>
  );
}