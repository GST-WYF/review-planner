from sqlite3 import connect
from datetime import datetime, timedelta
from typing import Dict, Any, List


def build_user_context(DB_NAME) -> Dict[str, Any]:
    context = {
        "current_streak": 0,
        "total_review_minutes": 0,
        "accuracy_records": [],
        "completed_materials": [],
    }

    today = datetime.today().date()

    with connect(DB_NAME) as conn:
        cursor = conn.cursor()

        # --- 1. 获取近7天打卡记录，计算 streak ---
        cursor.execute(
            """
            SELECT DISTINCT reviewed_at FROM ReviewTaskLog
            WHERE node_type = 'topic' AND duration_minutes > 0
            ORDER BY reviewed_at DESC
            LIMIT 7
        """
        )
        dates = [datetime.strptime(r[0], "%Y-%m-%d").date() for r in cursor.fetchall()]

        streak = 0
        for i in range(7):
            if today - timedelta(days=i) in dates:
                streak += 1
            else:
                break
        context["current_streak"] = streak

        # --- 2. 累计复习时间 ---
        cursor.execute(
            """
            SELECT SUM(duration_minutes) FROM ReviewTaskLog
        """
        )
        total_minutes = cursor.fetchone()[0]
        context["total_review_minutes"] = total_minutes or 0

        # --- 3. 获取 output accuracy 记录 ---
        cursor.execute(
            """
            SELECT accuracy FROM OutputMaterial
            WHERE accuracy IS NOT NULL
        """
        )
        context["accuracy_records"] = [row[0] for row in cursor.fetchall()]

        # --- 4. 获取已完成的输入材料 ---
        cursor.execute(
            """
            SELECT type, is_completed FROM InputMaterial
            WHERE is_completed = 1
        """
        )
        context["completed_materials"] = [
            {"type": row[0], "is_completed": True} for row in cursor.fetchall()
        ]

    return context
