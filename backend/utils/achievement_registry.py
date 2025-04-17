from .achievement_base import (AccuracyCondition, AchievementRegistry,
                               ConditionedAchievement,
                               DailyReviewMinutesCondition,
                               MaterialCompletedCondition,
                               MultiSubjectOutputCondition,
                               OutputMaterialCompletedCondition,
                               RepeatMaterialCondition,
                               ReviewOnDayOfWeekCondition,
                               SessionLengthCondition, StreakCondition,
                               TopicCompletionCondition,
                               TotalStudyTimeCondition)


def load_achievement_registry():
    registry = AchievementRegistry()

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
            code="daily_flame",
            name="日常打卡",
            icon="📅",
            description="连续打卡 3 天",
            hint="火需要每天添柴，习惯点燃成长。",
            condition=StreakCondition(3),
        )
    )

    registry.register(
        ConditionedAchievement(
            code="getting_into_it",
            name="渐入佳境",
            icon="📅📅",
            description="连续打卡 7 天",
            hint="开始上瘾了？那是好事。",
            condition=StreakCondition(7),
        )
    )

    registry.register(
        ConditionedAchievement(
            code="ritualist",
            name="习以为常",
            icon="📅📅📅",
            description="连续打卡 21 天",
            hint="当习惯养成，努力变得轻松。",
            condition=StreakCondition(21),
        )
    )

    registry.register(
        ConditionedAchievement(
            code="note_taker",
            name="笔记狂人",
            icon="📒",
            description="复习 20 条笔记",
            hint="写下来，是为记忆，也为自己说话。",
            condition=MaterialCompletedCondition(min_count=20, material_type="note"),
        )
    )

    registry.register(
        ConditionedAchievement(
            code="video_addict",
            name="视频控",
            icon="📺",
            description="复习 20 条视频",
            hint="看懂是第一步，理解是关键。",
            condition=MaterialCompletedCondition(min_count=20, material_type="video"),
        )
    )

    registry.register(
        ConditionedAchievement(
            code="recite_grinder",
            name="背诵达人",
            icon="🎤",
            description="复习 20 条背诵材料",
            hint="背诵，是内化知识的仪式。",
            condition=MaterialCompletedCondition(20, material_type="recite"),
        )
    )

    registry.register(
        ConditionedAchievement(
            code="kindling",
            name="星星之火",
            icon="🔥",
            description="复习时长累计满 60 分钟",
            hint="小火也能燎原，关键是点燃它。",
            condition=TotalStudyTimeCondition(min_minutes=60),
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
            code="dance_of_flames",
            name="烈焰之舞",
            icon="🔥🔥🔥",
            description="复习时长满 1000 分钟",
            hint="你已成为火焰的舞者，热情四溢。",
            condition=TotalStudyTimeCondition(1000),
        )
    )

    registry.register(
        ConditionedAchievement(
            code="time_tracker",
            name="时光旅人",
            icon="⏳",
            description="总学习时长累计超过 10 小时",
            hint="恒常不变的力量，总会突破短暂的停滞。",
            condition=TotalStudyTimeCondition(600),
        )
    )

    registry.register(
        ConditionedAchievement(
            code="time_master",
            name="时间管理者",
            icon="⏳⏳",
            description="总学习时长累计超过 50 小时",
            hint="你掌控的不只是时间，还有自己。",
            condition=TotalStudyTimeCondition(3000),
        )
    )

    registry.register(
        ConditionedAchievement(
            code="consistency_hero",
            name="持之以恒",
            icon="⏳⏳⏳",
            description="总学习时长累计超过 100 小时",
            hint="你的坚持，就是你的超能力。",
            condition=TotalStudyTimeCondition(6000),
        )
    )

    registry.register(ConditionedAchievement(
        code="input_collector",
        name="材料收集者",
        icon="🕸️",
        description="完成 10 个输入材料",
        hint="每一次点“完成”，都值得庆祝。",
        condition=MaterialCompletedCondition(10)
    ))

    registry.register(ConditionedAchievement(
        code="input_finisher",
        name="材料终结者",
        icon="📚",
        description="完成 50 个输入材料",
        hint="知识的海洋，等你来探索。",
        condition=MaterialCompletedCondition(50)
    ))

    registry.register(ConditionedAchievement(
        code="output_challenger",
        name="输出勇士",
        icon="🧠",
        description="完成 10 个输出材料",
        hint="将知识用出来，才真正拥有它。",
        condition=OutputMaterialCompletedCondition(10)
    ))

    registry.register(ConditionedAchievement(
        code="output_master",
        name="输出大师",
        icon="🏆",
        description="完成 50 个输出材料",
        hint="知识的力量在于输出。",
        condition=OutputMaterialCompletedCondition(50)
    ))

    registry.register(
        ConditionedAchievement(
            code="master_accuracy",
            name="精准射手",
            icon="🎯",
            description="3 次输出 accuracy ≥ 90%",
            hint="精准，是理解的副产品。",
            condition=AccuracyCondition(min_accuracy=0.9, min_count=3),
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

    registry.register(
        ConditionedAchievement(
            code="accuracy_pro",
            name="满分达人",
            icon="🎯🎯🎯",
            description="15 次输出 accuracy ≥ 90%",
            hint="你已驾轻就熟，直中要害。",
            condition=AccuracyCondition(min_accuracy=0.9, min_count=15),
        )
    )

    registry.register(ConditionedAchievement(
        code="rhythm_maker",
        name="学习节奏",
        icon="🎵",
        description="一周内每日至少复习 60 分钟",
        hint="学习不是冲刺，是节奏。",
        condition=DailyReviewMinutesCondition(min_minutes=60)  # context 中每日统计判断达成7天即可
    ))

    # registry.register(ConditionedAchievement(
    #     code="topic_explorer",
    #     name="主题征服者",
    #     icon="🧭",
    #     description="完成一个完整主题（所有叶子知识点完成）",
    #     hint="越接近本质，越能看清路径。",
    #     condition=TopicCompletionCondition(topic_id=1)  # 示例ID
    # ))

    # registry.register(ConditionedAchievement(
    #     code="morning_learner",
    #     name="晨光学习者",
    #     icon="🌅",
    #     description="清晨 6-9 点完成复习任务 5 次",
    #     hint="你选择在世界沉寂时进步。",
    #     condition=SessionLengthCondition(1, after_time="06:00")  # 统计 session 发生在早上6-9点区间的次数
    # ))

    # registry.register(ConditionedAchievement(
    #     code="golden_bird",
    #     name="黄金早鸟",
    #     icon="🐦",
    #     description="连续一周在早上复习（7 天）",
    #     hint="晨光，是专属于自律者的奖赏。",
    #     condition=SessionLengthCondition(1, after_time="06:00")  # 连续性通过 context 实现
    # ))

    # registry.register(ConditionedAchievement(
    #     code="night_owl",
    #     name="黑夜守望者",
    #     icon="🌙",
    #     description="晚上 10 点后复习超过 5 次",
    #     hint="寂静中生思，孤独中深耕。",
    #     condition=SessionLengthCondition(1, after_time="22:00")  # 次数由 context 控制
    # ))

    # registry.register(ConditionedAchievement(
    #     code="night_hunter",
    #     name="夜猫子",
    #     icon="🦉",
    #     description="连续一周在晚上复习（7 天）",
    #     hint="夜晚是思考的最佳时机。",
    #     condition=SessionLengthCondition(1, after_time="22:00")  # 连续性需要 context 支持
    # ))

    registry.register(
        ConditionedAchievement(
            code="loop_master",
            name="再来！",
            icon="🔁",
            description="重复复习相同材料 3 次以上",
            hint="重复，是巩固，也是再发现。",
            condition=RepeatMaterialCondition(3),
        )
    )

    registry.register(
        ConditionedAchievement(
            code="monday_master",
            name="最强星期一",
            icon="📆",
            description="连续 4 个星期一完成复习",
            hint="你不是厌世星期一的人，是反其道而行的战士。",
            condition=ReviewOnDayOfWeekCondition(weekday=0, min_count=4),
        )
    )

    registry.register(
        ConditionedAchievement(
            code="synthmind",
            name="链结者",
            icon="🔗",
            description="完成三个不同科目的输出材料",
            hint="思维有界，关联无边。",
            condition=MultiSubjectOutputCondition(3),
        )
    )

    registry.register(
        ConditionedAchievement(
            code="fountain_focus",
            name="学习之泉",
            icon="⛲️",
            description="单次连续学习超过 120 分钟",
            hint="专注像泉水，一旦涌出就甘甜无比。",
            condition=SessionLengthCondition(120),
        )
    )

    registry.register(
        ConditionedAchievement(
            code="midnight_grinder",
            name="一夜爆肝",
            icon="☕️",
            description="单晚学习时间超过 3 小时（20点后）",
            hint="向深夜的你致敬。",
            condition=SessionLengthCondition(180, after_time="20:00"),
        )
    )

    registry.register(
        ConditionedAchievement(
            code="night_owl",
            name="黑夜守望者",
            icon="🌙",
            description="晚上 10 点后复习超过 5 次",
            hint="寂静中生思，孤独中深耕。",
            condition=SessionLengthCondition(
                1, after_time="22:00"
            ),  # 条件模拟：出现次数用context实现扩展
        )
    )

    registry.register(
        ConditionedAchievement(
            code="material_crafter",
            name="资料工匠",
            icon="🛠",
            description="添加材料超过 50 次",
            hint="工匠精神，在于不断打磨。",
            condition=MaterialCompletedCondition(50),  # 替代：若记录添加次数需新字段
        )
    )

    # registry.register(
    #     ConditionedAchievement(
    #         code="path_of_balance",
    #         name="全能之路",
    #         icon="🧩",
    #         description="每种材料类型都完成过",
    #         hint="平衡是多元体验的艺术。",
    #         condition=MaterialCompletedCondition(
    #             1, material_type=None # type: ignore
    #         ),  # 示例逻辑，实际应组合所有类型检测 # type: ignore
    #     )
    # )

    return registry
