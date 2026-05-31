from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.modules.auth.routes           import router as auth_router
from app.modules.students.routes       import router as student_router
from app.modules.admin.routes          import router as admin_router
from app.modules.admin.management      import router as management_router
from app.modules.programs.routes       import router as program_router
from app.modules.admission.routes      import router as admission_router
from app.modules.courses.routes        import router as courses_router
from app.modules.registrations.routes  import router as registrations_router
from app.modules.attendance.routes     import router as attendance_router
from app.modules.fees.routes           import router as fees_router
from app.modules.hostel.routes         import router as hostel_router
from app.modules.marks.routes          import router as marks_router
from app.modules.sessions.routes       import router as session_router
from app.modules.notifications.routes  import router as notifications_router   # ← NEW

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://vnit-portal.vercel.app",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(student_router)
app.include_router(admin_router)
app.include_router(management_router)
app.include_router(program_router)
app.include_router(admission_router)
app.include_router(courses_router)
app.include_router(registrations_router)
app.include_router(attendance_router)
app.include_router(fees_router)
app.include_router(hostel_router)
app.include_router(marks_router)
app.include_router(session_router)
app.include_router(notifications_router)   # ← NEW

@app.get("/")
def root():
    return {"message": "VNIT Portal API running"}