from collections import defaultdict
from datetime import datetime, timedelta
import sqlite3


def get_available_slots(start_date, end_date, db_path="../review_plan.db"):
    """
    获取指定日期范围内的复习可用时间段（time slots）。

    本函数会结合两个来源的数据生成完整时间段列表：
    1. DefaultSchedule：每周固定的复习时间（按周几定义）
    2. SpecialSchedule：具体日期的特殊安排，会覆盖默认时间段

    特别说明：
        - 每天可能有多个可用时间段（如午间和晚间）
        - 如果某天有 SpecialSchedule，则使用 special 替代默认值
        - 时间段格式统一为：{'date': 'YYYY-MM-DD', 'start': 'HH:MM', 'end': 'HH:MM'}

    参数:
        start_date (str): 起始日期，格式 'YYYY-MM-DD'
        end_date (str): 结束日期，格式 'YYYY-MM-DD'
        db_path (str): SQLite 数据库文件路径

    返回:
        list[dict]: 所有可用复习时间段的列表，每个元素形如：
            {
                'date': '2025-08-01',
                'start': '12:30',
                'end': '13:30'
            }
    """
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # 获取默认周计划
    cursor.execute("SELECT day_of_week, start_time, end_time FROM DefaultSchedule")
    default_schedule = defaultdict(list)
    for dow, start, end in cursor.fetchall():
        default_schedule[dow].append((start, end))

    # 获取特别计划
    cursor.execute("SELECT date, start_time, end_time FROM SpecialSchedule")
    special_schedule = defaultdict(list)
    for date_str, start, end in cursor.fetchall():
        special_schedule[date_str].append((start, end))

    conn.close()

    result = []
    date = datetime.strptime(start_date, "%Y-%m-%d")
    end = datetime.strptime(end_date, "%Y-%m-%d")
    while date <= end:
        date_str = date.strftime("%Y-%m-%d")
        if date_str in special_schedule:
            for s, e in special_schedule[date_str]:
                result.append({"date": date_str, "start": s, "end": e})
        else:
            for s, e in default_schedule[date.weekday()]:
                result.append({"date": date_str, "start": s, "end": e})
        date += timedelta(days=1)
    return result


if __name__ == "__main__":
    start_date = "2025-04-15"
    end_date = "2025-08-22"
    slots = get_available_slots(start_date, end_date)
    for slot in slots:
        print(slot)
