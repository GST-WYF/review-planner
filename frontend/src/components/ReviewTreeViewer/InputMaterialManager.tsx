import React, { useEffect, useState } from 'react';

type InputMaterial = {
  input_id: number;
  type: string;
  title: string;
  required_hours: number;
  reviewed_hours: number;
};

type Props = {
  topic_id: number;
};

export default function InputMaterialManager({ topic_id }: Props) {
  const [materials, setMaterials] = useState<InputMaterial[]>([]);
  const [editing, setEditing] = useState<Record<number, boolean>>({});
  const [form, setForm] = useState<Record<number, Partial<InputMaterial>>>({});
  const [newMaterial, setNewMaterial] = useState<Partial<InputMaterial>>({});

  useEffect(() => {
    load();
  }, [topic_id]);

  const load = async () => {
    const res = await fetch(`/api/topic/${topic_id}/materials`);
    const data = await res.json();
    setMaterials(data.input_materials || []);
  };

  const addMaterial = async () => {
    if (!newMaterial.type || !newMaterial.title || newMaterial.required_hours == null || newMaterial.reviewed_hours == null) {
      alert("请填写所有字段");
      return;
    }
    await fetch(`/api/topic/${topic_id}/input`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMaterial)
    });
    setNewMaterial({});
    load();
  };

  return (
    <div className="text-xs space-y-2">
      <div className="font-semibold text-gray-700">📥 输入材料</div>
      {materials.map(m => (
        <div key={m.input_id} className="border p-2 rounded">
          {editing[m.input_id] ? (
            <div className="flex flex-wrap gap-1 items-center">
              <input className="border p-1 w-32" value={form[m.input_id]?.title || ''}
                onChange={e =>
                  setForm(prev => ({ ...prev, [m.input_id]: { ...prev[m.input_id], title: e.target.value } }))
                } placeholder="标题" />
              <input type="number" className="border p-1 w-20" placeholder="需时"
                value={form[m.input_id]?.required_hours ?? ''}
                onChange={e =>
                  setForm(prev => ({ ...prev, [m.input_id]: { ...prev[m.input_id], required_hours: parseFloat(e.target.value) } }))
                } />
              <input type="number" className="border p-1 w-20" placeholder="已复习"
                value={form[m.input_id]?.reviewed_hours ?? ''}
                onChange={e =>
                  setForm(prev => ({ ...prev, [m.input_id]: { ...prev[m.input_id], reviewed_hours: parseFloat(e.target.value) } }))
                } />
              <button className="text-green-600" onClick={async () => {
                await fetch(`/api/input/${m.input_id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ ...m, ...form[m.input_id] })
                });
                setEditing(prev => ({ ...prev, [m.input_id]: false }));
                load();
              }}>💾</button>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <div>• [{m.type}] {m.title}（{m.reviewed_hours} / {m.required_hours} 小时）</div>
              <div className="space-x-2">
                <button className="text-blue-500" onClick={() => {
                  setEditing(prev => ({ ...prev, [m.input_id]: true }));
                  setForm(prev => ({ ...prev, [m.input_id]: m }));
                }}>✏</button>
                <button className="text-red-500" onClick={async () => {
                  await fetch(`/api/input/${m.input_id}`, { method: 'DELETE' });
                  load();
                }}>🗑</button>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* 添加新材料 */}
      <div className="flex flex-wrap gap-1 items-center mt-1">
        <select className="border p-1 text-xs" value={newMaterial.type || ''}
          onChange={e => setNewMaterial(prev => ({ ...prev, type: e.target.value }))}>
          <option value="">类型</option>
          <option value="note">笔记</option>
          <option value="video">视频</option>
          <option value="recite">背诵</option>
        </select>
        <input className="border p-1 w-32" placeholder="标题"
          value={newMaterial.title || ''}
          onChange={e => setNewMaterial(prev => ({ ...prev, title: e.target.value }))} />
        <input type="number" className="border p-1 w-20" placeholder="需时"
          value={newMaterial.required_hours ?? ''}
          onChange={e => setNewMaterial(prev => ({ ...prev, required_hours: parseFloat(e.target.value) }))} />
        <input type="number" className="border p-1 w-20" placeholder="已复"
          value={newMaterial.reviewed_hours ?? ''}
          onChange={e => setNewMaterial(prev => ({ ...prev, reviewed_hours: parseFloat(e.target.value) }))} />
        <button className="bg-green-500 text-white px-2 py-0.5 rounded" onClick={addMaterial}>➕</button>
      </div>
    </div>
  );
}
