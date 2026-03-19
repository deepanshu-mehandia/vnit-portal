"use client";

import { BarChart, Bar, XAxis, YAxis } from "recharts"

export default function Chart({data}:any){

  return (
    <BarChart width={500} height={300} data={data}>
      <XAxis dataKey="course" />
      <YAxis />
      <Bar dataKey="count" />
    </BarChart>
  )
}
