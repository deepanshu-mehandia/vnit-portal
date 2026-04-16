import os
from psycopg2 import pool

connection_pool = None

def init_connection_pool():
    global connection_pool

    if connection_pool is None:
        connection_pool = pool.SimpleConnectionPool(
            1,
            5,  # keep LOW for Supabase free tier
            host=os.getenv("DB_HOST"),
            database=os.getenv("DB_NAME"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            port=5432
        )

def get_connection():
    init_connection_pool()
    return connection_pool.getconn()

def release_connection(conn):
    if connection_pool:
        connection_pool.putconn(conn)