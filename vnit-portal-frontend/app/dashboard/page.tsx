import WelcomeBanner from "../../components/welcomeBanner"
import ModulesGrid from "../../components/modulesGrid"
import DashboardCards from "../../components/dashboardCards"
import Charts from "../../components/charts"
import Notifications from "../../components/notifications"
import Image from "next/image"

export default function Dashboard(){

  return(

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

  )
}
