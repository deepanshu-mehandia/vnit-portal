"use client";

import { useEffect, useState } from "react";

export default function CourseRegistration() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/available`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCourses(data);
        } else {
          console.error("Invalid data", data);
          setCourses([]);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  async function handleRegister(offering_id: number) {
    const student_id = localStorage.getItem("student_id");

    if (!student_id) {
      alert("Login again");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/registrations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            student_id: Number(student_id),
            offering_id,
          }),
        }
      );

      const data = await res.json();

      alert(data.message);
    } catch (err) {
      console.error(err);
      alert("Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">

      <h1 className="text-3xl font-bold mb-6">
        Course Registration
      </h1>

      <div className="grid gap-6">

        {courses.map((course) => (
          <div
            key={course.offering_id}
            className="bg-white p-6 rounded-xl shadow flex justify-between items-center"
          >
            <div>
              <h2 className="text-lg font-semibold">
                {course.course_code} - {course.course_name}
              </h2>

              <p className="text-sm text-gray-500">
                Faculty: {course.faculty}
              </p>

              <p className="text-sm text-gray-500">
                Credits: {course.credits}
              </p>

              <p className="text-sm text-gray-500">
                Capacity: {course.capacity}
              </p>
            </div>

            <button
              onClick={() => handleRegister(course.offering_id)}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Register
            </button>
          </div>
        ))}

      </div>

    </div>
  );
}