"use client"

import { useEffect, useState } from "react";
import API from "../../services/api";

export default function Students() {

  const [student,setStudent] = useState<any>(null)

  useEffect(()=>{

    API.get("/students/1")
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
