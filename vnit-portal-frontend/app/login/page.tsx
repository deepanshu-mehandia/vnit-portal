"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    if (!username || !password) {
      alert("Enter username and password");
      return;
    }

    try {
      const res = await fetch("https://vnit-portal.onrender.com/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.detail || "Login failed");
        return;
      }

      const data = await res.json();

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.role);

      router.push("/dashboard");

    } catch (err) {
      console.error(err);
      alert("Login failed");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md space-y-6">

        <h1 className="text-2xl font-bold text-center">
          Login
        </h1>

        <input
          placeholder="Username"
          className="w-full border p-3 rounded"
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-3 rounded"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
        >
          Login
        </button>

      </div>
    </div>
  );
}