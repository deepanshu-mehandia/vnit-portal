"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { api } from "@/lib/api";

export default function Registration() {
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const id = 1;

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
    }
  }, []);

  useEffect(() => {
    async function register() {
      await api("/registration/add?offering_id=" + id, {
        method: "POST",
      });
    }

    register();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Course Registration</h2>

      <table className="w-full bg-white shadow">
        <thead>
          <tr>
            <th>Course Code</th>
            <th>Course Name</th>
          </tr>
        </thead>

        <tbody>
          {courses.map((c: any, index) => (
            <tr key={index}>
              <td>{c.code}</td>
              <td>{c.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
