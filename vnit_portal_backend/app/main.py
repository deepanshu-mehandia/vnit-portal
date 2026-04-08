from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.modules.auth.routes import router as auth_router
from app.modules.students.routes import router as student_router
from app.modules.registration.routes import router as reg_router
from app.modules.admin.routes import router as admin_router
from app.modules.programs.routes import router as program_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(student_router)
app.include_router(reg_router)
app.include_router(admin_router)
app.include_router(program_router)

@app.get("/")
def root():
    return {"message": "VNIT Portal API running"}
