from fastapi import APIRouter, Depends, HTTPException
from app.database.connection import get_connection
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/fees")

@router.get("/demand/{student_id}")
def get_fee(student_id: int, user=Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            SELECT demand_id, amount, status
            FROM fee_demand
            WHERE student_id = %s
        """, (student_id,))

        rows = cur.fetchall()

        return [
            {
                "demand_id": r[0],
                "amount": r[1],
                "status": r[2]
            }
            for r in rows
        ]

    finally:
        cur.close()
        conn.close()