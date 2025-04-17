import math

LEVEL_CAP = 10
BASE_EXP = 10
EXP_FACTOR = 2.15

TITLES = {
    1: "初识者 Novice",
    2: "觉察者 Seeker",
    3: "契入者 Initiate",
    4: "行知者 Practitioner",
    5: "内化者 Assimilator",
    6: "通达者 Adept",
    7: "反观者 Reflector",
    8: "链结者 Synthesist",
    9: "觉悟者 Illuminant",
    10: "开悟者 Transcendent",
}

MESSAGES = {
    1: "我开始注意到自己与知识的距离。",
    2: "我试着理解，而不是只是记住。",
    3: "我找到方法，也开始建立连接。",
    4: "我用它行动，它改变了我。",
    5: "知识已内化，变成我的一部分。",
    6: "我不再害怕复杂，它们开始为我服务。",
    7: "我不仅学，也能教；不仅看，也能观自己。",
    8: "多元思维开始编织，它们彼此呼应。",
    9: "我理解系统，也理解自身所处的位置。",
    10: "我已不困于方法，我只是专注、清明与自由。 🌌",
}

def calculate_level(total_exp: int) -> dict:
    level = 1
    exp_accumulated = 0

    while level < LEVEL_CAP:
        exp_needed = round(BASE_EXP * (level ** EXP_FACTOR))
        if total_exp < exp_accumulated + exp_needed:
            break
        exp_accumulated += exp_needed
        level += 1

    exp_current = total_exp - exp_accumulated
    exp_to_next = round(BASE_EXP * (level ** EXP_FACTOR)) if level < LEVEL_CAP else 0

    return {
        "level": level,
        "title": TITLES.get(level, ""),
        "message": MESSAGES.get(level, ""),
        "exp": total_exp,
        "exp_in_current_level": exp_current,
        "exp_to_next_level": exp_to_next,
        "progress_ratio": round(exp_current / exp_to_next, 4) if exp_to_next else 1.0
    }


def exp_to_next_level(current_level: int) -> int:
    if current_level >= LEVEL_CAP:
        return 0
    return round(BASE_EXP * (current_level ** EXP_FACTOR))


def get_level_title(level: int) -> str:
    return TITLES.get(level, "")


def get_level_message(level: int) -> str:
    return MESSAGES.get(level, "")
