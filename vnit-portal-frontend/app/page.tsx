"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!username || !password) {
      alert("Enter username and password");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Login failed");
        return;
      }

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.role);

      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Login failed");
    } finally {
      setLoading(false);
    }
  }

  // 🔥 ENTER KEY SUPPORT
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      handleLogin();
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* LEFT IMAGE */}
      <div className="hidden md:block w-1/2 relative">
        <Image
          src="/assets/campus.jpg"
          alt="VNIT Campus"
          fill
          className="object-cover"
        />

        {/* overlay */}
        <div className="absolute inset-0 bg-black/30 flex items-end p-10">
          <h1 className="text-white text-3xl font-bold">
            VNIT Nagpur Academic Portal
          </h1>
        </div>
      </div>

      {/* RIGHT LOGIN */}
      <div className="flex w-full md:w-1/2 items-center justify-center bg-gray-100">

        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md space-y-6">

          <h1 className="text-2xl font-bold text-center">
            VNIT Portal
          </h1>

          <p className="text-center text-gray-500">
            Login to continue
          </p>

          {/* USERNAME */}
          <input
            placeholder="Username / Email"
            className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          {/* PASSWORD */}
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              placeholder="Password"
              className="w-full border p-3 rounded-lg pr-16 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />

            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-3 top-3 text-sm text-blue-600"
            >
              {show ? "Hide" : "Show"}
            </button>
          </div>

          {/* LOGIN BUTTON */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* 🔥 NEW REGISTRATION (IMPORTANT) */}
          <button
            onClick={() => router.push("/admission")}
            className="w-full border border-blue-600 text-blue-600 py-3 rounded-lg hover:bg-blue-50 transition"
          >
            New Registration
          </button>

        </div>
      </div>
    </div>
  );
}