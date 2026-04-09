from fastapi import APIRouter, HTTPException
from app.database.connection import get_connection
from app.modules.admission.schema import AdmissionCreate

router = APIRouter(prefix="/admission", tags=["Admission"])

@router.post("")
def submit_admission(data: AdmissionCreate):
    try:
        conn = get_connection()
        cur = conn.cursor()

        cur.execute("""
            INSERT INTO admissions 
            (name, email, mobile, dob, gender, category, state, address, program_type_id, program_id, program_title_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            data.name,
            data.email,
            data.mobile,
            data.dob,
            data.gender,
            data.category,
            data.state,
            data.address,
            data.program_type_id,
            data.program_id,
            data.program_title_id
        ))

        admission_id = cur.fetchone()[0]

        conn.commit()
        cur.close()
        conn.close()

        return {
            "message": "Admission submitted",
            "admission_id": admission_id
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))