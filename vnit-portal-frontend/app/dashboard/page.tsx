"use client";

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"
import ModulesGrid from "../../components/modulesGrid"
import DashboardCards from "../../components/dashboardCards"
import Charts from "../../components/charts"
import Notifications from "../../components/notifications"
import Image from "next/image"

const router = useRouter()

useEffect(() => {
  if (!isAuthenticated()) {
    router.push("/login")
  }
}, [])

export default function Dashboard(){

  return(

    <div className="space-y-8">

      {/* Hero Section */}
      <div className="relative h-48 rounded-xl overflow-hidden">

        <Image
          src="/assets/campus.jpg"
          alt="VNIT"
          fill
          className="object-cover"
        />

        <div className="absolute inset-0 bg-black/40 flex items-center px-6">
          <h1 className="text-white text-2xl font-bold">
            Welcome to VNIT Portal
          </h1>
        </div>

      </div>

      {/* Modules */}
      <ModulesGrid />

      {/* Dashboard Cards */}
      <DashboardCards />

      {/* Charts + Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2">
          <Charts />
        </div>

        <Notifications />

      </div>

    </div>

  )
}
