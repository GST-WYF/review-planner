from abc import ABC, abstractmethod
from datetime import datetime
from typing import Dict, Any, List

# -----------------------
# ✅ 抽象条件系统
# -----------------------


class Condition(ABC):
    @abstractmethod
    def evaluate(self, context: Dict[str, Any]) -> bool:
        pass

    def __and__(self, other):
        return AndCondition([self, other])

    def __or__(self, other):
        return OrCondition([self, other])

    def __invert__(self):
        return NotCondition(self)


class AndCondition(Condition):
    def __init__(self, conditions: List[Condition]):
        self.conditions = conditions

    def evaluate(self, context):
        return all(c.evaluate(context) for c in self.conditions)


class OrCondition(Condition):
    def __init__(self, conditions: List[Condition]):
        self.conditions = conditions

    def evaluate(self, context):
        return any(c.evaluate(context) for c in self.conditions)


class NotCondition(Condition):
    def __init__(self, condition: Condition):
        self.condition = condition

    def evaluate(self, context):
        return not self.condition.evaluate(context)


# -----------------------
# 🧱 基础条件类型
# -----------------------


class StreakCondition(Condition):
    def __init__(self, min_days: int):
        self.min_days = min_days

    def evaluate(self, context):
        return context.get("current_streak", 0) >= self.min_days


class MaterialCompletedCondition(Condition):
    def __init__(self, min_count: int, material_type: str = None):  # type: ignore
        self.min_count = min_count
        self.material_type = material_type  # optional filter

    def evaluate(self, context):
        materials = context.get("completed_materials", [])
        filtered = [
            m
            for m in materials
            if m.get("is_completed")
            and (self.material_type is None or m.get("type") == self.material_type)
        ]
        return len(filtered) >= self.min_count


class TotalStudyTimeCondition(Condition):
    def __init__(self, min_minutes: int):
        self.min_minutes = min_minutes

    def evaluate(self, context):
        return context.get("total_review_minutes", 0) >= self.min_minutes


class AccuracyCondition(Condition):
    def __init__(self, min_accuracy: float, min_count: int):
        self.min_accuracy = min_accuracy
        self.min_count = min_count

    def evaluate(self, context):
        records = context.get("accuracy_records", [])
        qualified = [a for a in records if a >= self.min_accuracy]
        return len(qualified) >= self.min_count


class DailyReviewMinutesCondition(Condition):
    def __init__(self, min_minutes: int):
        self.min_minutes = min_minutes

    def evaluate(self, context):
        # 假设 context["daily_sessions"] 是 list[{"date": str, "minutes": int}]
        today = datetime.today().date()
        for s in context.get("daily_sessions", []):
            if s["date"] == str(today) and s["minutes"] >= self.min_minutes:
                return True
        return False


class SessionLengthCondition(Condition):
    def __init__(self, min_minutes: int, after_time: str = None):  # type: ignore
        self.min_minutes = min_minutes
        self.after_time = after_time  # e.g., '20:00'

    def evaluate(self, context):
        for s in context.get(
            "sessions", []
        ):  # [{'minutes': 120, 'start_time': '21:00'}]
            if s["minutes"] >= self.min_minutes:
                if self.after_time:
                    if s["start_time"] >= self.after_time:
                        return True
                else:
                    return True
        return False


class ReviewOnDayOfWeekCondition(Condition):
    def __init__(self, weekday: int, min_count: int):
        self.weekday = weekday  # 0 = Monday
        self.min_count = min_count

    def evaluate(self, context):
        days = context.get("reviewed_days", [])  # e.g., list of datetime.date
        count = sum(1 for d in days if d.weekday() == self.weekday)
        return count >= self.min_count


class RepeatMaterialCondition(Condition):
    def __init__(self, min_repeats: int):
        self.min_repeats = min_repeats

    def evaluate(self, context):
        logs = context.get("review_logs", [])  # list of {"material_id": int}
        freq = {}
        for log in logs:
            mid = log.get("material_id")
            if mid:
                freq[mid] = freq.get(mid, 0) + 1
        return any(v >= self.min_repeats for v in freq.values())


class TopicCompletionCondition(Condition):
    def __init__(self, topic_id: int):
        self.topic_id = topic_id

    def evaluate(self, context):
        # 假设 context["completed_topics"] 是 set of topic_id
        return self.topic_id in context.get("completed_topics", set())


class MultiSubjectOutputCondition(Condition):
    def __init__(self, min_subjects: int):
        self.min_subjects = min_subjects

    def evaluate(self, context):
        subjects = context.get("output_subjects", set())  # e.g., {"math", "physics"}
        return len(subjects) >= self.min_subjects

class OutputMaterialCompletedCondition(MaterialCompletedCondition):
    def evaluate(self, context):
        materials = context.get("completed_output_materials", [])
        return len(materials) >= self.min_count

# -----------------------
# 🎖️ 成就定义
# -----------------------


class Achievement(ABC):
    code: str
    name: str
    icon: str
    description: str
    hint: str
    is_hidden: bool = False
    category: str = "general"

    @abstractmethod
    def check_unlock(self, context: Dict[str, Any]) -> bool:
        pass

    def __repr__(self):
        return f"[{self.icon}] {self.name} ({self.code})"


class ConditionedAchievement(Achievement):
    def __init__(
        self,
        code,
        name,
        icon,
        description,
        hint,
        condition: Condition,
        is_hidden=False,
        category="general",
    ):
        self.code = code
        self.name = name
        self.icon = icon
        self.description = description
        self.hint = hint
        self.condition = condition
        self.is_hidden = is_hidden
        self.category = category

    def check_unlock(self, context: Dict[str, Any]) -> bool:
        return self.condition.evaluate(context)


# -----------------------
# 📦 成就注册器
# -----------------------


class AchievementRegistry:
    def __init__(self):
        self.achievements: List[Achievement] = []

    def register(self, achievement: Achievement):
        self.achievements.append(achievement)

    def check_all(self, context: Dict[str, Any]) -> List[Achievement]:
        return [a for a in self.achievements if a.check_unlock(context)]


# -----------------------
# 🧪 示例测试
# -----------------------

if __name__ == "__main__":
    registry = AchievementRegistry()

    # 示例成就注册
    registry.register(
        ConditionedAchievement(
            code="first_step",
            name="第一步",
            icon="👣",
            description="完成首个材料",
            hint="所有伟大都从第一步开始。",
            condition=MaterialCompletedCondition(min_count=1),
        )
    )

    registry.register(
        ConditionedAchievement(
            code="note_taker",
            name="笔记狂人",
            icon="📝",
            description="完成 20 条笔记",
            hint="写下来，是为记忆，也为自己说话。",
            condition=MaterialCompletedCondition(min_count=20, material_type="note"),
        )
    )

    registry.register(
        ConditionedAchievement(
            code="flame_keeper",
            name="火焰之心",
            icon="🔥🔥",
            description="复习时长累计满 300 分钟",
            hint="你已点燃了自己的学习之火。",
            condition=TotalStudyTimeCondition(min_minutes=300),
        )
    )

    registry.register(
        ConditionedAchievement(
            code="daily_flame",
            name="日常打卡者",
            icon="📅",
            description="连续打卡 3 天",
            hint="火需要每天添柴，习惯点燃成长。",
            condition=StreakCondition(min_days=3),
        )
    )

    registry.register(
        ConditionedAchievement(
            code="sharpshooter",
            name="神射手",
            icon="🎯🎯",
            description="5 次输出 accuracy ≥ 90%",
            hint="好成绩不会说谎。",
            condition=AccuracyCondition(min_accuracy=0.9, min_count=5),
        )
    )

    # 示例上下文（模拟一位用户的状态）
    context = {
        "current_streak": 4,
        "total_review_minutes": 320,
        "accuracy_records": [0.88, 0.91, 0.93, 0.94, 0.99, 0.90],
        "completed_materials": [
            {"type": "note", "is_completed": True},
            {"type": "note", "is_completed": True},
            {"type": "video", "is_completed": True},
        ],
    }

    # 检查有哪些成就达成
    unlocked = registry.check_all(context)

    print("\n🎉 解锁的成就：")
    for a in unlocked:
        print(f"{a} → {a.hint}")
