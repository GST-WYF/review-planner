import { useEffect, useState } from 'react';

type ReviewTask = {
  id: number;
  reviewed_at: string;
  node_type: string;
  node_id: number;
  input_material_id: number | null;
  output_material_id: number | null;
  duration_minutes: number;
  notes: string | null;

  node_name?: string | null;
  input_material_title?: string | null;
  output_material_title?: string | null;
};

export default function ReviewLogPage() {
  const [logs, setLogs] = useState<ReviewTask[]>([]);

  useEffect(() => {
    fetch('/api/review-tasks')
      .then(res => res.json())
      .then(setLogs);
  }, []);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📘 所有复习记录</h1>
      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">日期</th>
            <th className="p-2">类型</th>
            <th className="p-2">材料</th>
            <th className="p-2">时长</th>
            <th className="p-2">备注</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id} className="border-t">
              <td className="p-2">{log.reviewed_at}</td>
              <td className="p-2">{log.node_type}：{log.node_name || log.node_id}</td>
              <td className="p-2">
                {log.input_material_title
                  ? `输入：${log.input_material_title}`
                  : log.output_material_title
                  ? `输出：${log.output_material_title}`
                  : '—'}
              </td>
              <td className="p-2">{log.duration_minutes} 分钟</td>
              <td className="p-2">{log.notes || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
