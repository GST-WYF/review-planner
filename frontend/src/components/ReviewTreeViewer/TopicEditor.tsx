import React, { useState } from 'react';
import * as api from '../../utils/api';
import { TopicNode } from './types';

type Props = {
  topic: TopicNode;
  onClose: () => void;
  onSaved: () => void;
};

export default function TopicEditor({ topic, onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    name: topic.name,
    accuracy: topic.accuracy ?? '',
    importance: topic.importance ?? ''
  });

  const handleSave = async () => {
    await api.updateTopic(topic.topic_id, {
      name: form.name,
      accuracy: form.accuracy ? Number(form.accuracy) : null,
      importance: form.importance ? Number(form.importance) : null,
    });
    onSaved();
    onClose();
  };

  return (
    <div className="space-y-1 text-sm">
      <div>
        <label className="block text-gray-600">名称</label>
        <input
          className="border p-1 w-full"
          value={form.name}
          onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
        />
      </div>
      {/* <div>
        <label className="block text-gray-600">准确率</label>
        <input
          className="border p-1 w-full"
          value={form.accuracy}
          onChange={e => setForm(prev => ({ ...prev, accuracy: e.target.value }))}
        />
      </div> */}
      {topic.is_leaf && (
        <div>
          <label className="block text-gray-600">重要性</label>
          <input
            className="border p-1 w-full"
            value={form.importance}
            onChange={e => setForm(prev => ({ ...prev, importance: e.target.value }))}
          />
        </div>
      )}
      <button
        onClick={handleSave}
        className="mt-1 bg-green-500 text-white px-3 py-1 rounded"
      >
        保存
      </button>
      <button
        onClick={onClose}
        className="ml-2 text-gray-600"
      >
        取消
      </button>
    </div>
  );
}
