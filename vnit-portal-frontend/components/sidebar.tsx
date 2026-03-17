import Link from "next/link"

const menu = [
  {name:"Dashboard",path:"/dashboard"},
  {name:"Registration",path:"/registration"},
  {name:"Fees",path:"/fees"},
  {name:"Hostel",path:"/hostel"},
  {name:"Student Profile",path:"/students"}
]

export default function Sidebar(){

  return(

    <div className="w-64 h-screen bg-blue-900 text-white p-6">

      <h2 className="text-2xl font-bold mb-8">
        VNIT ERP
      </h2>

      {menu.map((item,index)=>(

        <Link key={index} href={item.path}>

          <div className="p-3 rounded hover:bg-blue-700 transition">

            {item.name}

          </div>

        </Link>

      ))}

    </div>

  )
}
