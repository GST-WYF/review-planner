import { useEffect, useState } from "react";
import axios from "axios";
import React from "react";

type DefaultBlock = {
  id?: number;
  day_of_week: number; // 0~6
  start_time: string;
  end_time: string;
};

type SpecialBlock = {
  id?: number;
  date: string;
  start_time: string;
  end_time: string;
};

export default function ReviewSchedulePage() {
  const [defaultSchedule, setDefaultSchedule] = useState<Set<string>>(new Set());
  const [specialSchedule, setSpecialSchedule] = useState<SpecialBlock[]>([]);
  const days = ["一", "二", "三", "四", "五", "六", "日"];

  const timeSlots: string[] = Array.from({ length: 33 }, (_, i) => {
    const hour = 6 + Math.floor(i / 2);
    const minute = i % 2 === 0 ? "00" : "30";
    return `${String(hour).padStart(2, "0")}:${minute}`;
  });


  // 加载默认排班
  useEffect(() => {
    axios.get<DefaultBlock[]>("/api/schedule/default").then((res) => {
      const set = new Set<string>();
      for (const block of res.data) {
        let t = block.start_time;
        while (t < block.end_time) {
          set.add(`${block.day_of_week}_${t}`);
          t = add30Min(t);
        }
      }
      setDefaultSchedule(set);
    });
  }, []);

  // 加载特例排班
  useEffect(() => {
    axios.get<SpecialBlock[]>("/api/schedule/special").then((res) => {
      setSpecialSchedule(res.data);
    });
  }, []);

  // 工具函数：加 30 分钟
  const add30Min = (time: string): string => {
    const [h, m] = time.split(":").map(Number);
    const totalMin = h * 60 + m + 30;
    const hh = String(Math.floor(totalMin / 60)).padStart(2, "0");
    const mm = String(totalMin % 60).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  // 保存默认排班
  const saveDefaultSchedule = async () => {
    const map = new Map<string, string[]>(); // day => times[]
    defaultSchedule.forEach((v) => {
      const [d, t] = v.split("_");
      if (!map.has(d)) map.set(d, []);
      map.get(d)?.push(t);
    });

    const blocks: DefaultBlock[] = [];
    for (let [d, times] of map.entries()) {
      const sorted = times.sort();
      let i = 0;
      while (i < sorted.length) {
        let start = sorted[i];
        let end = add30Min(start);
        while (sorted[i + 1] === end) {
          end = add30Min(end);
          i++;
        }
        blocks.push({ day_of_week: Number(d), start_time: start, end_time: end });
        i++;
      }
    }

    await axios.post("/api/schedule/default", blocks);
    alert("✅ 默认排班保存成功！");
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">🕒 我的复习时间表</h1>

      <div className="mb-8">
        <h2 className="font-semibold text-lg mb-2">默认排班</h2>
        <div className="overflow-auto border rounded bg-white">
          <div className="grid grid-cols-[80px_repeat(7,minmax(80px,1fr))]">
            {/* 顶部表头 */}
            <div className="bg-gray-100 border-r border-b p-2 text-center font-bold">时间</div>
            {days.map((d, i) => (
              <div key={i} className="bg-gray-100 border-r border-b p-2 text-center font-bold">
                周{d}
              </div>
            ))}

            {/* 时间格 */}
            {timeSlots.map((time, rowIndex) => (
              <React.Fragment key={rowIndex}>
                {/* 时间列 */}
                <div className="border-r border-b p-1 text-xs text-center bg-gray-50">{time}</div>

                {/* 每一天对应的格子 */}
                {Array.from({ length: 7 }, (_, day) => {
                  const key = `${day}_${time}`;
                  const isSelected = defaultSchedule.has(key);
                  return (
                    <div
                      key={key}
                      onClick={() => {
                        const newSet = new Set(defaultSchedule);
                        if (newSet.has(key)) {
                          newSet.delete(key);
                        } else {
                          newSet.add(key);
                        }
                        setDefaultSchedule(newSet);
                      }}
                      className={`border-r border-b cursor-pointer text-center text-xs p-2 transition-all ${isSelected ? "bg-green-400" : "hover:bg-green-100"
                        }`}
                    >
                      {isSelected ? "✔️" : ""}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

        <button onClick={saveDefaultSchedule} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
          保存默认排班
        </button>
      </div>

      <div>
        <div>
          <h2 className="font-semibold text-lg mb-2">特例排班</h2>

          <div className="space-y-3">
            {specialSchedule.map((item, index) => (
              <div key={item.id ?? `new-${index}`} className="flex items-center gap-2">
                {/* 日期选择 */}
                <input
                  type="date"
                  className="border rounded px-2 py-1"
                  value={item.date}
                  onChange={(e) => {
                    const copy = [...specialSchedule];
                    copy[index].date = e.target.value;
                    setSpecialSchedule(copy);
                  }}
                />

                {/* 起始时间 */}
                <select
                  className="border rounded px-2 py-1"
                  value={item.start_time}
                  onChange={(e) => {
                    const copy = [...specialSchedule];
                    copy[index].start_time = e.target.value;
                    setSpecialSchedule(copy);
                  }}
                >
                  {timeSlots.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>

                <span>至</span>

                {/* 结束时间 */}
                <select
                  className="border rounded px-2 py-1"
                  value={item.end_time}
                  onChange={(e) => {
                    const copy = [...specialSchedule];
                    copy[index].end_time = e.target.value;
                    setSpecialSchedule(copy);
                  }}
                >
                  {timeSlots.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>

                {/* 删除按钮 */}
                <button
                  className="text-red-500 hover:underline text-sm"
                  onClick={async () => {
                    const copy = [...specialSchedule];
                    const removed = copy.splice(index, 1)[0];
                    setSpecialSchedule(copy);
                    if (removed.id) {
                      await axios.delete(`/api/schedule/special/${removed.id}`);
                    }
                  }}
                >
                  🗑 删除
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={() =>
              setSpecialSchedule([
                ...specialSchedule,
                { date: "", start_time: "06:00", end_time: "06:30" },
              ])
            }
            className="mt-4 px-3 py-1 bg-green-500 text-white rounded"
          >
            ➕ 添加特例排班
          </button>

          {/* 自动保存：监听新增项填满后触发 */}
          <button
            className="ml-4 px-3 py-1 bg-blue-500 text-white rounded"
            onClick={async () => {
              for (const item of specialSchedule) {
                if (!item.id && item.date && item.start_time && item.end_time) {
                  await axios.post("/api/schedule/special", item);
                }
              }
              const res = await axios.get("/api/schedule/special");
              setSpecialSchedule(res.data);
              alert("✅ 特例排班已保存！");
            }}
          >
            保存特例排班
          </button>
        </div>
      </div>
    </div>
  );
}
