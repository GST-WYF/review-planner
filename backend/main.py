from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from fastapi import Request
from fastapi import Body
from datetime import date
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from datetime import datetime
import sqlite3


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


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_NAME = "review_plan.db"


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

    print("🔥 Raw input:", data.dict())
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
    print("🧪 Raw JSON body received:", body)
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
    print("adding input material", material)
    print("adding input material required_hours:", material.required_hours)
    print("adding input material reviewed_hours:", material.reviewed_hours)
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

        # 获取 topic_id（用于日志记录）
        cursor.execute("SELECT topic_id FROM InputMaterial WHERE input_id = ?", (input_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Input material not found")
        topic_id = row[0]

        # 默认 is_completed 为 0（未完成）
        is_completed = int(material.is_completed) if material.is_completed is not None else 0

        # 更新 InputMaterial 本体
        cursor.execute(
            """
            UPDATE InputMaterial
            SET type = ?, title = ?, required_hours = ?, reviewed_hours = ?, is_completed = ?
            WHERE input_id = ?
        """,
            (
                material.type,
                material.title,
                material.required_hours,
                material.reviewed_hours,
                is_completed,
                input_id,
            ),
        )

        # 备注信息
        notes = "自动记录：更新输入材料"
        if is_completed:
            notes += " ✅ 材料已标记完成"

        # 自动写入 ReviewTaskLog
        cursor.execute(
            """
            INSERT INTO ReviewTaskLog (
                reviewed_at, node_type, node_id,
                input_material_id, duration_minutes, notes
            ) VALUES (?, ?, ?, ?, ?, ?)
        """,
            (
                date.today().isoformat(),
                'topic',
                topic_id,
                input_id,
                int((material.reviewed_hours or 0) * 60),  # 小时转分钟
                notes
            )
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

        # 获取 owner_type + owner_id（用于日志记录）
        cursor.execute(
            "SELECT owner_type, owner_id FROM OutputMaterial WHERE output_id = ?",
            (output_id,),
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Output material not found")
        owner_type, owner_id = row

        # 默认 is_completed 为 0（未完成）
        is_completed = 1 if material.is_completed is not None else 0
        print("📦 更新输出材料 is_completed:", is_completed)

        # 更新 OutputMaterial 本体
        cursor.execute(
            """
            UPDATE OutputMaterial
            SET type = ?, title = ?, accuracy = ?, is_completed = ?
            WHERE output_id = ?
        """,
            (
                material.type,
                material.title,
                material.accuracy,
                is_completed,
                output_id,
            ),
        )

        # 备注信息
        notes = "自动记录：更新输出材料"
        if is_completed:
            notes += " ✅ 输出材料完成"

        # 自动写入 ReviewTaskLog
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
                30,  # 输出材料默认写 30 分钟
                notes
            )
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

    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        if material["owner_type"] == "topic":
            cursor.execute(
                """
                INSERT INTO OutputMaterial (
                    owner_type, owner_id, type, title, accuracy,
                    required_hours, reviewed_hours, is_completed
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, 0)
                """,
                (
                    material["owner_type"],
                    material["owner_id"],
                    material["type"],
                    material["title"],
                    material.get("accuracy"),
                ),
            )
        else:
            # 对 subject/exam 类型默认 accuracy = null
            cursor.execute(
                """
                INSERT INTO OutputMaterial (
                    owner_type, owner_id, type, title, accuracy,
                    required_hours, reviewed_hours, is_completed
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    material["owner_type"],
                    material["owner_id"],
                    material["type"],
                    material["title"],
                    material.get("accuracy"),
                    material.get("required_hours", 1.0),     # ✅ 默认 1 小时
                    material.get("reviewed_hours", 0.0),     # ✅ 默认未复习
                    int(material.get("is_completed", False)) # ✅ 默认未完成
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
