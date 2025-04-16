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

  const handleSubmit = async () => {
    if (!name) {
      alert('请填写名称');
      return;
    }

    await api.createTopic({
      subject_id,
      parent_id: parent_id ?? null,
      name,
      is_leaf: isLeaf === 'true',
      accuracy: null,
      importance: null,
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
        <label className="text-gray-600">是否叶子</label>
        <select
          className="border p-1 w-full"
          value={isLeaf}
          onChange={e => setIsLeaf(e.target.value)}
        >
          <option value="true">是</option>
          <option value="false">否</option>
        </select>
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
