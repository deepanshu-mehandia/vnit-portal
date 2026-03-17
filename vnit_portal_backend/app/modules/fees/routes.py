from fastapi import APIRouter
from app.database.connection import get_connection

router = APIRouter(prefix="/fees")

@router.get("/demand/{student_id}")

def get_fee(student_id:int):

    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT demand_id,amount,status
            FROM fee_demand
            WHERE student_id = :1
        """,[student_id])

        rows = cur.fetchall()

        result = []

        for r in rows:
            result.append({
                "demand_id":r[0],
                "amount":r[1],
                "status":r[2]
            })

        return result

    finally:
        cur.close()
        conn.close()
