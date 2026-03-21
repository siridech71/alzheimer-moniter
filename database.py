import psycopg2
import psycopg2.extras
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

def get_conn():
    return psycopg2.connect(
        host=os.getenv("PG_HOST", "localhost"),
        port=int(os.getenv("PG_PORT", 5432)),
        user=os.getenv("PG_USER", "postgres"),
        password=os.getenv("PG_PASS", ""),
        dbname=os.getenv("PG_DB", "alzheimer_db"),
    )

def init_db() -> None:
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS events (
            event_id    SERIAL PRIMARY KEY,
            track_id    INTEGER,
            event_type  VARCHAR(50),
            event_time  TIMESTAMP,
            duration    FLOAT,
            confidence  FLOAT,
            image_path  TEXT
        )
    """)
    conn.commit()
    cursor.close()
    conn.close()
    print("[DB] PostgreSQL พร้อมแล้ว")

def save_event(track_id, event_type, duration, confidence, image_path):
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute(
        """INSERT INTO events
           (track_id, event_type, event_time, duration, confidence, image_path)
           VALUES (%s, %s, %s, %s, %s, %s)""",
        (track_id, event_type, datetime.now(),
         round(duration, 2), round(confidence, 4), image_path)
    )
    conn.commit()
    cursor.close()
    conn.close()

def get_recent_events(limit=20):
    conn = get_conn()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cursor.execute(
        "SELECT * FROM events ORDER BY event_id DESC LIMIT %s",
        (limit,)
    )
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return [dict(r) for r in rows]