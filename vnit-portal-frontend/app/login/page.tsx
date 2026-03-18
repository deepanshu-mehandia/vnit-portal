"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { api } from "@/lib/api"

localStorage.setItem("token", res.access_token)
localStorage.setItem("role", res.role)

export default function Login(){

  const router = useRouter()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async () => {

    const res = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password })
    })

    if(res.access_token){
      localStorage.setItem("token", res.access_token)
      router.push("/dashboard")
    } else {
      alert("Invalid credentials")
    }
  }

  return (

    <div className="h-screen flex">

      {/* LEFT - Image */}
      <div className="hidden md:block w-1/2 relative">

        <Image
          src="/assets/campus.jpg"
          alt="VNIT"
          fill
          className="object-cover"
        />

        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <h1 className="text-white text-3xl font-bold">
            VNIT Portal
          </h1>
        </div>

      </div>

      {/* RIGHT - Login */}
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-900">

        <div className="w-full max-w-md p-8 space-y-6">

          {/* Logo */}
          <div className="flex justify-center">
            <Image src="/assets/logo.png" alt="VNIT" width={60} height={60} />
          </div>

          <h2 className="text-center text-2xl font-bold">
            Login
          </h2>

          {/* Inputs */}
          <input
            type="text"
            placeholder="Username"
            className="w-full p-3 border rounded"
            value={username}
            onChange={(e)=>setUsername(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border rounded"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
          />

          {/* Button */}
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700"
          >
            Login
          </button>

        </div>

      </div>

    </div>
  )
}
