import React, { useState } from 'react';
import { Subject } from './types';
import AddTopicForm from './AddTopicForm';
import TopicTree from './TopicTree';
import OutputMaterialManager from './OutputMaterialManager';
import * as api from '../../utils/api';

type Props = {
  examId: number;
  examName: string;
  subjects: Subject[];
  handlers: {
    toggleExpand: (id: number) => void;
    reload: () => void;
  };
  uiState?: any;
};

export default function SubjectPanel({
  examId,
  examName,
  subjects,
  handlers,
  uiState
}: Props) {
  const { toggleExpand, reload } = handlers;
  const { expanded } = uiState;
  const [newSubjectName, setNewSubjectName] = useState<string>('');
  const [addingRoot, setAddingRoot] = useState<Record<number, boolean>>({});


  const createSubject = async () => {
    if (!newSubjectName) return alert('请输入科目名称！');
    await api.createSubject({
      exam_id: examId,
      subject_name: newSubjectName
    });
    setNewSubjectName('');
    reload();
  };

  return (
    <div className="mb-6 border p-4 rounded shadow">
      <h2 className="text-2xl font-bold mb-3">
        🎓 考试：{examName}（ID: {examId}）
      </h2>

      <div className="mt-2">
        <OutputMaterialManager
          owner_type="exam"
          owner_id={examId}
        />
      </div>

      {subjects.map(subject => (
        <div key={subject.subject_id} className="mb-4">
          <h3 className="text-xl font-semibold mb-1">
            📘 {subject.subject_name}
          </h3>
          <div className="mt-2">
            <OutputMaterialManager
              owner_type="subject"
              owner_id={subject.subject_id}
            />
          </div>

          {/* 展示 subject 下的 topic 树 */}
          {subject.topics.map(topic => (
            <TopicTree
              key={topic.topic_id}
              topic={topic}
              expanded={expanded}
              toggleExpand={toggleExpand}
              onDelete={() => { }}
              reload={reload}
              subject_id={subject.subject_id}
            />
          ))}

          {/* 添加根 topic */}
          {addingRoot[subject.subject_id] ? (
            <AddTopicForm
              subject_id={subject.subject_id}
              parent_id={null}
              onAdded={() => {
                setAddingRoot(prev => ({ ...prev, [subject.subject_id]: false }))
                reload();
              }}
            />
          ) : (
            <button
              className="text-green-600 mt-2 text-sm"
              onClick={() =>
                setAddingRoot(prev => ({ ...prev, [subject.subject_id]: true }))
              }
            >
              ➕ 添加知识点
            </button>
          )}

        </div>
      ))}

      <div className="mt-4 text-sm space-x-2">
        <input
          className="border p-1"
          placeholder="新科目名称"
          value={newSubjectName}
          onChange={e => setNewSubjectName(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-3 py-1 rounded"
          onClick={createSubject}
        >
          ➕ 添加科目
        </button>
      </div>
    </div>
  );
}
