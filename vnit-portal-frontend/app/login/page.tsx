"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Login() {
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

    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Login failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.role);

      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen flex">

      {/* LEFT IMAGE */}
      <div className="hidden md:flex w-1/2 relative">
        <Image
          src="/assets/campus.jpg"
          alt="VNIT Campus"
          fill
          className="object-cover"
        />
      </div>

      {/* RIGHT LOGIN */}
      <div className="flex flex-1 items-center justify-center bg-gray-100">

        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md space-y-6">

          <h1 className="text-3xl font-bold text-center">
            VNIT Portal
          </h1>

          <p className="text-center text-gray-500 text-sm">
            Login to continue
          </p>

          {/* USERNAME */}
          <input
            placeholder="Username / Email"
            className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />

          {/* PASSWORD */}
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              placeholder="Password"
              className="w-full border p-3 rounded-lg pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />

            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-3 top-3 text-sm text-gray-500"
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

        </div>
      </div>
    </div>
  );
}