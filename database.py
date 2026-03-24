import sqlite3
from datetime import datetime

DB_NAME = "alzheimer_events.db"

def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            track_id INTEGER,
            event_type TEXT,
            event_time TIMESTAMP,
            duration REAL,
            confidence REAL,
            image_path TEXT
        )
    """)
    conn.commit()
    conn.close()

def save_event(tid, event_type, duration, conf, img_path):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO events (track_id, event_type, event_time, duration, confidence, image_path) VALUES (?, ?, ?, ?, ?, ?)",
        (tid, event_type, datetime.now(), round(duration, 2), round(conf, 4), img_path)
    )
    conn.commit()
    conn.close()