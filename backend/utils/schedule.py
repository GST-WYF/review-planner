from __future__ import annotations

from datetime import datetime, timedelta
from itertools import groupby
from typing import List, Dict, Any, Tuple, Optional
from .dag import DAG
from .dag import Material
from .time_slot import get_available_slots


# ────────────────────────────────────────────────────────────
# 1. 内部辅助工具
# ────────────────────────────────────────────────────────────
_DAY_CYCLE: Tuple[str, str, str] = ("passive", "active", "output")
_ALLOWED_TYPES: Dict[str, Tuple[str, ...]] = {
    "passive": ("note", "video"),
    "active": ("recite",),
    "output": ("exercise_set", "mock_exam"),
}


def _split_to_30min_slots(slot: Dict[str, str]) -> List[Dict[str, str]]:
    """把一个大段切成若干 30 min 子段。"""
    start_dt = datetime.strptime(f"{slot['date']} {slot['start']}", "%Y-%m-%d %H:%M")
    end_dt   = datetime.strptime(f"{slot['date']} {slot['end']}",   "%Y-%m-%d %H:%M")

    subs = []
    while start_dt < end_dt:
        sub_end = min(start_dt + timedelta(minutes=30), end_dt)
        subs.append(
            {
                "date": slot["date"],
                "start": start_dt.strftime("%H:%M"),
                "end":   sub_end.strftime("%H:%M"),
            }
        )
        start_dt = sub_end
    return subs


def _are_contiguous(a: Dict[str, str], b: Dict[str, str]) -> bool:
    """判断两个 30 min 段在同一天且首尾相接。"""
    return (
        a["date"] == b["date"]
        and a["end"] == b["start"]
    )


def _slot_hours(seg_list: List[Dict[str, str]]) -> float:
    """计算若干连续子段总时长（小时）。"""
    t0 = datetime.strptime(f"{seg_list[0]['date']} {seg_list[0]['start']}", "%Y-%m-%d %H:%M")
    t1 = datetime.strptime(f"{seg_list[-1]['date']} {seg_list[-1]['end']}",  "%Y-%m-%d %H:%M")
    return (t1 - t0).total_seconds() / 3600.0


# ───────────────────── 核心调度 ──────────────────────
def schedule_review(dag: "DAG", time_slots: List[Dict[str, str]]) -> List[Dict[str, Any]]:
    # 1) 切 30 min 子段
    segs = []
    for s in sorted(time_slots, key=lambda x: (x["date"], x["start"])):
        segs.extend(_split_to_30min_slots(s))

    plan, i = [], 0
    while i < len(segs):
        base_idx = (_DAY_CYCLE.index("passive")       # 先用当天循环起点
                    + i) % 3                          # 保持日内节奏一致
        consumed = False                              # 该 slot 是否成功分配

        tried_pairs: set[tuple[int, int]] = set()     # (exam_id, subject_id) 已试过

        while True:                                   # 在当前 30 min 内遍历 exam/subject
            exam = dag.select_next_exam()
            if exam is None:               # 全部完成
                return plan

            subj = dag.select_next_subject(exam)

            subj_id = subj.node_id if subj else -1
            if (exam.node_id, subj_id) in tried_pairs:
                break                      # 所有 (exam, subject) 组合都试过
            tried_pairs.add((exam.node_id, subj_id))

            # -------- 尝试 3 种 slot_type --------
            for shift in range(3):
                slot_type = _DAY_CYCLE[(base_idx + shift) % 3]
                allow     = _ALLOWED_TYPES[slot_type]

                if slot_type in ("passive", "active"):
                    window   = [segs[i]]
                    max_h    = 0.5
                    task = dag.get_next_task(exam, subj, allow, max_h)

                else:   # output —— 逐段延长，≤2 h
                    task, window = None, []
                    for seg_len in range(1, min(4, len(segs) - i) + 1):
                        w = segs[i:i+seg_len]
                        if any(not _are_contiguous(w[k], w[k+1]) for k in range(len(w)-1)):
                            break
                        task = dag.get_next_task(exam, subj, allow, 0.5*seg_len)
                        if task:
                            window = w
                            break

                if task:        # ← 成功
                    dag.update_task(task, _slot_hours(window))
                    plan.append({
                        "date":  window[0]["date"],
                        "start": window[0]["start"],
                        "end":   window[-1]["end"],
                        "slot_type": slot_type,
                        "task_id":    task.material_id,
                        "task_title": task.title,
                    })
                    i += len(window)       # 消费子段
                    consumed = True
                    break                  # 跳出 shift 循环

            if consumed:
                break                      # 当前 30 min 已分配成功

        if not consumed:
            i += 1                         # 该子段没人用→空置

    return plan

def to_frontend_format(plan: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    将 schedule_review 生成的 plan（包含 slot_type / task_title）转换为前端友好结构。

    返回列表中每条记录形如:
        {
            "date": "2025-08-01",
            "start": "14:00",
            "end":   "16:00",
            "task_type": "✍️🧠 输出",    # 👀📘 输入 | 🤔📘 输入 | ✍️🧠 输出
            "task_name": "高数期末题库（上）",
            "hours_assigned": 2.0
        }
    """
    type_mapping = {
        "passive": "👀📘 输入",
        "active": "🤔📘 输入",
        "output": "✍️🧠 输出",
    }

    fmt: List[Dict[str, Any]] = []

    for row in plan:
        start_time = row["start"]  # 已经是 "HH:MM" 格式
        end_time = row["end"]      # 已经是 "HH:MM" 格式

        # 计算小时数
        start_dt = datetime.strptime(start_time, "%H:%M")
        end_dt = datetime.strptime(end_time, "%H:%M")
        delta_seconds = (end_dt - start_dt).total_seconds()
        if delta_seconds < 0:
            delta_seconds += 24 * 3600  # 处理跨午夜情况

        hrs = round(delta_seconds / 3600.0, 2)

        task_type_label = type_mapping.get(row["slot_type"], "❓ 未知类型")

        fmt.append(
            {
                "date": row["date"],
                "start": start_time,
                "end": end_time,
                "task_type": task_type_label,
                "task_name": row["task_title"],
                "hours_assigned": hrs * 60,
            }
        )

    return fmt

if __name__ == "__main__":
    # 测试代码
    from dag import DAG

    db_path = "/home/Matrix/review-planner/backend/review_plan.db"
    dag = DAG(db_path)
    start_date = "2025-04-15"
    end_date = "2025-10-22"
    time_slots = get_available_slots(start_date, end_date, db_path)
    plan = schedule_review(dag, time_slots)
    plan = to_frontend_format(plan)
    for row in plan:
        print(row)