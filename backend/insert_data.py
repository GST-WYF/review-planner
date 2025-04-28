import sqlite3

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


def insert_data():
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()

        # 插入【技能考试】
        cursor.execute(
            "INSERT INTO Exam (exam_name, priority) VALUES (?, ?)",
            (SKILL_EXAM_NAME, 5),
        )
        skill_exam_id = cursor.lastrowid

        for subj in skill_subjects:
            cursor.execute(
                "INSERT INTO Subject (exam_id, subject_name, priority) VALUES (?, ?, ?)",
                (skill_exam_id, subj, 5),
            )

        # 插入【笔试】
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

        conn.commit()

insert_data()
print("✅ 两个考试和科目数据插入完成！")
