"use client"

import { useEffect, useState } from "react";
import API from "../../services/api";

export default function Registration() {

  const [courses,setCourses] = useState([])

  useEffect(()=>{

    API.get("/registration/courses/1")
    .then(res=>{
      setCourses(res.data)
    })

  },[])

  return (

    <div>

      <h2 className="text-xl font-bold mb-4">
        Course Registration
      </h2>

      <table className="w-full bg-white shadow">

        <thead>

          <tr>
            <th>Course Code</th>
            <th>Course Name</th>
          </tr>

        </thead>

        <tbody>

          {courses.map((c:any,index)=>(
            <tr key={index}>
              <td>{c.code}</td>
              <td>{c.name}</td>
            </tr>
          ))}

        </tbody>

      </table>

    </div>
  )
}
