
import sqlite3

DB_NAME = "review_plan.db"

def insert_sample_data():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    # 添加考试和科目
    cursor.execute("INSERT INTO Exam (exam_name) VALUES ('模拟考试 A')")
    exam_id = cursor.lastrowid

    cursor.execute("INSERT INTO Subject (exam_id, subject_name) VALUES (?, ?)", (exam_id, '数学'))
    subject_id = cursor.lastrowid

    # 添加非叶子节点知识点
    cursor.execute("INSERT INTO TopicNode (subject_id, parent_id, name, accuracy, importance, is_leaf) VALUES (?, ?, ?, ?, ?, ?)",
                   (subject_id, None, '函数基础', 0.75, None, False))
    parent_id = cursor.lastrowid

    # 添加叶子节点知识点
    leaf_nodes = [
        ('函数定义', parent_id, 0.8, 0.9),
        ('函数图像', parent_id, 0.6, 0.7),
        ('奇偶性与周期性', parent_id, 0.7, 0.6)
    ]

    for name, pid, acc, imp in leaf_nodes:
        cursor.execute("INSERT INTO TopicNode (subject_id, parent_id, name, accuracy, importance, is_leaf) VALUES (?, ?, ?, ?, ?, ?)",
                       (subject_id, pid, name, acc, imp, True))
        topic_id = cursor.lastrowid

        # 输入材料
        cursor.execute("INSERT INTO InputMaterial (topic_id, type, title, required_hours, reviewed_hours) VALUES (?, ?, ?, ?, ?)",
                       (topic_id, 'note', f'{name} 笔记', 1.5, 1.0))
        # 输出材料
        cursor.execute("INSERT INTO OutputMaterial (topic_id, type, title, accuracy) VALUES (?, ?, ?, ?)",
                       (topic_id, 'exercise_set', f'{name} 练习题', acc))

    conn.commit()
    conn.close()
    print("✅ 测试数据已插入")

if __name__ == "__main__":
    insert_sample_data()
