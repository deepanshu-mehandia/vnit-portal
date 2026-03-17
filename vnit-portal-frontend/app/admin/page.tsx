export default function Admin(){

  return(

    <div>

      <h1 className="text-3xl font-bold">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-4 gap-6">

        <div className="card">Students: 5000</div>
        <div className="card">Courses: 120</div>
        <div className="card">Registrations: 4300</div>
        <div className="card">Fees: ₹2.3 Cr</div>

      </div>

    </div>

  )
}
