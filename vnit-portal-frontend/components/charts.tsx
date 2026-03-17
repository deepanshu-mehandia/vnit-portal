"use client"

import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
} from "chart.js"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
)

export default function Charts(){

  const data = {
    labels:["Sem1","Sem2","Sem3","Sem4"],
    datasets:[
      {
        label:"CGPA Trend",
        data:[7.5,7.8,8.0,8.2],
        borderColor:"blue"
      }
    ]
  }

  return(

    <div className="bg-white p-6 shadow rounded">

      <h3 className="text-lg font-bold mb-4">
        CGPA Trend
      </h3>

      <Line data={data} />

    </div>

  )
}
