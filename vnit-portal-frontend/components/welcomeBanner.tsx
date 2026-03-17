"use client"

import { motion } from "framer-motion"

export default function WelcomeBanner(){

  return(

    <motion.div
      initial={{opacity:0,y:20}}
      animate={{opacity:1,y:0}}
      className="bg-gradient-to-r from-blue-700 to-blue-500 text-white p-6 rounded-xl shadow">

      <h2 className="text-2xl font-bold">
        Welcome Deepanshu 👋
      </h2>

      <p className="text-sm mt-2">
        Academic Year 2025-26
      </p>

    </motion.div>

  )
}
