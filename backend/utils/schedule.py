from datetime import datetime, timedelta
import sqlite3
from time_slot import get_available_slots
from dag import build_task_dag


def find_output_by_topic(dag, topic_id):
    for tid, node in dag.items():
        if node["task"]["type"] == "output" and node["task"]["topic_id"] == topic_id:
            return tid
    return None


def find_output_by_subject(dag, subject_id):
    for tid, node in dag.items():
        if (
            node["task"]["type"] == "output"
            and node["task"]["subject_id"] == subject_id
        ):
            return tid
    return None


def find_output_by_exam(dag, exam_id):
    for tid, node in dag.items():
        if node["task"]["type"] == "output" and node["task"]["exam_id"] == exam_id:
            return tid
    return None


def extract_task_pool(dag):
    task_pool = []
    for task_id, node in dag.items():
        task = node["task"]
        if not task["is_completed"]:
            task_pool.append(
                {
                    **task,
                    "deps": list(node["deps"]),
                    "assigned": False,
                    "remaining_hours": max(
                        0, task["required_hours"] - task["reviewed_hours"]
                    ),
                }
            )
    return task_pool


def generate_schedule_v2_safe_with_progress(
    task_pool, available_slots, dag, subject_progress_strategy=1, max_combine_slots=3
):
    from collections import defaultdict

    schedule = []
    task_status = {
        task_id: {
            **node["task"],
            "assigned": node["task"]["is_completed"],
            "remaining_hours": max(
                0, node["task"]["required_hours"] - node["task"]["reviewed_hours"]
            ),
        }
        for task_id, node in dag.items()
    }

    # 1. 预统计每个 subject 的进度
    subject_total_hours = defaultdict(float)
    subject_reviewed_hours = defaultdict(float)
    subject_total_tasks = defaultdict(int)
    subject_completed_tasks = defaultdict(int)

    # 遍历所有任务
    for task_id, node in dag.items():
        task = node["task"]
        sid = task["subject_id"]
        if not sid:
            continue
        if task["type"] in ["input", "output"]:
            subject_total_hours[sid] += task["required_hours"]
            subject_total_tasks[sid] += 1
            if task["is_completed"]:
                subject_reviewed_hours[sid] += task["required_hours"]
                subject_completed_tasks[sid] += 1
            else:
                subject_reviewed_hours[sid] += task["reviewed_hours"]

    def subject_progress(subject_id):
        if subject_progress_strategy == 1:
            # 按复习时长计算
            total = subject_total_hours[subject_id]
            done = subject_reviewed_hours[subject_id]
        else:
            # 按材料数量计算
            total = subject_total_tasks[subject_id]
            done = subject_completed_tasks[subject_id]
        if total == 0:
            return 1.0  # 该科目无任务，视为完成
        return done / total

    last_subject = None
    subject_day_count = {}
    slot_idx = 0
    total_slots = len(available_slots)

    while slot_idx < total_slots:
        slot = available_slots[slot_idx]
        slot_length_hr = compute_duration_minutes(slot) / 60.0
        date_key = slot["date"]
        if date_key not in subject_day_count:
            subject_day_count[date_key] = {"input": 0, "output": 0}

        # 重新计算 ready_tasks
        ready_tasks = [
            t
            for t in task_pool
            if not task_status[t["task_id"]]["assigned"]
            and all(task_status[dep]["assigned"] for dep in t["deps"])
        ]

        # 优先：进度越慢（数值越小）、fit 当前 slot、科目轮换、type 轮换
        ready_tasks.sort(
            key=lambda t: (
                subject_progress(t["subject_id"] or 0),
                abs(task_status[t["task_id"]]["remaining_hours"] - slot_length_hr),
                t["subject_id"] == last_subject,
                subject_day_count[date_key][t["type"]],
            )
        )

        remaining_hr = slot_length_hr
        slot_used = False
        attempt = 0

        while remaining_hr > 0.01 and attempt < 10:
            attempt += 1
            task_scheduled = False

            for task in ready_tasks:
                tid = task["task_id"]
                tinfo = task_status[tid]
                ttype = tinfo["type"]

                if subject_day_count[date_key][ttype] >= 2:
                    continue

                required = tinfo["remaining_hours"]

                # 尝试连续 slot 拼接
                if required > remaining_hr:
                    acc_hr = remaining_hr
                    combined_slots = [slot]
                    future_idx = slot_idx + 1
                    while (
                        future_idx < total_slots
                        and acc_hr < required
                        and len(combined_slots) < max_combine_slots
                    ):
                        next_slot = available_slots[future_idx]
                        if next_slot["date"] != slot["date"]:
                            break
                        acc_hr += compute_duration_minutes(next_slot) / 60.0
                        combined_slots.append(next_slot)
                        future_idx += 1

                    if acc_hr >= required:
                        remaining = required
                        for s in combined_slots:
                            use_hr = min(remaining, compute_duration_minutes(s) / 60.0)
                            schedule.append(
                                {
                                    "date": s["date"],
                                    "start": s["start"],
                                    "end": s["end"],
                                    "task_id": tid,
                                    "material_id": tinfo["material_id"],
                                    "task_type": ttype,
                                    "subject_id": tinfo["subject_id"],
                                    "topic_id": tinfo["topic_id"],
                                    "hours_assigned": use_hr,
                                }
                            )
                            print(
                                f"🧩 合并 slot 安排任务：{tid}, {use_hr:.2f} 小时 @ {s['date']} {s['start']}"
                            )
                            remaining -= use_hr
                            subject_day_count[s["date"]][ttype] += 1
                        tinfo["assigned"] = True
                        tinfo["remaining_hours"] = 0
                        slot_idx += len(combined_slots)
                        last_subject = tinfo["subject_id"]
                        slot_used = True
                        task_scheduled = True
                        # 更新完成量
                        if tinfo["subject_id"]:
                            if subject_progress_strategy == 1:
                                subject_reviewed_hours[tinfo["subject_id"]] += required
                            else:
                                subject_completed_tasks[tinfo["subject_id"]] += 1
                        break

                    continue

                # 当前 slot 塞任务
                hours = min(required, remaining_hr)
                schedule.append(
                    {
                        "date": slot["date"],
                        "start": slot["start"],
                        "end": slot["end"],
                        "task_id": tid,
                        "material_id": tinfo["material_id"],
                        "task_type": ttype,
                        "subject_id": tinfo["subject_id"],
                        "topic_id": tinfo["topic_id"],
                        "hours_assigned": hours,
                    }
                )
                print(
                    f"📌 安排任务：{tid}, {hours:.2f} 小时 @ {slot['date']} {slot['start']}"
                )
                tinfo["remaining_hours"] -= hours
                if tinfo["remaining_hours"] <= 0.01:
                    tinfo["assigned"] = True
                    # 更新完成量
                    if tinfo["subject_id"]:
                        if subject_progress_strategy == 1:
                            subject_reviewed_hours[tinfo["subject_id"]] += required
                        else:
                            subject_completed_tasks[tinfo["subject_id"]] += 1
                subject_day_count[date_key][ttype] += 1
                last_subject = tinfo["subject_id"]
                remaining_hr -= hours
                task_scheduled = True
                slot_used = True
                break

            if not task_scheduled:
                break

        if not slot_used:
            print(f"⚠️ 无法安排任务：{slot['date']} {slot['start']} → 空 slot")
        slot_idx += 1

    return schedule


# def generate_schedule_v2_safe(task_pool, available_slots, dag, max_combine_slots=3, subject_progress_strategy=1):
#     from collections import defaultdict

#     schedule = []

#     # ➕ 构建任务状态
#     task_status = {
#         task_id: {
#             **node["task"],
#             "assigned": node["task"]["is_completed"],
#             "remaining_hours": max(0, node["task"]["required_hours"] - node["task"]["reviewed_hours"])
#         }
#         for task_id, node in dag.items()
#     }

#     # ➕ 统计科目进度（用于跨科目优先级判断）
#     subject_progress = defaultdict(lambda: 1.0)  # 默认完成100%
#     if subject_progress_strategy == 1:
#         # 时长占比策略
#         subject_total = defaultdict(float)
#         subject_done = defaultdict(float)
#         for t in task_status.values():
#             if t["subject_id"] is None:
#                 continue
#             subject_total[t["subject_id"]] += t["required_hours"]
#             subject_done[t["subject_id"]] += t["required_hours"] - t["remaining_hours"]
#         for sid in subject_total:
#             total = subject_total[sid]
#             done = subject_done[sid]
#             progress = done / total if total > 0 else 1.0
#             subject_progress[sid] = progress

#     elif subject_progress_strategy == 2:
#         # 材料完成个数策略
#         subject_total = defaultdict(int)
#         subject_done = defaultdict(int)
#         for t in task_status.values():
#             if t["subject_id"] is None:
#                 continue
#             subject_total[t["subject_id"]] += 1
#             if t["assigned"]:
#                 subject_done[t["subject_id"]] += 1
#         for sid in subject_total:
#             total = subject_total[sid]
#             done = subject_done[sid]
#             progress = done / total if total > 0 else 1.0
#             subject_progress[sid] = progress

#     last_subject = None
#     subject_day_count = {}
#     slot_idx = 0
#     total_slots = len(available_slots)

#     while slot_idx < total_slots:
#         slot = available_slots[slot_idx]
#         slot_length_hr = compute_duration_minutes(slot) / 60.0
#         date_key = slot["date"]
#         if date_key not in subject_day_count:
#             subject_day_count[date_key] = {'input': 0, 'output': 0}

#         ready_tasks = [
#             t for t in task_pool
#             if not task_status[t["task_id"]]["assigned"]
#             and all(task_status[dep]["assigned"] for dep in t["deps"])
#         ]

#         # ➕ 按优先级排序：
#         # 1. 优先复习进度慢的科目（progress 越低越优）
#         # 2. 当前 slot 能 fit
#         # 3. 换科目优先
#         # 4. 当前类型少
#         ready_tasks.sort(key=lambda t: (
#             subject_progress.get(t["subject_id"], 1.0),  # 越小越优
#             abs(task_status[t["task_id"]]["remaining_hours"] - slot_length_hr),
#             t["subject_id"] == last_subject,
#             subject_day_count[date_key][t["type"]],
#         ))

#         remaining_hr = slot_length_hr
#         slot_used = False
#         attempt = 0

#         while remaining_hr > 0.01 and attempt < 10:
#             attempt += 1
#             task_scheduled = False

#             for task in ready_tasks:
#                 tid = task["task_id"]
#                 tinfo = task_status[tid]
#                 ttype = tinfo["type"]

#                 if subject_day_count[date_key][ttype] >= 2:
#                     continue

#                 required = tinfo["remaining_hours"]

#                 # ➕ 连续 slot 合并
#                 if required > remaining_hr:
#                     acc_hr = remaining_hr
#                     combined_slots = [slot]
#                     future_idx = slot_idx + 1
#                     while future_idx < total_slots and acc_hr < required and len(combined_slots) < max_combine_slots:
#                         next_slot = available_slots[future_idx]
#                         if next_slot["date"] != slot["date"]:
#                             break
#                         acc_hr += compute_duration_minutes(next_slot) / 60.0
#                         combined_slots.append(next_slot)
#                         future_idx += 1

#                     if acc_hr >= required:
#                         remaining = required
#                         for s in combined_slots:
#                             use_hr = min(remaining, compute_duration_minutes(s) / 60.0)
#                             schedule.append({
#                                 "date": s["date"],
#                                 "start": s["start"],
#                                 "end": s["end"],
#                                 "task_id": tid,
#                                 "material_id": tinfo["material_id"],
#                                 "task_type": ttype,
#                                 "subject_id": tinfo["subject_id"],
#                                 "topic_id": tinfo["topic_id"],
#                                 "hours_assigned": use_hr
#                             })
#                             print(f"🧩 合并 slot 安排任务：{tid}, {use_hr:.2f} 小时 @ {s['date']} {s['start']}")
#                             remaining -= use_hr
#                             subject_day_count[s["date"]][ttype] += 1

#                         tinfo["assigned"] = True
#                         tinfo["remaining_hours"] = 0
#                         slot_idx += len(combined_slots)
#                         last_subject = tinfo["subject_id"]
#                         slot_used = True
#                         task_scheduled = True
#                         break

#                     continue

#                 # ➕ 拼 slot 执行
#                 hours = min(required, remaining_hr)
#                 schedule.append({
#                     "date": slot["date"],
#                     "start": slot["start"],
#                     "end": slot["end"],
#                     "task_id": tid,
#                     "material_id": tinfo["material_id"],
#                     "task_type": ttype,
#                     "subject_id": tinfo["subject_id"],
#                     "topic_id": tinfo["topic_id"],
#                     "hours_assigned": hours
#                 })
#                 print(f"📌 安排任务：{tid}, {hours:.2f} 小时 @ {slot['date']} {slot['start']}")
#                 tinfo["remaining_hours"] -= hours
#                 if tinfo["remaining_hours"] <= 0.01:
#                     tinfo["assigned"] = True
#                 subject_day_count[date_key][ttype] += 1
#                 last_subject = tinfo["subject_id"]
#                 remaining_hr -= hours
#                 task_scheduled = True
#                 slot_used = True
#                 break

#             if not task_scheduled:
#                 break

#         if not slot_used:
#             print(f"⚠️ 空 slot: {slot['date']} {slot['start']}")
#         slot_idx += 1

#     return schedule


def compute_duration_minutes(slot):
    start = datetime.strptime(slot["start"], "%H:%M")
    end = datetime.strptime(slot["end"], "%H:%M")
    delta = datetime.combine(datetime.today(), end.time()) - datetime.combine(
        datetime.today(), start.time()
    )
    return delta.seconds // 60


def generate_review_plan(start_date, end_date, db_path="review_plan.db"):
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row

    # Step 1: 获取所有可用 slot
    available_slots = get_available_slots(start_date, end_date, db_path=db_path)

    # Step 2: 构建 DAG
    dag = build_task_dag(conn)

    # Step 3: 任务池
    task_pool = extract_task_pool(dag)

    # Step 4: 调度
    schedule = generate_schedule_v2_safe_with_progress(
        task_pool, available_slots, dag, subject_progress_strategy=1
    )

    conn.close()
    return schedule


def format_schedule_human_readable(schedule, db_path="review_plan.db"):
    import sqlite3

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    topic_map = {}
    subject_map = {}
    input_map = {}
    output_map = {}

    # 加载 TopicNode
    cur.execute("SELECT topic_id, name, parent_id, subject_id FROM TopicNode")
    for row in cur.fetchall():
        topic_map[row["topic_id"]] = (row["name"], row["parent_id"], row["subject_id"])

    # 加载 Subject
    cur.execute("SELECT subject_id, subject_name FROM Subject")
    for row in cur.fetchall():
        subject_map[row["subject_id"]] = row["subject_name"]

    # 加载 InputMaterial
    cur.execute("SELECT input_id, title FROM InputMaterial")
    for row in cur.fetchall():
        input_map[row["input_id"]] = row["title"]

    # 加载 OutputMaterial
    cur.execute("SELECT output_id, title FROM OutputMaterial")
    for row in cur.fetchall():
        output_map[row["output_id"]] = row["title"]

    conn.close()

    def get_topic_hierarchy_and_subject(topic_id):
        names = []
        subject_id_found = None
        while topic_id:
            name, parent_id, subject_id = topic_map.get(topic_id, ("?", None, None))
            names.insert(0, name)
            if subject_id and not subject_id_found:
                subject_id_found = subject_id
            topic_id = parent_id
        return names, subject_id_found

    readable_schedule = []

    for entry in schedule:
        task_type = entry["task_type"]
        topic_id = entry["topic_id"]
        subject_id = entry["subject_id"]
        material_id = entry["material_id"]

        # topic 路径 & 回溯 subject
        if topic_id:
            topic_path, inferred_subject_id = get_topic_hierarchy_and_subject(topic_id)
        else:
            topic_path, inferred_subject_id = [], None

        # subject 确定优先顺序：entry中有 → topic推导 → 没有则看是否是 exam
        if subject_id:
            subject_name = subject_map.get(subject_id, "未知科目")
        elif inferred_subject_id:
            subject_name = subject_map.get(inferred_subject_id, "未知科目")
        elif not topic_id and entry.get("task_type") == "output":
            subject_name = "总复习"
        else:
            subject_name = "未知科目"

        # 避免重复 subject-topic 名称
        if topic_path and topic_path[0] == subject_name:
            topic_path = topic_path[1:]

        # 构建任务名称
        if task_type == "input":
            title = input_map.get(material_id, "未知输入材料")
            task_label = f"{subject_name}-{'-'.join(topic_path)}-笔记《{title}》"
        elif task_type == "output":
            title = output_map.get(material_id, "未知输出材料")
            task_label = f"{subject_name}-{'-'.join(topic_path)}-练习《{title}》"
        else:
            task_label = f"{subject_name}-未知任务"

        readable_schedule.append(
            {
                "date": entry["date"],
                "start": entry["start"],
                "end": entry["end"],
                "task_type": task_type,
                "task_name": task_label,
                "hours_assigned": entry["hours_assigned"],
            }
        )

    return readable_schedule


if __name__ == "__main__":
    raw_schedule = generate_review_plan(
        "2025-04-15", "2025-08-22", db_path="../review_plan.db"
    )
    print(
        "📊 Output 被调度数量：",
        sum(1 for x in raw_schedule if x["task_type"] == "output"),
    )
    human_readable = format_schedule_human_readable(
        raw_schedule, db_path="../review_plan.db"
    )

    for row in human_readable:
        print(row)
