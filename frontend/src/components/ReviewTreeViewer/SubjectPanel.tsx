import React, { useState, useEffect } from 'react';
import { Subject, ExamInfo } from './types';
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
  subjects,
  handlers,
  uiState
}: Props) {
  const { toggleExpand, reload } = handlers;
  const { expanded } = uiState;
  const [examInfo, setExamInfo] = useState<ExamInfo | null>(null);  // 🔥 exam 独立信息
  const [newSubjectName, setNewSubjectName] = useState<string>('');
  const [newSubjectPriority, setNewSubjectPriority] = useState<number>(5);
  const [addingRoot, setAddingRoot] = useState<Record<number, boolean>>({});
  const [editingPriority, setEditingPriority] = useState<Record<number, number>>({});

  useEffect(() => {
    async function fetchExamInfo() {
      const res = await api.getExam(examId);
      setExamInfo(res);
    }
    fetchExamInfo();
  }, [examId]);

  const createSubject = async () => {
    if (!newSubjectName) return alert('请输入科目名称！');
    await api.createSubject({
      exam_id: examId,
      subject_name: newSubjectName,
      priority: newSubjectPriority,
    });
    setNewSubjectName('');
    setNewSubjectPriority(5);
    reload();
  };

  const updateSubjectPriority = async (subjectId: number) => {
    const priority = editingPriority[subjectId];
    if (priority == null || priority < 0 || priority > 9) {
      alert('优先级必须是0~9的整数');
      return;
    }
    await api.updateSubject(subjectId, { priority });
    reload();
  };

  const updateExamPriority = async () => {
    if (!examInfo) return;
    if (examInfo.priority < 0 || examInfo.priority > 9) {
      alert('考试优先级必须是0~9之间');
      return;
    }
    await api.updateExam(examId, { priority: examInfo.priority });
    reload();
  };

  if (!examInfo) {
    return <div>加载中...</div>;
  }

  return (
    <div className="mb-6 border p-4 rounded shadow">
      <h2 className="text-2xl font-bold mb-3 flex items-center justify-between">
        🎓 考试：{examInfo.exam_name}（ID: {examInfo.exam_id}）
        <div className="flex items-center space-x-2">
          <input
            type="number"
            min={0}
            max={9}
            className="border p-1 w-16"
            value={examInfo.priority}
            onChange={(e) =>
              setExamInfo(prev => prev ? { ...prev, priority: Number(e.target.value) } : null)
            }
          />
          <button
            className="bg-green-600 text-white px-2 py-1 rounded text-sm"
            onClick={updateExamPriority}
          >
            保存考试优先级
          </button>
        </div>
      </h2>

      <div className="mt-2">
        <OutputMaterialManager
          owner_type="exam"
          owner_id={examId}
        />
      </div>

      {subjects.map(subject => (
        <div key={subject.subject_id} className="mb-4 border-t pt-3">
          <h3 className="text-xl font-semibold mb-1 flex items-center justify-between">
            <span>📚 {subject.subject_name}</span>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min={0}
                max={9}
                className="border p-1 w-16"
                value={editingPriority[subject.subject_id] ?? subject.priority}
                onChange={(e) =>
                  setEditingPriority(prev => ({
                    ...prev,
                    [subject.subject_id]: Number(e.target.value)
                  }))
                }
              />
              <button
                className="bg-green-600 text-white px-2 py-1 rounded text-sm"
                onClick={() => updateSubjectPriority(subject.subject_id)}
              >
                保存科目优先级
              </button>
            </div>
          </h3>

          <div className="mt-2">
            <OutputMaterialManager
              owner_type="subject"
              owner_id={subject.subject_id}
            />
          </div>

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

          {addingRoot[subject.subject_id] ? (
            <AddTopicForm
              subject_id={subject.subject_id}
              parent_id={null}
              onAdded={() => {
                setAddingRoot(prev => ({ ...prev, [subject.subject_id]: false }));
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
              ➕ 添加章节
            </button>
          )}

        </div>
      ))}

      {/* 添加新科目 */}
      <div className="mt-6 text-sm space-x-2">
        <input
          className="border p-1"
          placeholder="新科目名称"
          value={newSubjectName}
          onChange={e => setNewSubjectName(e.target.value)}
        />
        <input
          className="border p-1 w-16"
          type="number"
          min={0}
          max={9}
          value={newSubjectPriority}
          onChange={e => setNewSubjectPriority(Number(e.target.value))}
          placeholder="优先级"
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
