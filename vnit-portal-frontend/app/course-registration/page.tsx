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
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        alert("Login again");
        return;
      }

      // 🔥 STEP 1: get student info
      const userRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/students/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!userRes.ok) {
        alert("Session expired. Login again.");
        return;
      }

      const userData = await userRes.json();
      console.log("FULL userData:", userData);

      // 🔥 SAFE extraction (handles all cases)
      const student_id =
        userData.student_id ||
        userData.id ||
        userData?.student?.student_id;

      if (!student_id) {
        console.error("Invalid student response:", userData);
        alert("Could not get student ID");
        return;
      }

      console.log("student_id:", student_id);
      console.log("offering_id:", offering_id);

      // 🔥 STEP 2: register course
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/registrations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            student_id,
            offering_id,
          }),
        }
      );

      const data = await res.json();
      console.log("REGISTER RESPONSE:", data);

      if (!res.ok) {
        if (Array.isArray(data.detail)) {
          alert(data.detail[0].msg);
        } else {
          alert(data.detail || "Registration failed");
        }
        return;
      }

      alert("Registered successfully");

    } catch (err) {
      console.error(err);
      alert("Something went wrong");
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
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}