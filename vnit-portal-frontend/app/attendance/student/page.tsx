"use client";

import { useEffect, useState } from "react";

export default function StudentAttendance() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAttendance();
  }, []);

  async function loadAttendance() {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/attendance/student`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error(err);
      alert("Failed to load attendance");
    } finally {
      setLoading(false);
    }
  }

  function getColor(percentage: number) {
    if (percentage >= 75) return "text-green-600";
    if (percentage >= 60) return "text-yellow-500";
    return "text-red-600";
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">

      <h1 className="text-3xl font-bold mb-6">
        My Attendance
      </h1>

      {loading ? (
        <p>Loading...</p>
      ) : data.length === 0 ? (
        <p>No attendance data available</p>
      ) : (
        <div className="space-y-4">

          {data.map((course, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow flex justify-between items-center"
            >
              <div>
                <h2 className="text-lg font-semibold">
                  {course.course_code} - {course.course_name}
                </h2>

                <p className="text-sm text-gray-500">
                  Present: {course.present} / {course.total}
                </p>
              </div>

              <div className="text-right">
                <p className={`text-xl font-bold ${getColor(course.percentage)}`}>
                  {course.percentage}%
                </p>

                {course.percentage < 75 && (
                  <p className="text-sm text-red-500">
                    ⚠ Low Attendance
                  </p>
                )}
              </div>
            </div>
          ))}

        </div>
      )}
    </div>
  );
}