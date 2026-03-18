import Image from "next/image"

const modules = [
  { name: "Examination", icon: "/assets/icons/examination.png" },
  { name: "Registration", icon: "/assets/icons/registration.png" },
  { name: "Fee Management", icon: "/assets/icons/fee.png" },
  { name: "Faculty Advisor", icon: "/assets/icons/faculty.png" },
  { name: "Hostel", icon: "/assets/icons/hostel.png" },
  { name: "Election", icon: "/assets/icons/election.png" },
  { name: "Feedback", icon: "/assets/icons/feedback.png" },
]

export default function ModulesGrid(){

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

      {modules.map((m, i) => (
        <div key={i} className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow hover:shadow-lg transition">

          <div className="flex items-center gap-4">

            <Image src={m.icon} alt={m.name} width={40} height={40} />

            <div>
              <h3 className="font-semibold">{m.name}</h3>
              <p className="text-xs text-gray-500">Module</p>
            </div>

          </div>

        </div>
      ))}

    </div>
  )
}
