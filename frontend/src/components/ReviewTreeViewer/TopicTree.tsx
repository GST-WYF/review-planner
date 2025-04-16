import React, { useState } from 'react';
import { TopicNode } from './types';
import * as api from '../../utils/api';

import InputMaterialManager from './InputMaterialManager';
import OutputMaterialManager from './OutputMaterialManager';
import TopicEditor from './TopicEditor';
import AddTopicForm from './AddTopicForm';

type Props = {
  topic: TopicNode;
  level?: number;
  expanded: Record<number, boolean>;
  toggleExpand: (id: number) => void;
  onDelete: (id: number) => void;
  reload: () => void;
  subject_id: number;
};

export default function TopicTree({
  topic,
  level = 0,
  expanded,
  toggleExpand,
  onDelete,
  reload,
  subject_id
}: Props) {
  const [showMaterials, setShowMaterials] = useState(false);
  const [editing, setEditing] = useState(false);
  const [addingChild, setAddingChild] = useState(false);

  const margin = { marginLeft: `${level * 20}px` };

  const handleDelete = async () => {
    if (confirm('确认删除该知识点？')) {
      await api.deleteTopic(topic.topic_id);
      reload();
    }
  };

  return (
    <div className="mb-2" style={margin}>
      <div className="flex gap-2 items-start">
        {/* 展开按钮 */}
        <button
          onClick={() => toggleExpand(topic.topic_id)}
          className="text-blue-500"
        >
          {topic.children.length > 0
            ? expanded[topic.topic_id] ? '▼' : '▶'
            : '•'}
        </button>

        {/* 内容区域 */}
        <div className="flex-1">
          {editing ? (
            <TopicEditor
              topic={topic}
              onClose={() => setEditing(false)}
              onSaved={reload}
            />
          ) : (
            <>
              <div className="font-semibold">{topic.name}</div>
              {/* <div className="text-sm text-gray-700">
                {topic.accuracy !== null && <>准确率: {topic.accuracy} </>}
                {topic.is_leaf && topic.importance !== null && (
                  <>| 重要性: {topic.importance}</>
                )}
              </div> */}
              <div className="text-sm space-x-2">
                <button
                  className="text-blue-600"
                  onClick={() => setEditing(true)}
                >
                  编辑
                </button>
                <button
                  onClick={() => setShowMaterials(!showMaterials)}
                  className="text-indigo-600"
                >
                  {showMaterials ? '收起材料' : '查看材料'}
                </button>
                <button
                  onClick={handleDelete}
                  className="text-red-600"
                >
                  删除
                </button>
                <button
                  onClick={() => setAddingChild(true)}
                  className="text-green-600"
                >
                  ➕ 子章节
                </button>
              </div>
            </>
          )}

          {showMaterials && (
            <div className="text-sm mt-2 space-y-4">
              <InputMaterialManager topic_id={topic.topic_id} />
              <OutputMaterialManager
                owner_type="topic"
                owner_id={topic.topic_id}
              />
            </div>
          )}

          {addingChild && (
            <AddTopicForm
              subject_id={subject_id}
              parent_id={topic.topic_id}
              onAdded={() => {
                setAddingChild(false);
                reload();
              }}
            />
          )}
        </div>
      </div>

      {expanded[topic.topic_id] && topic.children.map(child => (
        <TopicTree
          key={child.topic_id}
          topic={child}
          level={level + 1}
          expanded={expanded}
          toggleExpand={toggleExpand}
          onDelete={onDelete}
          reload={reload}
          subject_id={subject_id}
        />
      ))}
    </div>
  );
}
