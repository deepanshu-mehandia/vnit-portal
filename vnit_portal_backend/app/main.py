from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.modules.auth.routes import router as auth_router
from app.modules.students.routes import router as student_router
from app.modules.registration.routes import router as registration_router
from app.modules.fees.routes import router as fee_router
from app.modules.hostel.routes import router as hostel_router


# ✅ FIRST create app
app = FastAPI(title="VNIT Portal API")


# ✅ THEN add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ✅ THEN include routers
app.include_router(auth_router)
app.include_router(student_router)
app.include_router(registration_router)
app.include_router(fee_router)
app.include_router(hostel_router)


# ✅ root route
@app.get("/")
def root():
    return {"message": "VNIT Portal API running"}
