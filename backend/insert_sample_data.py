import sqlite3
import random

DB_NAME = "review_plan.db"

EXAM_NAME = "8月22日中医执医考试"
subjects = [
    "中基",
    "中诊",
    "中药",
    "方剂",
    "经典",
    "内科",
    "外科",
    "儿科",
    "妇产科",
    "针灸",
]
material_types = ["note", "video", "recite"]
output_types = ["exercise_set", "mock_exam"]
time_options = [0.5, 1.0, 1.5, 2.0]


def insert_data():
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()

        # 插入考试
        cursor.execute("INSERT INTO Exam (exam_name) VALUES (?)", (EXAM_NAME,))
        exam_id = cursor.lastrowid

        for subj in subjects:
            # 插入科目
            cursor.execute(
                "INSERT INTO Subject (exam_id, subject_name) VALUES (?, ?)",
                (exam_id, subj),
            )
            subject_id = cursor.lastrowid

            # 插入知识点
            for i in range(1, 3):
                topic_name = f"{subj}-{i}"
                cursor.execute(
                    """
                    INSERT INTO TopicNode (subject_id, parent_id, name, accuracy, importance, is_leaf)
                    VALUES (?, NULL, ?, NULL, NULL, 1)
                """,
                    (subject_id, topic_name),
                )
                topic_id = cursor.lastrowid

                # 插入输入材料
                for mtype in material_types:
                    title = f"{topic_name}-{mtype}"
                    required_hours = random.choice(time_options)
                    cursor.execute(
                        """
                        INSERT INTO InputMaterial (topic_id, type, title, required_hours, reviewed_hours, is_completed)
                        VALUES (?, ?, ?, ?, 0, 0)
                    """,
                        (topic_id, mtype, title, required_hours),
                    )

                # 插入输出材料（知识点级）
                required_hours = random.choice(time_options)
                cursor.execute(
                    """
                    INSERT INTO OutputMaterial (
                        owner_type, owner_id, type, title, accuracy,
                        required_hours, reviewed_hours, is_completed
                    )
                    VALUES ('topic', ?, ?, ?, NULL, ?, 0, 0)
                """,
                    (
                        topic_id,
                        random.choice(output_types),
                        f"{topic_name}-题集",
                        required_hours,
                    ),
                )

        # 插入默认时间安排
        for day in range(7):
            cursor.execute(
                """
                INSERT INTO DefaultSchedule (day_of_week, start_time, end_time)
                VALUES (?, ?, ?)
            """,
                (day, "12:30", "13:30"),
            )
            cursor.execute(
                """
                INSERT INTO DefaultSchedule (day_of_week, start_time, end_time)
                VALUES (?, ?, ?)
            """,
                (day, "20:00", "22:00"),
            )

        conn.commit()

        # 插入 exam 级别的复习卷
        cursor.execute("SELECT exam_id, exam_name FROM Exam")
        for exam_id, exam_name in cursor.fetchall():
            for i in range(1, 3):
                cursor.execute(
                    """
                    INSERT INTO OutputMaterial (
                        owner_type, owner_id, type, title, accuracy,
                        required_hours, reviewed_hours, is_completed
                    )
                    VALUES ('exam', ?, 'mock_exam', ?, NULL, 2.0, 0, 0)
                """,
                    (exam_id, f"{exam_name}-复习卷{i}"),
                )

        # 插入 subject 级别的复习卷
        cursor.execute("SELECT subject_id, subject_name FROM Subject")
        for subject_id, subject_name in cursor.fetchall():
            for i in range(1, 3):
                cursor.execute(
                    """
                    INSERT INTO OutputMaterial (
                        owner_type, owner_id, type, title, accuracy,
                        required_hours, reviewed_hours, is_completed
                    )
                    VALUES ('subject', ?, 'mock_exam', ?, NULL, 1.0, 0, 0)
                """,
                    (subject_id, f"{subject_name}-复习卷{i}"),
                )

        conn.commit()


insert_data()
print("✅ 数据插入完成！")
