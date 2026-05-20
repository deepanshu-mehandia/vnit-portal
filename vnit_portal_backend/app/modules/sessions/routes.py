from fastapi import APIRouter
from datetime import datetime

router = APIRouter(prefix="/session", tags=["Session"])


@router.get("/current")
def get_current_session():
    now   = datetime.now()
    month = now.month
    year  = now.year

    if 7 <= month <= 12:           # July – December  →  Odd / Winter semester
        code    = f"W{str(year)[2:]}"
        sem_num = 1
        ay      = f"{year}-{year + 1}"
        label   = f"Odd Semester — July to December {year}"
    else:                          # January – June   →  Even / Spring semester
        code    = f"S{str(year)[2:]}"
        sem_num = 2
        ay      = f"{year - 1}-{year}"
        label   = f"Even Semester — January to June {year}"

    return {
        "session":     code,
        "semester":    sem_num,
        "year":        ay,
        "label":       f"Academic Year {ay} · {label}",
        "short_label": f"{code} | Sem {sem_num}",
    }