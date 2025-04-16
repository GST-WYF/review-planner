import sqlite3

DB_NAME = "review_plan.db"

schema = """
CREATE TABLE IF NOT EXISTS Exam (
    exam_id INTEGER PRIMARY KEY AUTOINCREMENT,
    exam_name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Subject (
    subject_id INTEGER PRIMARY KEY AUTOINCREMENT,
    exam_id INTEGER NOT NULL,
    subject_name TEXT NOT NULL,
    FOREIGN KEY (exam_id) REFERENCES Exam(exam_id)
);

CREATE TABLE IF NOT EXISTS TopicNode (
    topic_id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_id INTEGER NOT NULL,
    parent_id INTEGER,
    name TEXT NOT NULL,
    accuracy REAL,
    importance REAL,
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
    FOREIGN KEY (topic_id) REFERENCES TopicNode(topic_id)
);

CREATE TABLE IF NOT EXISTS OutputMaterial (
    output_id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id INTEGER NOT NULL,
    type TEXT CHECK(type IN ('exercise_set', 'mock_exam')),
    title TEXT NOT NULL,
    accuracy REAL,
    FOREIGN KEY (topic_id) REFERENCES TopicNode(topic_id)
);
"""
# CREATE TABLE IF NOT EXISTS OutputMaterial (
#     output_id INTEGER PRIMARY KEY AUTOINCREMENT,
#     owner_type TEXT CHECK(owner_type IN ('exam', 'subject', 'topic')) NOT NULL,
#     owner_id INTEGER NOT NULL,
#     type TEXT CHECK(type IN ('exercise_set', 'mock_exam')),
#     title TEXT NOT NULL,
#     accuracy REAL
# );

def initialize_database():
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.executescript(schema)
        conn.commit()
    print("✅ 数据库初始化完成！")

if __name__ == "__main__":
    initialize_database()
