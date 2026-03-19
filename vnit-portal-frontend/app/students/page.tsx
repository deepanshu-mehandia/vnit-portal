"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"
import { api } from "@/lib/api"; 

const router = useRouter()

useEffect(() => {
  if (!isAuthenticated()) {
    router.push("/login")
  }
}, [])

export default function Students() {

  const [student,setStudent] = useState<any>(null)

  useEffect(()=>{

    api.get("/students/1")
    .then(res=>{
      setStudent(res.data)
    })

  },[])

  if(!student) return <div>Loading...</div>

  return (

    <div className="bg-white p-6 rounded shadow">

      <h2 className="text-xl font-bold mb-4">
        Student Profile
      </h2>

      <p>Name: {student.name}</p>
      <p>Email: {student.email}</p>
      <p>Mobile: {student.mobile}</p>

    </div>

  )
}
