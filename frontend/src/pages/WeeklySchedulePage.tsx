import React, { useEffect, useState } from 'react';

// 定义一个时间段表
const timeSlots = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00',
  '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
];

const daysOfWeek = ['一', '二', '三', '四', '五', '六', '日'];

type Task = {
  date: string;
  start: string;
  end: string;
  task_type: string;
  task_name: string;
  hours_assigned: number;
};

export default function WeeklySchedulePage() {
  const [schedule, setSchedule] = useState<Task[]>([]);

  useEffect(() => {
    fetch('/api/schedule')
      .then(res => res.json())
      .then(data => {
        setSchedule(data.schedule || []);
      });
  }, []);

  // 今天起 7 天内的日期
  const today = new Date();
  const next7Dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d.toISOString().split("T")[0];
  });

  const dateToWeekdayMap: { [date: string]: number } = {};
  next7Dates.forEach((date, idx) => {
    dateToWeekdayMap[date] = idx;
  });

  const tasksThisWeek = schedule.filter(task => next7Dates.includes(task.date));
  const otherTasks = schedule.filter(task => !next7Dates.includes(task.date));

  // 把任务按 日期 + 时间 开一个 map 存进格子里用
  const gridMap: { [key: string]: Task[] } = {};
  for (const task of tasksThisWeek) {
    const key = `${task.date}_${task.start}`;
    if (!gridMap[key]) {
      gridMap[key] = [];
    }
    gridMap[key].push(task);
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">🗓️ 本周排班</h1>

      <div className="overflow-auto border rounded bg-white mb-8">
        <div className="grid grid-cols-[80px_repeat(7,minmax(120px,1fr))]">
          {/* 表头 */}
          <div className="bg-gray-100 border-r border-b p-2 text-center font-bold">时间</div>
          {next7Dates.map((date, i) => (
            <div key={i} className="bg-gray-100 border-r border-b p-2 text-center font-bold">
              周{daysOfWeek[i]}<br />
              <span className="text-xs text-gray-500">{date}</span>
            </div>
          ))}

          {/* 时间格子 */}
          {timeSlots.map((time, rowIndex) => (
            <React.Fragment key={rowIndex}>
              <div className="border-r border-b p-1 text-xs text-center bg-gray-50">{time}</div>
              {next7Dates.map((date, colIndex) => {
                const key = `${date}_${time}`;
                const tasks = gridMap[key] || [];

                return (
                  <div
                    key={colIndex}
                    className={`border-r border-b p-1 text-xs h-[60px] overflow-auto ${tasks.length > 0 ? 'bg-green-100' : 'bg-white'}`}
                  >
                    {tasks.map((task, i) => (
                      <div key={i} className="mb-1">
                        <span className="font-semibold text-green-800">{task.task_type === 'input' ? '📝' : '📤'}</span>
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

      {/* 剩余任务展示 */}
      <h2 className="text-xl font-bold my-4">📋 未来任务</h2>
      <div className="overflow-auto">
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
              <tr key={idx}>
                <td className="border p-2">{task.date}</td>
                <td className="border p-2">{task.start} - {task.end}</td>
                <td className="border p-2">{task.task_name}</td>
                <td className="border p-2">{task.task_type}</td>
                <td className="border p-2">{task.hours_assigned}h</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
