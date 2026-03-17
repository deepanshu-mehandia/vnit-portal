"use client"

import { motion } from "framer-motion"
import Link from "next/link"

const modules = [

  {name:"Registration",path:"/registration",icon:"📘"},
  {name:"Fees",path:"/fees",icon:"💳"},
  {name:"Hostel",path:"/hostel",icon:"🏠"},
  {name:"Student Profile",path:"/students",icon:"👤"},
  {name:"Results",path:"/results",icon:"📊"},
  {name:"Feedback",path:"/feedback",icon:"⭐"}

]

export default function ModulesGrid(){

  return(

    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">

      {modules.map((module,index)=>(

        <Link key={index} href={module.path}>

          <motion.div
            whileHover={{scale:1.05}}
            className="bg-white shadow rounded-xl p-6 text-center cursor-pointer">

            <div className="text-3xl mb-3">
              {module.icon}
            </div>

            <h3 className="text-sm font-semibold">
              {module.name}
            </h3>

          </motion.div>

        </Link>

      ))}

    </div>

  )
}
