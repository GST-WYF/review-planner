import React, { useEffect, useState } from 'react';

type Material = {
  output_id: number;
  type: string;
  title: string;
  accuracy: number | null;
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
      }),
    });
    setNewMaterial({});
    loadMaterials();
  };

  return (
    <div className="text-sm space-y-2">
      <h3 className="font-bold text-gray-700">输出材料列表</h3>
      {materials.map(m => (
        <div key={m.output_id} className="p-2 border rounded space-y-1">
          {editing[m.output_id] ? (
            <>
              <input value={form[m.output_id]?.title || ''} onChange={e =>
                setForm(prev => ({ ...prev, [m.output_id]: { ...prev[m.output_id], title: e.target.value } }))
              } className="border p-1 w-full" />
              <input type="number" min="0" max="1" step="0.01" value={form[m.output_id]?.accuracy ?? ''}
                onChange={e =>
                  setForm(prev => ({ ...prev, [m.output_id]: { ...prev[m.output_id], accuracy: parseFloat(e.target.value) } }))
                } className="border p-1 w-full" />
              <button className="text-green-600" onClick={async () => {
                await fetch(`/api/output/${m.output_id}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ ...m, ...form[m.output_id] })
                });
                setEditing(prev => ({ ...prev, [m.output_id]: false }));
                loadMaterials();
              }}>保存</button>
            </>
          ) : (
            <>
              <div>• [{m.type}] {m.title}（准确率：{m.accuracy ?? '未设置'}）</div>
              <div className="text-xs space-x-2">
                <button className="text-blue-500" onClick={() => {
                  setEditing(prev => ({ ...prev, [m.output_id]: true }));
                  setForm(prev => ({ ...prev, [m.output_id]: m }));
                }}>✏ 编辑</button>
                <button className="text-red-500" onClick={async () => {
                  await fetch(`/api/output/${m.output_id}`, { method: 'DELETE' });
                  loadMaterials();
                }}>🗑 删除</button>
              </div>
            </>
          )}
        </div>
      ))}
      <div className="space-y-1 mt-2">
        <select className="border p-1 w-full" value={newMaterial.type || ''}
          onChange={e => setNewMaterial(prev => ({ ...prev, type: e.target.value }))}>
          <option value="">选择类型</option>
          <option value="exercise_set">练习题</option>
          <option value="mock_exam">模拟卷</option>
        </select>
        <input className="border p-1 w-full" placeholder="标题" value={newMaterial.title || ''}
          onChange={e => setNewMaterial(prev => ({ ...prev, title: e.target.value }))} />
        <input className="border p-1 w-full" type="number" placeholder="准确率 (可选)"
          value={newMaterial.accuracy ?? ''}
          onChange={e => setNewMaterial(prev => ({ ...prev, accuracy: parseFloat(e.target.value) }))} />
        <button className="bg-blue-500 text-white px-2 py-1 rounded" onClick={addMaterial}>➕ 添加材料</button>
      </div>
    </div>
  );
}
