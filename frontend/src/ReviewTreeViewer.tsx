
import React, { useEffect, useState } from 'react';
import OutputMaterialManager from './OutputMaterialManager';
import InputMaterialManager from './InputMaterialManager';

type TopicNode = {
  topic_id: number;
  name: string;
  accuracy: number | null;
  importance: number | null;
  is_leaf: boolean;
  children: TopicNode[];
};


type Subject = {
  subject_id: number;
  subject_name: string;
  exam_id: number;        // ✅ 加上这个
  exam_name: string;      // ✅ 加上这个
  topics: TopicNode[];
};

type MaterialInput = {
  type: string;
  title: string;
  required_hours?: number;
  reviewed_hours?: number;
  accuracy?: number;
};



export default function ReviewTreeViewer() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [materials, setMaterials] = useState<Record<number, any>>({});
  const [editing, setEditing] = useState<Record<number, boolean>>({});
  const [formState, setFormState] = useState<Record<number, any>>({});
  const [addingChild, setAddingChild] = useState<Record<number, boolean>>({});
  const [newChild, setNewChild] = useState<Record<number, any>>({});
  const [editingMaterial, setEditingMaterial] = useState<Record<string, boolean>>({});
  const [materialForm, setMaterialForm] = useState<Record<string, any>>({});
  const [newSubjectName, setNewSubjectName] = useState<Record<number, string>>({});
  const [addingRoot, setAddingRoot] = useState<Record<number, boolean>>({});
  const [newRootTopic, setNewRootTopic] = useState<Record<number, any>>({});

  const subjectsByExam: Record<number, { exam_name: string, subjects: Subject[] }> = {};
  subjects.forEach(subject => {
    if (!subjectsByExam[subject.exam_id]) {
      subjectsByExam[subject.exam_id] = { exam_name: subject.exam_name, subjects: [] };
    }
    subjectsByExam[subject.exam_id].subjects.push(subject);
  });


  useEffect(() => {
    fetch('/api/review-tree')
      .then(res => res.json())
      .then(setSubjects);
  }, []);

  const toggle = (id: number) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const loadMaterials = async (topic_id: number) => {
    if (!materials[topic_id]) {
      const res = await fetch(`/api/topic/${topic_id}/materials`);
      const data = await res.json();
      setMaterials(prev => ({ ...prev, [topic_id]: data }));
    }
  };

  const handleEdit = (topic: TopicNode) => {
    setEditing(prev => ({ ...prev, [topic.topic_id]: true }));
    setFormState(prev => ({
      ...prev,
      [topic.topic_id]: {
        name: topic.name,
        accuracy: topic.accuracy ?? '',
        importance: topic.importance ?? '',
      },
    }));
  };

  const saveEdit = async (topic: TopicNode) => {
    const data = formState[topic.topic_id];
    await fetch(`/api/topic/${topic.topic_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setEditing(prev => ({ ...prev, [topic.topic_id]: false }));
    location.reload();
  };

  const deleteTopic = async (id: number) => {
    if (confirm('确认删除该知识点？')) {
      await fetch(`/api/topic/${id}`, { method: 'DELETE' });
      location.reload();
    }
  };

  const addChild = async (parent_id: number, subject_id: number) => {
    const child = newChild[parent_id];

    const isLeaf = child?.is_leaf === true || child?.is_leaf === 'true';

    if (!child?.name || (isLeaf !== true && isLeaf !== false)) {
      alert("请填写名称并选择是否叶子");
      return;
    }

    const payload = {
      subject_id,
      parent_id,
      name: child.name,
      is_leaf: isLeaf,
      accuracy: null,
      importance: null
    };

    await fetch('/api/topic/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    location.reload();
  };


  const renderTopic = (topic: TopicNode, level = 0, subject_id: number) => {
    const margin = { marginLeft: `${level * 20}px` };
    const mat = materials[topic.topic_id];

    return (
      <div key={topic.topic_id} className="mb-2">
        <div className="flex gap-2 items-start" style={margin}>
          <button onClick={() => toggle(topic.topic_id)} className="text-blue-500">
            {topic.children.length > 0 ? (expanded[topic.topic_id] ? '▼' : '▶') : '•'}
          </button>
          <div className="flex-1">
            {editing[topic.topic_id] ? (
              <div className="space-y-1 text-sm">
                <div>
                  <label className="block text-gray-600">名称</label>
                  <input className="border p-1 w-full" value={formState[topic.topic_id]?.name}
                    onChange={e => setFormState(prev => ({
                      ...prev,
                      [topic.topic_id]: { ...prev[topic.topic_id], name: e.target.value }
                    }))} />
                </div>
                <div>
                  <label className="block text-gray-600">准确率</label>
                  <input className="border p-1 w-full" value={formState[topic.topic_id]?.accuracy}
                    onChange={e => setFormState(prev => ({
                      ...prev,
                      [topic.topic_id]: { ...prev[topic.topic_id], accuracy: e.target.value }
                    }))} />
                </div>
                {topic.is_leaf && (
                  <div>
                    <label className="block text-gray-600">重要性</label>
                    <input className="border p-1 w-full" value={formState[topic.topic_id]?.importance}
                      onChange={e => setFormState(prev => ({
                        ...prev,
                        [topic.topic_id]: { ...prev[topic.topic_id], importance: e.target.value }
                      }))} />
                  </div>
                )}
                <button onClick={() => saveEdit(topic)} className="mt-1 bg-green-500 text-white px-3 py-1 rounded">保存</button>
              </div>
            ) : (
              <div>
                <div className="font-semibold">{topic.name}</div>
                <div className="text-sm text-gray-700">
                  {topic.accuracy !== null && <>准确率: {topic.accuracy} </>}
                  {topic.is_leaf && topic.importance !== null && <>| 重要性: {topic.importance}</>}
                </div>
                <div className="text-sm space-x-2">
                  <button className="text-blue-600" onClick={() => handleEdit(topic)}>编辑</button>
                  {<button onClick={() => loadMaterials(topic.topic_id)} className="text-indigo-600">查看材料</button>}
                  <button onClick={() => deleteTopic(topic.topic_id)} className="text-red-600">删除</button>
                  <button onClick={() => setAddingChild(prev => ({ ...prev, [topic.topic_id]: true }))} className="text-green-600">➕ 子节点</button>
                </div>
              </div>
            )}
            {mat && (
              <div className="text-sm mt-2 space-y-4">
                <InputMaterialManager topic_id={topic.topic_id} />
                <OutputMaterialManager owner_type="topic" owner_id={topic.topic_id} />
              </div>
            )}
            {addingChild[topic.topic_id] && (
              <div className="mt-2 p-2 border rounded text-sm space-y-1">
                <div>
                  <label className="text-gray-600">名称</label>
                  <input className="border p-1 w-full"
                    onChange={e =>
                      setNewChild(prev => ({
                        ...prev,
                        [topic.topic_id]: { ...(prev[topic.topic_id] || {}), name: e.target.value }
                      }))
                    } />
                </div>
                <div>
                  <label className="text-gray-600">是否叶子</label>
                  <select className="border p-1 w-full"
                    onChange={e =>
                      setNewChild(prev => ({
                        ...prev,
                        [topic.topic_id]: { ...(prev[topic.topic_id] || {}), is_leaf: e.target.value === 'true' }
                      }))
                    }>
                    <option value="true">是</option>
                    <option value="false">否</option>
                  </select>
                </div>
                <button onClick={() => addChild(topic.topic_id, subject_id)} className="bg-blue-500 text-white px-2 py-1 rounded mt-1">添加</button>
              </div>
            )}
          </div>
        </div>

        {expanded[topic.topic_id] &&
          topic.children.map(child => renderTopic(child, level + 1, subject_id))}
      </div>
    );
  };

  return (
    <>
      {Object.entries(subjectsByExam).map(([examIdStr, data]) => {
        const examId = parseInt(examIdStr);
        const { exam_name, subjects } = data;
        return (
          <div key={examId} className="mb-6 border p-4 rounded shadow">
            <h2 className="text-2xl font-bold mb-3">🎓 考试：{exam_name}（ID: {examId}）</h2>
            <div className="mt-2">
              <OutputMaterialManager owner_type="exam" owner_id={examId} />
            </div>
            {subjects.map(subject => (
              <div key={subject.subject_id} className="mb-4">
                <h3 className="text-xl font-semibold mb-1">📘 {subject.subject_name}</h3>
                <div className="mt-2">
                  <OutputMaterialManager owner_type="subject" owner_id={subject.subject_id} />
                </div>

                {subject.topics.map(topic => renderTopic(topic, 0, subject.subject_id))}

                <div className="mt-2 text-sm space-x-2">
                  <button className="text-green-600" onClick={() =>
                    setAddingRoot(prev => ({ ...prev, [subject.subject_id]: true }))
                  }>➕ 添加知识点</button>
                </div>

                {addingRoot[subject.subject_id] && (
                  <div className="mt-2 p-2 border rounded text-sm space-y-1">
                    <div>
                      <label className="text-gray-600">名称</label>
                      <input className="border p-1 w-full"
                        onChange={e =>
                          setNewRootTopic(prev => ({
                            ...prev,
                            [subject.subject_id]: {
                              ...(prev[subject.subject_id] || {}),
                              name: e.target.value,
                            }
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="text-gray-600">是否叶子节点</label>
                      <select className="border p-1 w-full"
                        onChange={e =>
                          setNewRootTopic(prev => ({
                            ...prev,
                            [subject.subject_id]: {
                              ...(prev[subject.subject_id] || {}),
                              is_leaf: e.target.value === 'true'
                            }
                          }))
                        }
                      >
                        <option value="true">是</option>
                        <option value="false">否</option>
                      </select>
                    </div>
                    <button
                      className="bg-blue-500 text-white px-2 py-1 rounded mt-1"
                      onClick={async () => {
                        const input = newRootTopic[subject.subject_id];
                        if (!input?.name || input.is_leaf === undefined) {
                          alert("请填写名称并选择是否叶子节点");
                          return;
                        }

                        await fetch('/api/topic/', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            subject_id: subject.subject_id,
                            parent_id: null,
                            name: input.name,
                            is_leaf: input.is_leaf,
                            accuracy: null,
                            importance: null
                          })
                        });

                        location.reload();
                      }}
                    >
                      ➕ 添加
                    </button>
                  </div>
                )}
              </div>
            ))}
            <div className="mt-4 text-sm space-x-2">
              <input
                className="border p-1"
                placeholder="新科目名称"
                value={newSubjectName[examId] || ""}
                onChange={e =>
                  setNewSubjectName(prev => ({ ...prev, [examId]: e.target.value }))
                }
              />
              <button
                className="bg-blue-600 text-white px-3 py-1 rounded"
                onClick={async () => {
                  const name = newSubjectName[examId];
                  if (!name) return alert("请输入科目名称！");
                  await fetch("/api/subject/", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ exam_id: examId, subject_name: name }),
                  });
                  location.reload();
                }}
              >
                ➕ 添加科目
              </button>
            </div>
          </div>
        );
      })}

    </>
  );
}
