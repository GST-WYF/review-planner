import React, { useEffect, useState } from 'react';

type Material = {
  output_id: number;
  type: string;
  title: string;
  accuracy: number | null;
  required_hours: number;
  reviewed_hours: number;
  is_completed: boolean;
};

type Props = {
  owner_type: 'topic' | 'subject' | 'exam';
  owner_id: number;
};

export default function OutputMaterialManager({ owner_type, owner_id }: Props) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [editing, setEditing] = useState<Record<number, boolean>>({});
  const [form, setForm] = useState<Record<number, Partial<Material>>>({});
  const [newMaterial, setNewMaterial] = useState<Partial<Material>>({});

  useEffect(() => {
    loadMaterials();
  }, [owner_type, owner_id]);

  const loadMaterials = async () => {
    const res = await fetch(`/api/materials?owner_type=${owner_type}&owner_id=${owner_id}`);
    const data = await res.json();
    setMaterials(data);
  };

  const addMaterial = async () => {
    if (!newMaterial.type || !newMaterial.title) {
      alert("请填写类型和标题");
      return;
    }
    await fetch("/api/material", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        owner_type,
        owner_id,
        ...newMaterial,
        is_completed: newMaterial.is_completed ?? false
      }),
    });
    setNewMaterial({});
    loadMaterials();
  };

  return (
    <div className="text-xs space-y-2">
      <div className="font-semibold text-gray-700">📤 输出材料</div>

      {materials.map(m => (
        <div key={m.output_id} className="border p-2 rounded">
          {editing[m.output_id] ? (
            <div className="flex flex-wrap gap-1 items-center">
              <input className="border p-1 w-32" value={form[m.output_id]?.title || ''}
                onChange={e =>
                  setForm(prev => ({ ...prev, [m.output_id]: { ...prev[m.output_id], title: e.target.value } }))
                } placeholder="标题" />
              <input type="number" className="border p-1 w-20" placeholder="准确率"
                value={form[m.output_id]?.accuracy ?? ''}
                onChange={e =>
                  setForm(prev => ({ ...prev, [m.output_id]: { ...prev[m.output_id], accuracy: parseFloat(e.target.value) } }))
                } />
              <input type="number" className="border p-1 w-20" placeholder="需时"
                value={form[m.output_id]?.required_hours ?? ''}
                onChange={e =>
                  setForm(prev => ({
                    ...prev,
                    [m.output_id]: {
                      ...prev[m.output_id],
                      required_hours: parseFloat(e.target.value),
                    },
                  }))
                }
              />
              <input type="number" className="border p-1 w-20" placeholder="已复"
                value={form[m.output_id]?.reviewed_hours ?? ''}
                onChange={e =>
                  setForm(prev => ({
                    ...prev,
                    [m.output_id]: {
                      ...prev[m.output_id],
                      reviewed_hours: parseFloat(e.target.value),
                    },
                  }))
                }
              />
              <label className="flex items-center gap-1 text-xs">
                <input type="checkbox"
                  checked={form[m.output_id]?.is_completed ?? m.is_completed}
                  onChange={e =>
                    setForm(prev => ({ ...prev, [m.output_id]: { ...prev[m.output_id], is_completed: e.target.checked } }))
                  }
                />
                已完成
              </label>
              <button className="text-green-600" onClick={async () => {
                await fetch(`/api/output/${m.output_id}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ ...m, ...form[m.output_id] })
                });
                setEditing(prev => ({ ...prev, [m.output_id]: false }));
                loadMaterials();
              }}>💾</button>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <div>
                • [{m.type}] {m.title}（准确率: {m.accuracy ?? '未设置'}，
                复习: {m.reviewed_hours} / {m.required_hours} 小时）
                {m.is_completed && <span className="text-green-600 ml-2">✅ 已完成</span>}
              </div>
              <div className="space-x-2">
                <button className="text-blue-500" onClick={() => {
                  setEditing(prev => ({ ...prev, [m.output_id]: true }));
                  setForm(prev => ({ ...prev, [m.output_id]: m }));
                }}>✏</button>
                <button className="text-red-500" onClick={async () => {
                  await fetch(`/api/output/${m.output_id}`, { method: 'DELETE' });
                  loadMaterials();
                }}>🗑</button>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* 添加新材料 */}
      <div className="flex flex-wrap gap-1 items-center mt-2">
        <select className="border p-1 text-xs" value={newMaterial.type || ''}
          onChange={e => setNewMaterial(prev => ({ ...prev, type: e.target.value }))}>
          <option value="">类型</option>
          <option value="exercise_set">练习题</option>
          <option value="mock_exam">模拟卷</option>
        </select>
        <input className="border p-1 w-32" placeholder="标题"
          value={newMaterial.title || ''}
          onChange={e => setNewMaterial(prev => ({ ...prev, title: e.target.value }))} />
        <input type="number" className="border p-1 w-20" placeholder="准确率"
          value={newMaterial.accuracy ?? ''}
          onChange={e => setNewMaterial(prev => ({ ...prev, accuracy: parseFloat(e.target.value) }))} />
        <input type="number" className="border p-1 w-20" placeholder="需时"
          value={newMaterial.required_hours ?? ''}
          onChange={e => setNewMaterial(prev => ({ ...prev, required_hours: parseFloat(e.target.value) }))} />
        <input type="number" className="border p-1 w-20" placeholder="已复"
          value={newMaterial.reviewed_hours ?? ''}
          onChange={e => setNewMaterial(prev => ({ ...prev, reviewed_hours: parseFloat(e.target.value) }))} />
        <label className="flex items-center gap-1 text-xs">
          <input type="checkbox"
            checked={newMaterial.is_completed || false}
            onChange={e => setNewMaterial(prev => ({ ...prev, is_completed: e.target.checked }))} />
          已完成
        </label>
        <button className="bg-blue-500 text-white px-2 py-0.5 rounded" onClick={addMaterial}>➕</button>
      </div>
    </div>
  );
}
