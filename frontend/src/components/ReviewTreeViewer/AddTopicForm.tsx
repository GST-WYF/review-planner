import React, { useState } from 'react';
import * as api from '../../utils/api';

type Props = {
  subject_id: number;
  parent_id?: number | null;
  onAdded: () => void;
};

export default function AddTopicForm({ subject_id, parent_id, onAdded }: Props) {
  const [name, setName] = useState('');
  const [isLeaf, setIsLeaf] = useState('true');
  const [importance, setImportance] = useState<number>(5); // ➡️ 新增重要性字段，默认5

  const handleSubmit = async () => {
    if (!name) {
      alert('请填写名称');
      return;
    }
    if (importance < 0 || importance > 9) {
      alert('重要性必须在0~9之间');
      return;
    }

    await api.createTopic({
      subject_id,
      parent_id: parent_id ?? null,
      name,
      is_leaf: isLeaf === 'true',
      accuracy: null,
      importance,
    });

    onAdded();
  };

  return (
    <div className="mt-2 p-2 border rounded text-sm space-y-1">
      <div>
        <label className="text-gray-600">名称</label>
        <input
          className="border p-1 w-full"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>
      <div>
        <label className="text-gray-600">是否为知识点🍃</label>
        <select
          className="border p-1 w-full"
          value={isLeaf}
          onChange={e => setIsLeaf(e.target.value)}
        >
          <option value="true">是</option>
          <option value="false">否</option>
        </select>
      </div>
      <div>
        <label className="text-gray-600">重要性（0~9）⭐</label>
        <input
          type="number"
          min={0}
          max={9}
          className="border p-1 w-full"
          value={importance}
          onChange={e => setImportance(Number(e.target.value))}
        />
      </div>
      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white px-2 py-1 rounded mt-1"
      >
        添加
      </button>
    </div>
  );
}
