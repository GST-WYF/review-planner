import sqlite3
import random

DB_NAME = "review_plan.db"

# 两个考试名称
WRITTEN_EXAM_NAME = "8月22日——中医执业医师资格考试（笔试）"
SKILL_EXAM_NAME = "6月14日——中医执业医师实践技能考试（技能）"

# 科目与优先级（笔试）
written_subjects_with_priority = [
    (8, "针灸学"),
    (7, "中医基础理论"),
    (7, "中医诊断学"),
    (6, "中药学"),
    (6, "方剂学"),
    (5, "中医内科学"),
    (5, "中医外科学"),
    (5, "中医妇科学"),
    (5, "中医儿科学"),
    (5, "内科学"),
    (5, "诊断学基础"),
    (4, "中医四大经典"),
    (4, "传染学"),
    (4, "医学伦理学"),
    (4, "卫生法规"),
]

# 科目（技能考试）
skill_subjects = ["第一站", "第二站", "第三站"]

material_types = ["note", "video", "recite"]
output_types = ["exercise_set", "mock_exam"]
time_options = [0.5, 1.0, 1.5, 2.0]


def insert_data():
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()

        ### 插入【技能】
        cursor.execute(
            "INSERT INTO Exam (exam_name, priority) VALUES (?, ?)",
            (SKILL_EXAM_NAME, 6),
        )
        skill_exam_id = cursor.lastrowid

        for subj in skill_subjects:
            cursor.execute(
                "INSERT INTO Subject (exam_id, subject_name, priority) VALUES (?, ?, ?)",
                (skill_exam_id, subj, 5),
            )

        ### 插入【笔试】
        cursor.execute(
            "INSERT INTO Exam (exam_name, priority) VALUES (?, ?)",
            (WRITTEN_EXAM_NAME, 5),
        )
        written_exam_id = cursor.lastrowid

        for priority, subj in written_subjects_with_priority:
            cursor.execute(
                "INSERT INTO Subject (exam_id, subject_name, priority) VALUES (?, ?, ?)",
                (written_exam_id, subj, priority),
            )
            subject_id = cursor.lastrowid

            # 插入知识点
            for i in range(1, 3):
                topic_name = f"{subj}-{i}"
                accuracy = round(random.uniform(0.0, 1.0), 2)
                importance = random.randint(0, 9)
                cursor.execute(
                    """
                    INSERT INTO TopicNode (
                        subject_id, parent_id, name,
                        accuracy, importance, is_leaf
                    )
                    VALUES (?, NULL, ?, ?, ?, 1)
                """,
                    (subject_id, topic_name, accuracy, importance),
                )
                topic_id = cursor.lastrowid

                # 输入材料
                for mtype in material_types:
                    title = f"{topic_name}-{mtype}"
                    required_hours = random.choice(time_options)
                    cursor.execute(
                        """
                        INSERT INTO InputMaterial (
                            topic_id, type, title,
                            required_hours, reviewed_hours, is_completed
                        )
                        VALUES (?, ?, ?, ?, 0, 0)
                    """,
                        (topic_id, mtype, title, required_hours),
                    )

                # 输出材料（知识点级）
                required_hours = random.choice(time_options)
                accuracy = round(random.uniform(0.0, 1.0), 2)
                cursor.execute(
                    """
                    INSERT INTO OutputMaterial (
                        owner_type, owner_id, type, title, accuracy,
                        required_hours, reviewed_hours, is_completed
                    )
                    VALUES ('topic', ?, ?, ?, ?, ?, 0, 0)
                """,
                    (
                        topic_id,
                        random.choice(output_types),
                        f"{topic_name}-题集",
                        accuracy,
                        required_hours,
                    ),
                )

        ### 默认时间安排（共用）
        for day in range(7):
            cursor.execute(
                "INSERT INTO DefaultSchedule (day_of_week, start_time, end_time) VALUES (?, ?, ?)",
                (day, "12:30", "13:30"),
            )
            cursor.execute(
                "INSERT INTO DefaultSchedule (day_of_week, start_time, end_time) VALUES (?, ?, ?)",
                (day, "20:00", "22:00"),
            )

        conn.commit()

        ### 插入考试级别复习卷
        cursor.execute("SELECT exam_id, exam_name FROM Exam")
        for exam_id, exam_name in cursor.fetchall():
            for i in range(1, 3):
                accuracy = round(random.uniform(0.0, 1.0), 2)
                cursor.execute(
                    """
                    INSERT INTO OutputMaterial (
                        owner_type, owner_id, type, title, accuracy,
                        required_hours, reviewed_hours, is_completed
                    )
                    VALUES ('exam', ?, 'mock_exam', ?, ?, 2.0, 0, 0)
                """,
                    (exam_id, f"{exam_name}-复习卷{i}", accuracy),
                )

        ### 插入科目级别复习卷（仅有 TopicNode 的才插）
        cursor.execute("SELECT subject_id, subject_name FROM Subject")
        for subject_id, subject_name in cursor.fetchall():
            # 查询是否有 TopicNode
            cursor.execute(
                "SELECT COUNT(*) FROM TopicNode WHERE subject_id = ?",
                (subject_id,),
            )
            has_topic = cursor.fetchone()[0] > 0
            if has_topic:
                for i in range(1, 3):
                    accuracy = round(random.uniform(0.0, 1.0), 2)
                    cursor.execute(
                        """
                        INSERT INTO OutputMaterial (
                            owner_type, owner_id, type, title, accuracy,
                            required_hours, reviewed_hours, is_completed
                        )
                        VALUES ('subject', ?, 'mock_exam', ?, ?, 1.0, 0, 0)
                    """,
                        (subject_id, f"{subject_name}-复习卷{i}", accuracy),
                    )

        conn.commit()

insert_data()
print("✅ 两个考试的数据插入完成！")
