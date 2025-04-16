def find_outputs_by_topic(dag, topic_id):
    return [
        tid
        for tid, node in dag.items()
        if node["task"]["type"] == "output" and node["task"]["topic_id"] == topic_id
    ]


def find_outputs_by_subject(dag, subject_id):
    return [
        tid
        for tid, node in dag.items()
        if node["task"]["type"] == "output" and node["task"]["subject_id"] == subject_id
    ]


def find_outputs_by_exam(dag, exam_id):
    return [
        tid
        for tid, node in dag.items()
        if node["task"]["type"] == "output" and node["task"]["exam_id"] == exam_id
    ]


def build_task_dag(conn):
    dag = {}
    id_map = {}

    cursor = conn.cursor()

    ### Step 1: 加载 InputMaterial
    cursor.execute("SELECT * FROM InputMaterial")
    for row in cursor.fetchall():
        task_id = f"input_{row['input_id']}"
        dag[task_id] = {
            "task": {
                "task_id": task_id,
                "type": "input",
                "material_id": row["input_id"],
                "topic_id": row["topic_id"],
                "required_hours": row["required_hours"],
                "reviewed_hours": row["reviewed_hours"],
                "is_completed": bool(row["is_completed"]),
                "subject_id": None,
                "exam_id": None,
                "is_leaf": True,
            },
            "deps": set(),
        }

    ### Step 2: 加载 OutputMaterial
    cursor.execute("SELECT * FROM OutputMaterial")
    for row in cursor.fetchall():
        task_id = f"output_{row['output_id']}"
        dag[task_id] = {
            "task": {
                "task_id": task_id,
                "type": "output",
                "material_id": row["output_id"],
                "required_hours": row["required_hours"],
                "reviewed_hours": row["reviewed_hours"],
                "is_completed": bool(row["is_completed"]),
                "subject_id": None,
                "exam_id": None,
                "topic_id": None,
                "is_leaf": False,
            },
            "deps": set(),
        }

    ### Step 3: 补充 output 的 owner 类型（绑定 topic/subject/exam）
    for task_id, node in dag.items():
        task = node["task"]
        if task["type"] == "output":
            cursor.execute(
                "SELECT owner_type, owner_id FROM OutputMaterial WHERE output_id = ?",
                (task["material_id"],),
            )
            owner_type, owner_id = cursor.fetchone()
            if owner_type == "topic":
                task["topic_id"] = owner_id
            elif owner_type == "subject":
                task["subject_id"] = owner_id
            elif owner_type == "exam":
                task["exam_id"] = owner_id

    ### Step 4: 建立依赖关系

    # 4.1 input ➜ topic output
    for task_id, node in dag.items():
        task = node["task"]
        if task["type"] == "output" and task["topic_id"]:
            topic_id = task["topic_id"]
            for other_id, other_node in dag.items():
                other_task = other_node["task"]
                if other_task["type"] == "input" and other_task["topic_id"] == topic_id:
                    node["deps"].add(other_task["task_id"])

    # 4.2 子 topic output ➜ 父 topic output
    cursor.execute(
        "SELECT topic_id, parent_id FROM TopicNode WHERE parent_id IS NOT NULL"
    )
    for topic_id, parent_id in cursor.fetchall():
        child_outputs = find_outputs_by_topic(dag, topic_id)
        parent_outputs = find_outputs_by_topic(dag, parent_id)
        for parent_output in parent_outputs:
            for child_output in child_outputs:
                dag[parent_output]["deps"].add(child_output)

    # 4.3 topic output ➜ subject output
    cursor.execute("SELECT topic_id, subject_id FROM TopicNode")
    for topic_id, subject_id in cursor.fetchall():
        topic_outputs = find_outputs_by_topic(dag, topic_id)
        subject_outputs = find_outputs_by_subject(dag, subject_id)
        for subject_output in subject_outputs:
            for topic_output in topic_outputs:
                dag[subject_output]["deps"].add(topic_output)

    # 4.4 subject output ➜ exam output
    cursor.execute("SELECT subject_id, exam_id FROM Subject")
    for subject_id, exam_id in cursor.fetchall():
        subject_outputs = find_outputs_by_subject(dag, subject_id)
        exam_outputs = find_outputs_by_exam(dag, exam_id)
        for exam_output in exam_outputs:
            for subject_output in subject_outputs:
                dag[exam_output]["deps"].add(subject_output)

    print("✅ DAG 构建完成。统计任务数量：")
    print("所有任务数：", len(dag))
    print(
        "output 任务数：", sum(1 for t in dag.values() if t["task"]["type"] == "output")
    )
    print(
        "ready 状态 output 任务数：",
        sum(1 for t in dag.values() if t["task"]["type"] == "output" and not t["deps"]),
    )

    return dag

if __name__ == "__main__":
    import sqlite3
    from datetime import datetime, timedelta
    from collections import defaultdict

    # 连接到 SQLite 数据库
    db_path = "../review_plan.db"
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row

    # 构建 DAG
    dag = build_task_dag(conn)
    for task_id, node in dag.items():
        print(f"{task_id}: {node['task']}")
        # 输出任务信息
        print(f"任务 ID: {task_id}")
        print(f"任务类型: {node['task']['type']}")
        print(f"材料 ID: {node['task']['material_id']}")
        print(f"所需时间: {node['task']['required_hours']} 小时")
        print(f"已复习时间: {node['task']['reviewed_hours']} 小时")
        print(f"是否完成: {node['task']['is_completed']}")
        print(f"科目 ID: {node['task']['subject_id']}")
        print(f"考试 ID: {node['task']['exam_id']}")
        print(f"知识点 ID: {node['task']['topic_id']}")
        print(f"是否叶子节点: {node['task']['is_leaf']}")
        print(f"依赖任务: {node['deps']}")
        print("-" * 40)

    # 关闭数据库连接
    conn.close()