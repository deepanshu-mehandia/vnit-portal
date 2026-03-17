"use client"

import {useState} from "react"
import API from "../../services/api"

export default function Login(){

  const [username,setUsername] = useState("")
  const [password,setPassword] = useState("")

  async function handleLogin(){

    const res = await fetch("http://127.0.0.1:8000/auth/login", {
	method: "POST",
  	headers: { "Content-Type": "application/json" },
  	body: JSON.stringify({ username, password })
    })

    const data = await res.json()

    localStorage.setItem("token", data.access_token)

    window.location.href="/dashboard"

  }

  return(

    <div className="flex h-screen items-center justify-center">

      <div className="bg-white p-8 shadow rounded">

        <input
          placeholder="Username"
          onChange={e=>setUsername(e.target.value)}
        />

        <input
          placeholder="Password"
          type="password"
          onChange={e=>setPassword(e.target.value)}
        />

        <button onClick={handleLogin}>
          Login
        </button>

      </div>

    </div>

  )
}
