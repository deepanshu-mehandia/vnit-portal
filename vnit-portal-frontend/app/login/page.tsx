"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function Login() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e: any) {
    e.preventDefault();

    try {
      const res = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      // ✅ NOW res exists
      localStorage.setItem("token", res.access_token);
      localStorage.setItem("role", res.role);

      // redirect
      if (res.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }

    } catch (err) {
      console.error(err);
      alert("Login failed");
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <input
        placeholder="Username"
        onChange={(e) => setUsername(e.target.value)}
        className="border p-2"
      />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2"
      />
      <button className="bg-blue-500 text-white px-4 py-2">
        Login
      </button>
    </form>
  );
}
