from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from fastapi import Request
from fastapi import Body


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

class SubjectCreate(BaseModel):
    exam_id: int
    subject_name: str



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
        cursor.execute("""
            SELECT s.subject_id, s.subject_name, s.exam_id, e.exam_name
            FROM Subject s
            JOIN Exam e ON s.exam_id = e.exam_id
        """)
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
                "topics": topics
            }
        )

    return result



@app.get("/api/topic/{topic_id}/materials")
def get_topic_materials(topic_id: int):
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT input_id, type, title, required_hours, reviewed_hours
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
            }
            for row in cursor.fetchall()
        ]

        cursor.execute(
            """
            SELECT output_id, type, title, accuracy
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
        cursor.execute("DELETE FROM OutputMaterial WHERE owner_type = 'topic' AND owner_id = ?", (topic_id,))
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
            INSERT INTO InputMaterial (topic_id, type, title, required_hours, reviewed_hours)
            VALUES (?, ?, ?, ?, ?)
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
        cursor.execute(
            """
            UPDATE InputMaterial
            SET type = ?, title = ?, required_hours = ?, reviewed_hours = ?
            WHERE input_id = ?
        """,
            (
                material.type,
                material.title,
                material.required_hours,
                material.reviewed_hours,
                input_id,
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
            INSERT INTO OutputMaterial (owner_type, owner_id, type, title, accuracy)
            VALUES ('topic', ?, ?, ?, ?)
        """,
            (topic_id, material.type, material.title, material.accuracy),
        )
        conn.commit()
    return {"status": "output_material added"}


@app.put("/api/output/{output_id}")
def update_output_material(output_id: int, material: MaterialInput):
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            UPDATE OutputMaterial
            SET type = ?, title = ?, accuracy = ?
            WHERE output_id = ?
        """,
            (material.type, material.title, material.accuracy, output_id),
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
                INSERT INTO OutputMaterial (owner_type, owner_id, type, title, accuracy)
                VALUES (?, ?, ?, ?, ?)
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
                INSERT INTO OutputMaterial (owner_type, owner_id, type, title, accuracy)
                VALUES (?, ?, ?, ?, NULL)
                """,
                (
                    material["owner_type"],
                    material["owner_id"],
                    material["type"],
                    material["title"],
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
            SELECT output_id, type, title, accuracy
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
            }
            for row in rows
        ]
