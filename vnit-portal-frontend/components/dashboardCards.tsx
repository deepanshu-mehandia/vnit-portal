"use client"

import { motion } from "framer-motion"

const cards = [
  { title: "Credits Earned", value: 78 },
  { title: "Current CGPA", value: 8.2 },
  { title: "Registered Courses", value: 6 },
  { title: "Pending Fees", value: "₹12000" }
]

export default function DashboardCards(){

  return (

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">

      {cards.map((card,index)=>(
        <motion.div
          key={index}
          initial={{opacity:0,y:20}}
          animate={{opacity:1,y:0}}
          transition={{delay:index*0.1}}
          className="bg-white shadow rounded-xl p-6 hover:shadow-xl transition">

          <h3 className="text-gray-500 text-sm">
            {card.title}
          </h3>

          <p className="text-3xl font-bold mt-2">
            {card.value}
          </p>

        </motion.div>
      ))}

    </div>

  )
}
