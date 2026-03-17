export default function Notifications(){

  const notifications = [
    "Course registration opens tomorrow",
    "Fee payment deadline approaching",
    "Exam timetable released"
  ]

  return(

    <div className="bg-white shadow rounded p-6">

      <h3 className="text-lg font-bold mb-4">
        Notifications
      </h3>

      <ul className="space-y-3">

        {notifications.map((n,i)=>(
          <li key={i}
          className="border-b pb-2">
            {n}
          </li>
        ))}

      </ul>

    </div>

  )
}
