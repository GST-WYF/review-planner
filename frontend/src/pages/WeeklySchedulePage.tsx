import React, { useEffect, useState } from "react";

// 每个时间格的时长（分钟）
const SLOT_SIZE = 30;

// 生成时间段表（06:00 – 23:00，每 30 分钟一个槽）
const timeSlots: string[] = (() => {
  const slots: string[] = [];
  for (let h = 6; h <= 23; h++) {
    for (let m of [0, 30]) {
      if (h === 23 && m === 30) continue; // 23:30 以后不显示
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return slots;
})();

const weekdays = ["日", "一", "二", "三", "四", "五", "六"];

// 将 "HH:mm" 转为总分钟
const timeToMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

// 将总分钟转回 "HH:mm"
const minutesToTime = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

export type Task = {
  date: string; // YYYY-MM-DD
  start: string; // HH:mm
  end: string; // HH:mm
  task_type: string;
  task_name: string;
  hours_assigned: number; // minutes
};

export default function WeeklySchedulePage() {
  const [schedule, setSchedule] = useState<Task[]>([]);

  // 拉取任务
  useEffect(() => {
    fetch("/api/schedule")
      .then((res) => res.json())
      .then((data) => setSchedule(data.schedule ?? []))
      .catch(() => setSchedule([]));
  }, []);

  // 今天开始连续 7 天的日期
  const today = new Date();
  const next7Dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d.toISOString().split("T")[0];
  });

  // 显示用星期标题
  const todayIndex = today.getDay();
  const daysOfWeek = Array.from({ length: 7 }, (_, i) => weekdays[(todayIndex + i) % 7]);

  const tasksThisWeek = schedule.filter((t) => next7Dates.includes(t.date));
  const otherTasks = schedule.filter((t) => !next7Dates.includes(t.date));

  /**
   * gridMap: key = `${date}_${timeSlot}`, value = Task[]
   * 把跨多个槽的任务拆分到对应槽位里
   */
  const gridMap: Record<string, Task[]> = {};
  for (const task of tasksThisWeek) {
    const startMin = timeToMinutes(task.start);
    const endMin = timeToMinutes(task.end);
    const slotCount = Math.max(1, Math.ceil((endMin - startMin) / SLOT_SIZE));

    for (let i = 0; i < slotCount; i++) {
      const slotMin = startMin + i * SLOT_SIZE;
      const slotTime = minutesToTime(slotMin);
      const key = `${task.date}_${slotTime}`;
      if (!gridMap[key]) gridMap[key] = [];
      gridMap[key].push(task);
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">🗓️ 本周计划</h1>

      {/* 周视图 */}
      <div className="overflow-auto border rounded bg-white mb-8 shadow-sm">
        <div className="grid grid-cols-[80px_repeat(7,minmax(120px,1fr))]">
          {/* 表头 */}
          <div className="bg-gray-100 border-r border-b p-2 text-center font-bold">时间</div>
          {next7Dates.map((date, i) => (
            <div key={date} className="bg-gray-100 border-r border-b p-2 text-center font-bold">
              周{daysOfWeek[i]}
              <br />
              <span className="text-xs text-gray-500">{date}</span>
            </div>
          ))}

          {/* 时间格子 */}
          {timeSlots.map((time) => (
            <React.Fragment key={time}>
              <div className="border-r border-b p-1 text-xs text-center bg-gray-50">{time}</div>
              {next7Dates.map((date) => {
                const key = `${date}_${time}`;
                const tasks = gridMap[key] ?? [];
                return (
                  <div
                    key={key}
                    className={`border-r border-b p-1 text-xs h-[60px] overflow-auto transition-colors ${tasks.length ? "bg-green-100" : "bg-white"}`}
                  >
                    {tasks.map((task, idx) => (
                      <div key={idx} className="mb-1 leading-snug">
                        <span className="font-semibold text-green-800">{task.task_type}：</span>
                        {task.task_name}
                      </div>
                    ))}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 未来任务列表 */}
      <h2 className="text-xl font-bold my-4">📋 未来任务</h2>
      <div className="overflow-auto shadow-sm">
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">日期</th>
              <th className="border p-2">时间</th>
              <th className="border p-2">任务</th>
              <th className="border p-2">类型</th>
              <th className="border p-2">时长</th>
            </tr>
          </thead>
          <tbody>
            {otherTasks.map((task, idx) => (
              <tr key={idx} className="odd:bg-white even:bg-gray-50">
                <td className="border p-2 whitespace-nowrap">{task.date}</td>
                <td className="border p-2 whitespace-nowrap">
                  {task.start} – {task.end}
                </td>
                <td className="border p-2">{task.task_name}</td>
                <td className="border p-2">{task.task_type}</td>
                <td className="border p-2 text-right">{task.hours_assigned} 分钟</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
