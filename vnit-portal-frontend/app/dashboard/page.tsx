import WelcomeBanner from "../../components/welcomeBanner"
import ModulesGrid from "../../components/modulesGrid"
import DashboardCards from "../../components/dashboardCards"
import Charts from "../../components/charts"
import Notifications from "../../components/notifications"

export default function Dashboard(){

  return(

    <div className="space-y-8">

      <WelcomeBanner/>

      <ModulesGrid/>

      <DashboardCards/>

      <div className="grid grid-cols-3 gap-6">

        <div className="col-span-2">
          <Charts/>
        </div>

        <Notifications/>

      </div>

    </div>

  )
}
