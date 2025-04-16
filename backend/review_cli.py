
import sqlite3
import argparse
import json
from typing import Optional

DB_NAME = "review_plan.db"

def connect():
    return sqlite3.connect(DB_NAME)

def add_exam(name):
    with connect() as conn:
        conn.execute("INSERT INTO Exam (exam_name) VALUES (?)", (name,))
        conn.commit()
        print("✅ Exam added.")

def add_subject(exam_id, name):
    with connect() as conn:
        conn.execute("INSERT INTO Subject (exam_id, subject_name) VALUES (?, ?)", (exam_id, name))
        conn.commit()
        print("✅ Subject added.")

def add_topic(subject_id, name, is_leaf, parent_id=None, accuracy=None, importance=None):
    with connect() as conn:
        conn.execute(
            "INSERT INTO TopicNode (subject_id, parent_id, name, accuracy, importance, is_leaf) VALUES (?, ?, ?, ?, ?, ?)",
            (subject_id, parent_id, name, accuracy, importance, is_leaf)
        )
        conn.commit()
        print("✅ Topic added.")

def add_input(topic_id, type, title, required_hours, reviewed_hours):
    with connect() as conn:
        conn.execute(
            "INSERT INTO InputMaterial (topic_id, type, title, required_hours, reviewed_hours) VALUES (?, ?, ?, ?, ?)",
            (topic_id, type, title, required_hours, reviewed_hours)
        )
        conn.commit()
        print("✅ Input material added.")

def add_output(topic_id, type, title, accuracy):
    with connect() as conn:
        conn.execute(
            "INSERT INTO OutputMaterial (topic_id, type, title, accuracy) VALUES (?, ?, ?, ?)",
            (topic_id, type, title, accuracy)
        )
        conn.commit()
        print("✅ Output material added.")

def delete_topic(topic_id):
    with connect() as conn:
        conn.execute("DELETE FROM InputMaterial WHERE topic_id = ?", (topic_id,))
        conn.execute("DELETE FROM OutputMaterial WHERE topic_id = ?", (topic_id,))
        conn.execute("DELETE FROM TopicNode WHERE topic_id = ?", (topic_id,))
        conn.commit()
        print("🗑️ Topic deleted.")

def list_exams():
    with connect() as conn:
        rows = conn.execute("SELECT * FROM Exam").fetchall()
        for row in rows:
            print(row)

def list_subjects():
    with connect() as conn:
        rows = conn.execute("SELECT * FROM Subject").fetchall()
        for row in rows:
            print(row)

def list_topics(subject_id: Optional[int] = None):
    with connect() as conn:
        if subject_id:
            rows = conn.execute("SELECT * FROM TopicNode WHERE subject_id = ?", (subject_id,)).fetchall()
        else:
            rows = conn.execute("SELECT * FROM TopicNode").fetchall()
        for row in rows:
            print(row)

def fetch_tree(subject_id: int):
    def get_children(conn, parent_id):
        cursor = conn.cursor()
        cursor.execute(
            "SELECT topic_id, name, accuracy, importance, is_leaf FROM TopicNode WHERE parent_id = ? ORDER BY topic_id",
            (parent_id,)
        )
        children = []
        for row in cursor.fetchall():
            children.append({
                "topic_id": row[0],
                "name": row[1],
                "accuracy": row[2],
                "importance": row[3],
                "is_leaf": row[4],
                "children": get_children(conn, row[0])
            })
        return children

    with connect() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT topic_id, name, accuracy, importance, is_leaf FROM TopicNode WHERE subject_id = ? AND parent_id IS NULL ORDER BY topic_id",
            (subject_id,)
        )
        top_nodes = []
        for row in cursor.fetchall():
            top_nodes.append({
                "topic_id": row[0],
                "name": row[1],
                "accuracy": row[2],
                "importance": row[3],
                "is_leaf": row[4],
                "children": get_children(conn, row[0])
            })
        return top_nodes

def export_tree():
    with connect() as conn:
        subjects = conn.execute("SELECT subject_id, subject_name FROM Subject").fetchall()
        data = []
        for s in subjects:
            data.append({
                "subject_id": s[0],
                "subject_name": s[1],
                "topics": fetch_tree(s[0])
            })
        with open("exported_review_tree.json", "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print("📁 Exported to exported_review_tree.json")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Review DB CLI")
    subparsers = parser.add_subparsers(dest="command")

    sub = subparsers.add_parser("add-exam")
    sub.add_argument("name")

    sub = subparsers.add_parser("add-subject")
    sub.add_argument("exam_id", type=int)
    sub.add_argument("name")

    sub = subparsers.add_parser("add-topic")
    sub.add_argument("subject_id", type=int)
    sub.add_argument("name")
    sub.add_argument("is_leaf", type=bool)
    sub.add_argument("--parent_id", type=int)
    sub.add_argument("--accuracy", type=float)
    sub.add_argument("--importance", type=float)

    sub = subparsers.add_parser("add-input")
    sub.add_argument("topic_id", type=int)
    sub.add_argument("type")
    sub.add_argument("title")
    sub.add_argument("required_hours", type=float)
    sub.add_argument("reviewed_hours", type=float)

    sub = subparsers.add_parser("add-output")
    sub.add_argument("topic_id", type=int)
    sub.add_argument("type")
    sub.add_argument("title")
    sub.add_argument("accuracy", type=float)

    sub = subparsers.add_parser("delete-topic")
    sub.add_argument("topic_id", type=int)

    subparsers.add_parser("list-exams")
    subparsers.add_parser("list-subjects")

    sub = subparsers.add_parser("list-topics")
    sub.add_argument("--subject_id", type=int)

    subparsers.add_parser("export-tree")

    args = parser.parse_args()

    if args.command == "add-exam":
        add_exam(args.name)
    elif args.command == "add-subject":
        add_subject(args.exam_id, args.name)
    elif args.command == "add-topic":
        add_topic(args.subject_id, args.name, args.is_leaf, args.parent_id, args.accuracy, args.importance)
    elif args.command == "add-input":
        add_input(args.topic_id, args.type, args.title, args.required_hours, args.reviewed_hours)
    elif args.command == "add-output":
        add_output(args.topic_id, args.type, args.title, args.accuracy)
    elif args.command == "delete-topic":
        delete_topic(args.topic_id)
    elif args.command == "list-exams":
        list_exams()
    elif args.command == "list-subjects":
        list_subjects()
    elif args.command == "list-topics":
        list_topics(args.subject_id)
    elif args.command == "export-tree":
        export_tree()
    else:
        parser.print_help()
