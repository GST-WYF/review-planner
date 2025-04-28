from collections import defaultdict
from datetime import datetime, timedelta
import sqlite3


def get_available_slots(
    start_date, end_date, db_path="../review_plan.db", start_time=None
):
    """
    获取指定日期范围内的复习可用时间段（time slots）。

    参数:
        start_date (str): 起始日期，格式 'YYYY-MM-DD'
        end_date (str): 结束日期，格式 'YYYY-MM-DD'
        db_path (str): SQLite 数据库文件路径
        start_time (str, optional): 起始时间，格式 'HH:MM'，用于start_date这天，向上取整到30分钟开始。
    返回:
        list[dict]: 可用时间段列表
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

    # 如果有 start_time，解析为datetime.time
    if start_time:
        start_time_dt = datetime.strptime(start_time, "%H:%M")

        # 向上取整到最近30分钟
        minutes = (start_time_dt.minute + 29) // 30 * 30
        if minutes == 60:
            start_time_dt = start_time_dt.replace(hour=start_time_dt.hour + 1, minute=0)
        else:
            start_time_dt = start_time_dt.replace(minute=minutes)
        adjusted_start_time_str = start_time_dt.strftime("%H:%M")

    while date <= end:
        date_str = date.strftime("%Y-%m-%d")
        if date_str in special_schedule:
            slots = special_schedule[date_str]
        else:
            slots = default_schedule[date.weekday()]

        for s, e in slots:
            # 只在start_date当天处理start_time限制
            if start_time and date_str == start_date:
                if s < adjusted_start_time_str < e:
                    s = adjusted_start_time_str
                elif adjusted_start_time_str >= e:
                    continue  # 这个时间段已经结束了，不用加了
            result.append({"date": date_str, "start": s, "end": e})

        date += timedelta(days=1)
    return result


if __name__ == "__main__":
    start_date = "2025-04-15"
    end_date = "2025-08-22"
    slots = get_available_slots(start_date, end_date)
    for slot in slots:
        print(slot)
