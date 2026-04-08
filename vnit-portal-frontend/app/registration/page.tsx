"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { api } from "@/lib/api";

export default function Registration() {
  const router = useRouter();

  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    loadCourses();
  }, []);

  async function loadCourses() {
    try {
      const res = await api("/registration/courses");
      setCourses(res);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleRegister(offeringId: number) {
    try {
      await api(`/registration/add?offering_id=${offeringId}`, {
        method: "POST",
      });
      alert("Registered successfully");
    } catch (err) {
      console.error(err);
      alert("Registration failed");
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Course Registration</h2>

      <table className="w-full bg-white shadow">
        <thead>
          <tr>
            <th>Course Code</th>
            <th>Course Name</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {courses.map((c: any, index) => (
            <tr key={index}>
              <td>{c.course_code}</td>
              <td>{c.course_name}</td>
              <td>
                <button
                  onClick={() => handleRegister(c.offering_id)}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  Register
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
