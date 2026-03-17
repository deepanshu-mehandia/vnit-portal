import oracledb

DB_USER = "vnit_portal"
DB_PASSWORD = "strongpassword"
DB_DSN = "localhost:1521/XEPDB1"

def get_connection():
    connection = oracledb.connect(
        user=DB_USER,
        password=DB_PASSWORD,
        dsn=DB_DSN
    )
    return connection
