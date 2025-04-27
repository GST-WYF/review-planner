import os
import sqlite3
from datetime import date, datetime, timedelta
from typing import Any, Dict, List, Optional

from fastapi import Body, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from utils.dag import DAG
from utils.time_slot import get_available_slots
from utils.achievement_registry import load_achievement_registry
from utils.level import calculate_level
from utils.schedule import schedule_review, to_frontend_format
from utils.user_context import build_user_context


class TopicCreate(BaseModel):
    subject_id: int
    parent_id: Optional[int] = None
    name: str
    is_leaf: bool
    accuracy: Optional[float] = None
    importance: Optional[float] = None


class TopicUpdate(BaseModel):
    name: Optional[str] = None
    is_leaf: Optional[bool] = None
    accuracy: Optional[float] = None
    importance: Optional[float] = None


class MaterialInput(BaseModel):
    type: str
    title: str
    required_hours: Optional[float] = None
    reviewed_hours: Optional[float] = None
    accuracy: Optional[float] = None  # 仅用于输出材料
    is_completed: Optional[bool] = None  # ✅ 新增字段


class SubjectCreate(BaseModel):
    exam_id: int
    subject_name: str


class ReviewTaskCreate(BaseModel):
    reviewed_at: Optional[date] = None  # 默认今天
    node_type: str  # 'exam' | 'subject' | 'topic'
    node_id: int
    input_material_id: Optional[int] = None
    output_material_id: Optional[int] = None
    duration_minutes: int
    notes: Optional[str] = None


class TimeBlock(BaseModel):
    day_of_week: int  # 0~6
    start_time: str  # HH:MM
    end_time: str


class SpecialTimeBlock(BaseModel):
    date: str  # YYYY-MM-DD
    start_time: str
    end_time: str


class UserContext(BaseModel):
    current_streak: int
    total_review_minutes: int
    accuracy_records: List[float]
    completed_materials: List[Dict[str, Any]]


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_NAME = "review_plan.db"

OUTPUT_MATERIAL_TYPES_MAPPING = {
    "mock_exam": "模拟卷",
    "exercise_set": "练习题",
}

INPUT_MATERIAL_TYPES_MAPPING = {
    "note": "笔记",
    "video": "视频",
    "recite": "背诵",
}

NODE_TYPES_MAPPING = {
    "exam": "考试",
    "subject": "科目",
    "topic": "知识点",
}

registry = load_achievement_registry()


def fetch_tree(subject_id: int) -> List[Dict[str, Any]]:
    def get_children(conn, parent_id):
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT topic_id, name, accuracy, importance, is_leaf FROM TopicNode
            WHERE parent_id = ? ORDER BY topic_id
        """,
            (parent_id,),
        )
        children = []
        for row in cursor.fetchall():
            children.append(
                {
                    "topic_id": row[0],
                    "name": row[1],
                    "accuracy": row[2],
                    "importance": row[3],
                    "is_leaf": row[4],
                    "children": get_children(conn, row[0]),
                }
            )
        return children

    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT topic_id, name, accuracy, importance, is_leaf FROM TopicNode
            WHERE subject_id = ? AND parent_id IS NULL ORDER BY topic_id
        """,
            (subject_id,),
        )
        top_nodes = []
        for row in cursor.fetchall():
            top_nodes.append(
                {
                    "topic_id": row[0],
                    "name": row[1],
                    "accuracy": row[2],
                    "importance": row[3],
                    "is_leaf": row[4],
                    "children": get_children(conn, row[0]),
                }
            )
        return top_nodes


@app.post("/api/subject/")
def create_subject(data: SubjectCreate):
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO Subject (exam_id, subject_name) VALUES (?, ?)",
            (data.exam_id, data.subject_name),
        )
        conn.commit()
        subject_id = cursor.lastrowid
    return {"status": "created", "subject_id": subject_id}


@app.get("/api/review-tree")
def get_review_tree():
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT s.subject_id, s.subject_name, s.exam_id, e.exam_name
            FROM Subject s
            JOIN Exam e ON s.exam_id = e.exam_id
        """
        )
        subjects = cursor.fetchall()

    result = []
    for subject in subjects:
        subject_id, subject_name, exam_id, exam_name = subject
        topics = fetch_tree(subject_id)
        result.append(
            {
                "subject_id": subject_id,
                "subject_name": subject_name,
                "exam_id": exam_id,
                "exam_name": exam_name,
                "topics": topics,
            }
        )

    return result


@app.get("/api/topic/{topic_id}/materials")
def get_topic_materials(topic_id: int):
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT input_id, type, title, required_hours, reviewed_hours, is_completed
            FROM InputMaterial WHERE topic_id = ?
        """,
            (topic_id,),
        )
        inputs = [
            {
                "input_id": row[0],  # ✅ 加上 ID
                "type": row[1],
                "title": row[2],
                "required_hours": row[3],
                "reviewed_hours": row[4],
                "is_completed": bool(row[5]),
            }
            for row in cursor.fetchall()
        ]

        cursor.execute(
            """
            SELECT output_id, type, title, accuracy, required_hours, reviewed_hours, is_completed
            FROM OutputMaterial WHERE owner_type = 'topic' AND owner_id = ?
        """,
            (topic_id,),
        )
        outputs = [
            {
                "output_id": row[0],  # ✅ 加上 ID
                "type": row[1],
                "title": row[2],
                "accuracy": row[3],
                "required_hours": row[4],
                "reviewed_hours": row[5],
                "is_completed": bool(row[6]),
            }
            for row in cursor.fetchall()
        ]

    return {"input_materials": inputs, "output_materials": outputs}


# 创建新的 Topic
@app.post("/api/topic/")
def create_topic(data: TopicCreate):
    from fastapi import Request

    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO TopicNode (subject_id, parent_id, name, is_leaf, accuracy, importance)
            VALUES (?, ?, ?, ?, ?, ?)
        """,
            (
                data.subject_id,
                data.parent_id,
                data.name,
                data.is_leaf,
                data.accuracy,
                data.importance,
            ),
        )
        topic_id = cursor.lastrowid
        conn.commit()
    return {"status": "created", "topic_id": topic_id}


@app.post("/api/debug/topic/")
async def debug_topic(request: Request):
    body = await request.json()
    return body


# 修改 Topic（支持 name, is_leaf, accuracy, importance）
@app.put("/api/topic/{topic_id}")
def update_topic(topic_id: int, data: TopicUpdate):
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT topic_id FROM TopicNode WHERE topic_id = ?", (topic_id,))
        if cursor.fetchone() is None:
            raise HTTPException(status_code=404, detail="Topic not found")

        fields = []
        values = []
        for field in ["name", "is_leaf", "accuracy", "importance"]:
            value = getattr(data, field)
            if value is not None:
                fields.append(f"{field} = ?")
                values.append(value)

        if fields:
            sql = f"UPDATE TopicNode SET {', '.join(fields)} WHERE topic_id = ?"
            values.append(topic_id)
            cursor.execute(sql, tuple(values))
            conn.commit()

    return {"status": "updated", "topic_id": topic_id}


# 删除 Topic（含子材料）
@app.delete("/api/topic/{topic_id}")
def delete_topic(topic_id: int):
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM InputMaterial WHERE topic_id = ?", (topic_id,))
        cursor.execute(
            "DELETE FROM OutputMaterial WHERE owner_type = 'topic' AND owner_id = ?",
            (topic_id,),
        )
        cursor.execute("DELETE FROM TopicNode WHERE topic_id = ?", (topic_id,))
        conn.commit()
    return {"status": "deleted", "topic_id": topic_id}


# 添加输入材料
@app.post("/api/topic/{topic_id}/input")
def add_input_material(topic_id: int, material: MaterialInput):
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO InputMaterial (topic_id, type, title, required_hours, reviewed_hours, is_completed)
            VALUES (?, ?, ?, ?, ?, 0)
        """,
            (
                topic_id,
                material.type,
                material.title,
                material.required_hours,
                material.reviewed_hours,
            ),
        )
        conn.commit()
    return {"status": "input_material added"}


@app.put("/api/input/{input_id}")
def update_input_material(input_id: int, material: MaterialInput):
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()

        # 获取 topic_id 和旧的 reviewed_hours
        cursor.execute(
            "SELECT topic_id, reviewed_hours FROM InputMaterial WHERE input_id = ?",
            (input_id,),
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Input material not found")
        topic_id, old_reviewed_hours = row

        # 类型校验
        if material.type not in ["note", "video", "recite"]:
            raise HTTPException(status_code=400, detail="Invalid input material type")

        required_hours = material.required_hours or 0.0
        new_reviewed_hours = material.reviewed_hours or 0.0
        is_completed = int(material.is_completed) if material.is_completed else 0

        # 更新 InputMaterial 表
        cursor.execute(
            """
            UPDATE InputMaterial
            SET type = ?, title = ?, required_hours = ?, reviewed_hours = ?, is_completed = ?
            WHERE input_id = ?
        """,
            (
                material.type,
                material.title,
                required_hours,
                new_reviewed_hours,
                is_completed,
                input_id,
            ),
        )

        # 增量计算 duration_minutes
        delta_hours = max(0.0, new_reviewed_hours - (old_reviewed_hours or 0.0))
        duration_minutes = int(delta_hours * 60)

        notes = "自动记录：更新输入材料"
        if is_completed:
            notes += " ✅ 材料已标记完成"

        if duration_minutes > 0:
            cursor.execute(
                """
                INSERT INTO ReviewTaskLog (
                    reviewed_at, node_type, node_id,
                    input_material_id, duration_minutes, notes
                ) VALUES (?, ?, ?, ?, ?, ?)
            """,
                (
                    date.today().isoformat(),
                    "topic",
                    topic_id,
                    input_id,
                    duration_minutes,
                    notes,
                ),
            )

        conn.commit()

    return {"status": "input_material updated"}


@app.delete("/api/input/{input_id}")
def delete_input_material(input_id: int):
    with sqlite3.connect(DB_NAME) as conn:
        conn.execute("DELETE FROM InputMaterial WHERE input_id = ?", (input_id,))
        conn.commit()
    return {"status": "input_material deleted"}


@app.post("/api/topic/{topic_id}/output")
def add_output_material(topic_id: int, material: MaterialInput):
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO OutputMaterial (
                owner_type, owner_id, type, title, accuracy,
                required_hours, reviewed_hours, is_completed
            ) VALUES ('topic', ?, ?, ?, ?, ?, ?, 0)
        """,
            (
                topic_id,
                material.type,
                material.title,
                material.accuracy,
                material.required_hours,
                material.reviewed_hours,
            ),
        )
        conn.commit()
    return {"status": "output_material added"}


@app.put("/api/output/{output_id}")
def update_output_material(output_id: int, material: MaterialInput):
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()

        cursor.execute(
            "SELECT owner_type, owner_id, reviewed_hours FROM OutputMaterial WHERE output_id = ?",
            (output_id,),
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Output material not found")
        owner_type, owner_id, old_reviewed_hours = row

        if material.type not in ["exercise_set", "mock_exam"]:
            raise HTTPException(status_code=400, detail="Invalid output material type")

        required_hours = material.required_hours or 1.0
        new_reviewed_hours = material.reviewed_hours or 0.0
        is_completed = int(material.is_completed) if material.is_completed else 0

        # 更新 OutputMaterial 本体
        cursor.execute(
            """
            UPDATE OutputMaterial
            SET type = ?, title = ?, accuracy = ?, required_hours = ?, reviewed_hours = ?, is_completed = ?
            WHERE output_id = ?
        """,
            (
                material.type,
                material.title,
                material.accuracy,
                required_hours,
                new_reviewed_hours,
                is_completed,
                output_id,
            ),
        )

        # 备注信息
        notes = "自动记录：更新输出材料"
        if is_completed:
            notes += " ✅ 输出材料完成"

        # ✅ 增量计算 duration_minutes
        delta_hours = max(0.0, new_reviewed_hours - (old_reviewed_hours or 0.0))
        duration_minutes = int(delta_hours * 60)

        if duration_minutes > 0:
            cursor.execute(
                """
                INSERT INTO ReviewTaskLog (
                    reviewed_at, node_type, node_id,
                    output_material_id, duration_minutes, notes
                ) VALUES (?, ?, ?, ?, ?, ?)
            """,
                (
                    date.today().isoformat(),
                    owner_type,
                    owner_id,
                    output_id,
                    duration_minutes,
                    notes,
                ),
            )

        conn.commit()

    return {"status": "output_material updated"}


@app.delete("/api/output/{output_id}")
def delete_output_material(output_id: int):
    with sqlite3.connect(DB_NAME) as conn:
        conn.execute("DELETE FROM OutputMaterial WHERE output_id = ?", (output_id,))
        conn.commit()
    return {"status": "output_material deleted"}


@app.post("/api/material")
def add_material(material: dict = Body(...)):
    required_keys = {"owner_type", "owner_id", "type", "title"}
    if not required_keys.issubset(material):
        raise HTTPException(status_code=400, detail="Missing required fields")

    if material["type"] not in ["exercise_set", "mock_exam"]:
        raise HTTPException(status_code=400, detail="Invalid material type")

    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO OutputMaterial (
                owner_type, owner_id, type, title, accuracy,
                required_hours, reviewed_hours, is_completed
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                material["owner_type"],
                material["owner_id"],
                material["type"],
                material["title"],
                material.get("accuracy"),
                material.get("required_hours", 1.0),
                material.get("reviewed_hours", 0.0),
                int(material.get("is_completed", False)),
            ),
        )
        conn.commit()

    return {"status": "material added"}


@app.get("/api/materials")
def get_materials(owner_type: str, owner_id: int):
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT output_id, type, title, accuracy,
                   required_hours, reviewed_hours, is_completed
            FROM OutputMaterial
            WHERE owner_type = ? AND owner_id = ?
            ORDER BY output_id
            """,
            (owner_type, owner_id),
        )
        rows = cursor.fetchall()
        return [
            {
                "output_id": row[0],
                "type": row[1],
                "title": row[2],
                "accuracy": row[3],
                "required_hours": row[4],
                "reviewed_hours": row[5],
                "is_completed": bool(row[6]),
            }
            for row in rows
        ]


@app.post("/api/review-task/")
def create_review_task(task: ReviewTaskCreate):
    if task.node_type not in ("exam", "subject", "topic"):
        raise HTTPException(status_code=400, detail="Invalid node_type")

    reviewed_at = task.reviewed_at or date.today().isoformat()

    try:
        with sqlite3.connect(DB_NAME) as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO ReviewTaskLog (
                    reviewed_at,
                    node_type,
                    node_id,
                    input_material_id,
                    output_material_id,
                    duration_minutes,
                    notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
                (
                    reviewed_at,
                    task.node_type,
                    task.node_id,
                    task.input_material_id,
                    task.output_material_id,
                    task.duration_minutes,
                    task.notes,
                ),
            )
            conn.commit()
            return {"success": True, "id": cursor.lastrowid}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/review-tasks")
def get_review_tasks():
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT id, reviewed_at, node_type, node_id,
                   input_material_id, output_material_id,
                   duration_minutes, notes
            FROM ReviewTaskLog
            ORDER BY reviewed_at DESC, id DESC
            """
        )
        rows = cursor.fetchall()

        result = []
        for row in rows:
            task = {
                "id": row[0],
                "reviewed_at": row[1],
                "node_type": row[2],
                "node_id": row[3],
                "input_material_id": row[4],
                "output_material_id": row[5],
                "duration_minutes": row[6],
                "notes": row[7],
                "node_name": None,
                "input_material_title": None,
                "output_material_title": None,
            }

            # 查 node 名称
            if task["node_type"] == "exam":
                cursor.execute(
                    "SELECT exam_name FROM Exam WHERE exam_id = ?", (task["node_id"],)
                )
                res = cursor.fetchone()
                task["node_name"] = res[0] if res else None
            elif task["node_type"] == "subject":
                cursor.execute(
                    "SELECT subject_name FROM Subject WHERE subject_id = ?",
                    (task["node_id"],),
                )
                res = cursor.fetchone()
                task["node_name"] = res[0] if res else None
            elif task["node_type"] == "topic":
                cursor.execute(
                    "SELECT name FROM TopicNode WHERE topic_id = ?", (task["node_id"],)
                )
                res = cursor.fetchone()
                task["node_name"] = res[0] if res else None

            # 查材料标题
            if task["input_material_id"]:
                cursor.execute(
                    "SELECT title FROM InputMaterial WHERE input_id = ?",
                    (task["input_material_id"],),
                )
                res = cursor.fetchone()
                task["input_material_title"] = res[0] if res else None

            if task["output_material_id"]:
                cursor.execute(
                    "SELECT title FROM OutputMaterial WHERE output_id = ?",
                    (task["output_material_id"],),
                )
                res = cursor.fetchone()
                task["output_material_title"] = res[0] if res else None

            task["node_type"] = task["node_type"]
            result.append(task)

        return result


@app.get("/api/schedule/default")
def get_default_schedule():
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, day_of_week, start_time, end_time FROM DefaultSchedule"
        )
        rows = cursor.fetchall()
    return [
        {"id": row[0], "day_of_week": row[1], "start_time": row[2], "end_time": row[3]}
        for row in rows
    ]


@app.post("/api/schedule/default")
def set_default_schedule(blocks: List[TimeBlock]):
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM DefaultSchedule")
        for block in blocks:
            cursor.execute(
                "INSERT INTO DefaultSchedule (day_of_week, start_time, end_time) VALUES (?, ?, ?)",
                (block.day_of_week, block.start_time, block.end_time),
            )
        conn.commit()
    return {"status": "default schedule updated"}


@app.get("/api/schedule/special")
def get_special_schedule():
    today = datetime.today().date().isoformat()
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, date, start_time, end_time FROM SpecialSchedule WHERE date >= ? ORDER BY date ASC",
            (today,),
        )
        rows = cursor.fetchall()
    return [
        {"id": row[0], "date": row[1], "start_time": row[2], "end_time": row[3]}
        for row in rows
    ]


@app.post("/api/schedule/special")
def add_special_schedule(item: SpecialTimeBlock):
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO SpecialSchedule (date, start_time, end_time) VALUES (?, ?, ?)",
            (item.date, item.start_time, item.end_time),
        )
        conn.commit()
    return {"status": "special schedule added"}


@app.delete("/api/schedule/special/{schedule_id}")
def delete_special_schedule(schedule_id: int):
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM SpecialSchedule WHERE id = ?", (schedule_id,))
        conn.commit()
    return {"status": "special schedule deleted"}


@app.get("/api/schedule")
def get_schedule():
    start_date = datetime.today().strftime("%Y-%m-%d")
    end_date = "2025-08-21"
    # db_path = os.path.abspath("review_plan.db")

    dag = DAG(DB_NAME)
    time_slots = get_available_slots(start_date, end_date, DB_NAME)
    raw_schedule = schedule_review(dag, time_slots)
    human_readable = to_frontend_format(raw_schedule)

    return {"schedule": human_readable}


@app.get("/api/user-level")
def get_user_level():
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT input_material_id, output_material_id, duration_minutes
            FROM ReviewTaskLog
        """
        )
        rows = cursor.fetchall()

        total_exp = 0

        for input_id, output_id, duration in rows:
            minutes = duration or 0

            if input_id:
                # 输入材料：每小时1 EXP
                total_exp += minutes / 60

            elif output_id:
                # 输出材料：查准确率和是否完成
                cursor.execute(
                    """
                    SELECT accuracy, is_completed FROM OutputMaterial WHERE output_id = ?
                """,
                    (output_id,),
                )
                row = cursor.fetchone()

                if row:
                    accuracy, is_completed = row
                    if is_completed and accuracy is not None:
                        # 输出材料：每小时 (1/0.6) × accuracy
                        total_exp += minutes / 60.0 * (1 / 0.6) * accuracy

    total_exp = int(total_exp)
    result = calculate_level(total_exp)
    result["raw_exp"] = total_exp
    return result


@app.get("/api/exp-weekly")
def get_cumulative_weekly_exp():
    today = datetime.today().date()
    start_day = today - timedelta(days=6)

    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT reviewed_at, input_material_id, output_material_id, duration_minutes
            FROM ReviewTaskLog
            WHERE reviewed_at >= ?
            ORDER BY reviewed_at ASC
        """,
            (start_day.isoformat(),),
        )
        rows = cursor.fetchall()

        # 查询所有 output material 的数据（缓存）
        cursor.execute("SELECT output_id, accuracy, is_completed FROM OutputMaterial")
        output_info = {row[0]: (row[1], row[2]) for row in cursor.fetchall()}

    # 初始化
    exp_by_day = {}
    cumulative_exp = 0

    for day_offset in range(7):
        day = (start_day + timedelta(days=day_offset)).isoformat()
        exp_by_day[day] = 0

    # 按时间顺序处理经验
    for reviewed_at, input_id, output_id, minutes in rows:
        minutes = minutes or 0
        reviewed_date = reviewed_at
        exp = 0

        if input_id:
            exp = minutes / 60.0
        elif output_id in output_info:
            accuracy, is_completed = output_info[output_id]
            if is_completed and accuracy is not None:
                exp = minutes * (1 / 0.6) * accuracy

        if reviewed_date in exp_by_day:
            exp_by_day[reviewed_date] += exp

    # 转为累加值
    cumulative_list = []
    running_total = 0
    for day in sorted(exp_by_day.keys()):
        running_total += exp_by_day[day]
        cumulative_list.append({"date": day, "cumulative_exp": round(running_total, 2)})

    return cumulative_list


@app.get("/api/achievements/all")
def get_all_achievements():
    return {
        "achievements": [
            {
                "code": a.code,
                "name": a.name,
                "icon": a.icon,
                "description": a.description,
                "hint": a.hint,
                "is_hidden": a.is_hidden,
                "category": a.category,
            }
            for a in registry.achievements
        ]
    }


@app.get("/api/achievements/unlocked")
def get_unlocked_achievements():
    context = build_user_context(DB_NAME)
    unlocked = registry.check_all(context)

    return {
        "unlocked": [
            {
                "code": a.code,
                "name": a.name,
                "icon": a.icon,
                "description": a.description,
                "hint": a.hint,
            }
            for a in unlocked
        ]
    }
