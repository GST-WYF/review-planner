import sqlite3

DB_NAME = "review_plan.db"

schema = """
CREATE TABLE IF NOT EXISTS Exam (
    exam_id INTEGER PRIMARY KEY AUTOINCREMENT,
    exam_name TEXT NOT NULL,
    priority INTEGER NOT NULL DEFAULT 5 CHECK(priority BETWEEN 0 AND 9)
);

CREATE TABLE IF NOT EXISTS Subject (
    subject_id INTEGER PRIMARY KEY AUTOINCREMENT,
    exam_id INTEGER NOT NULL,
    subject_name TEXT NOT NULL,
    priority INTEGER NOT NULL DEFAULT 5 CHECK(priority BETWEEN 0 AND 9),
    FOREIGN KEY (exam_id) REFERENCES Exam(exam_id)
);

CREATE TABLE IF NOT EXISTS TopicNode (
    topic_id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_id INTEGER NOT NULL,
    parent_id INTEGER,
    name TEXT NOT NULL,
    accuracy REAL CHECK (accuracy BETWEEN 0 AND 1),
    importance INTEGER NOT NULL DEFAULT 5 CHECK(importance BETWEEN 0 AND 9),
    is_leaf BOOLEAN NOT NULL,
    FOREIGN KEY (subject_id) REFERENCES Subject(subject_id),
    FOREIGN KEY (parent_id) REFERENCES TopicNode(topic_id)
);

CREATE TABLE IF NOT EXISTS InputMaterial (
    input_id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id INTEGER NOT NULL,
    type TEXT CHECK(type IN ('note', 'video', 'recite')),
    title TEXT NOT NULL,
    required_hours REAL NOT NULL,
    reviewed_hours REAL NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT 0,
    FOREIGN KEY (topic_id) REFERENCES TopicNode(topic_id)
);

CREATE TABLE IF NOT EXISTS OutputMaterial (
    output_id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_type TEXT CHECK(owner_type IN ('exam', 'subject', 'topic')) NOT NULL,
    owner_id INTEGER NOT NULL,
    type TEXT CHECK(type IN ('exercise_set', 'mock_exam')),
    title TEXT NOT NULL,
    accuracy REAL CHECK (accuracy BETWEEN 0 AND 1),
    required_hours REAL NOT NULL,
    reviewed_hours REAL NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS ReviewTaskLog (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reviewed_at DATE NOT NULL,
    node_type TEXT CHECK(node_type IN ('exam', 'subject', 'topic')) NOT NULL,
    node_id INTEGER NOT NULL,
    input_material_id INTEGER,
    output_material_id INTEGER,
    duration_minutes INTEGER NOT NULL,
    notes TEXT,
    FOREIGN KEY (input_material_id) REFERENCES InputMaterial(input_id),
    FOREIGN KEY (output_material_id) REFERENCES OutputMaterial(output_id)
);

CREATE TABLE IF NOT EXISTS DefaultSchedule (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day_of_week INTEGER NOT NULL, -- 0: 周一, ..., 6: 周日
    start_time TEXT NOT NULL,     -- 'HH:MM'
    end_time TEXT NOT NULL        -- 'HH:MM'
);

CREATE TABLE IF NOT EXISTS SpecialSchedule (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,           -- 'YYYY-MM-DD'
    start_time TEXT NOT NULL,     -- 'HH:MM'
    end_time TEXT NOT NULL        -- 'HH:MM'
);
"""


def initialize_database():
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.executescript(schema)
        conn.commit()
    print("✅ 数据库初始化完成！")


if __name__ == "__main__":
    initialize_database()
