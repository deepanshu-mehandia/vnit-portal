"use client"

import { useEffect, useState } from "react";
import API from "../../services/api";

export default function Fees(){

  const [fees,setFees] = useState([])

  useEffect(()=>{

    API.get("/fees/demand/1")
    .then(res=>{
      setFees(res.data)
    })

  },[])

  return (

    <div>

      <h2 className="text-xl font-bold mb-4">
        Fee Demands
      </h2>

      {fees.map((f:any)=>(
        <div key={f.demand_id}
        className="bg-white p-4 shadow mb-3">

          Amount: ₹{f.amount}
          <br/>
          Status: {f.status}

        </div>
      ))}

    </div>

  )
}
