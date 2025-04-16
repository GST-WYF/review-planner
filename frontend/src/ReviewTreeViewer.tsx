
import React, { useEffect, useState } from 'react';

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

    console.log("📦 发送新增:", payload);

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
              <div className="text-sm mt-2 space-y-2">
                <div className="font-semibold text-gray-600">输入材料</div>
                {mat.input_materials.map((m: any) => {
                  const key = `in_${m.input_id}`;
                  return (
                    <div key={m.input_id} className="flex flex-col gap-1 border p-2 rounded">
                      {editingMaterial[key] ? (
                        <>
                          <input className="border p-1" value={materialForm[key]?.title || ''}
                            onChange={e => setMaterialForm(prev => ({
                              ...prev,
                              [key]: { ...prev[key], title: e.target.value }
                            }))} />
                          <input className="border p-1" value={materialForm[key]?.required_hours || ''}
                            onChange={e => setMaterialForm(prev => ({
                              ...prev,
                              [key]: { ...prev[key], required_hours: parseFloat(e.target.value) }
                            }))} />
                          <input className="border p-1" value={materialForm[key]?.reviewed_hours || ''}
                            onChange={e => setMaterialForm(prev => ({
                              ...prev,
                              [key]: { ...prev[key], reviewed_hours: parseFloat(e.target.value) }
                            }))} />
                          <button className="text-green-600 text-xs" onClick={async () => {
                            await fetch(`/api/input/${m.input_id}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ ...m, ...materialForm[key] })
                            });
                            setEditingMaterial(prev => ({ ...prev, [key]: false }));
                            setMaterials(prev => ({ ...prev, [topic.topic_id]: undefined }));
                            loadMaterials(topic.topic_id);
                          }}>💾 保存</button>
                        </>
                      ) : (
                        <>
                          <span>• [{m.type}] {m.title}（{m.reviewed_hours} / {m.required_hours} 小时）</span>
                          <div className="text-xs space-x-2">
                            <button className="text-blue-500" onClick={() => {
                              setEditingMaterial(prev => ({ ...prev, [key]: true }));
                              setMaterialForm(prev => ({ ...prev, [key]: m }));
                            }}>✏ 编辑</button>
                            <button className="text-red-500" onClick={async () => {
                              await fetch(`/api/input/${m.input_id}`, { method: 'DELETE' });
                              setMaterials(prev => ({ ...prev, [topic.topic_id]: undefined }));
                              loadMaterials(topic.topic_id);
                            }}>🗑 删除</button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}

                <div className="flex flex-wrap gap-1 text-xs mt-1">
                  <select className="border p-1" id={`in_type_${topic.topic_id}`}>
                    <option value="note">笔记</option>
                    <option value="video">视频</option>
                    <option value="recite">背诵材料</option>
                  </select>
                  <input className="border p-1" placeholder="标题" id={`in_title_${topic.topic_id}`} />
                  <input type="number" min="0" step="0.1" className="border p-1 w-20" placeholder="需时" id={`in_req_${topic.topic_id}`} />
                  <input type="number" min="0" step="0.1" className="border p-1 w-20" placeholder="已复习" id={`in_rev_${topic.topic_id}`} />

                  <button className="bg-green-500 text-white px-2 rounded"
                    onClick={async () => {
                      const type = (document.getElementById(`in_type_${topic.topic_id}`) as HTMLInputElement).value;
                      const title = (document.getElementById(`in_title_${topic.topic_id}`) as HTMLInputElement).value;
                      const required = parseFloat((document.getElementById(`in_req_${topic.topic_id}`) as HTMLInputElement).value);
                      const reviewed = parseFloat((document.getElementById(`in_rev_${topic.topic_id}`) as HTMLInputElement).value);

                      await fetch(`/api/topic/${topic.topic_id}/input`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ type, title, required_hours: required, reviewed_hours: reviewed }),
                      });
                      setMaterials(prev => ({ ...prev, [topic.topic_id]: undefined }));
                      loadMaterials(topic.topic_id);
                    }}>添加输入</button>
                </div>

                <div className="font-semibold text-gray-600 mt-3">输出材料</div>
                {mat.output_materials.map((m: any) => {
                  const key = `out_${m.output_id}`;
                  return (
                    <div key={m.output_id} className="flex flex-col gap-1 border p-2 rounded">
                      {editingMaterial[key] ? (
                        <>
                          <input className="border p-1" value={materialForm[key]?.title || ''}
                            onChange={e => setMaterialForm(prev => ({
                              ...prev,
                              [key]: { ...prev[key], title: e.target.value }
                            }))} />
                          <input type="number" min="0" max="1" step="0.01" className="border p-1"
                            value={materialForm[key]?.accuracy || ''}
                            onChange={e => setMaterialForm(prev => ({
                              ...prev,
                              [key]: { ...prev[key], accuracy: parseFloat(e.target.value) }
                            }))}
                          />
                          <button className="text-green-600 text-xs" onClick={async () => {
                            await fetch(`/api/output/${m.output_id}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ ...m, ...materialForm[key] })
                            });
                            setEditingMaterial(prev => ({ ...prev, [key]: false }));
                            setMaterials(prev => ({ ...prev, [topic.topic_id]: undefined }));
                            loadMaterials(topic.topic_id);
                          }}>💾 保存</button>
                        </>
                      ) : (
                        <>
                          <span>• [{m.type}] {m.title}（准确率: {m.accuracy ?? '未测试'}）</span>
                          <div className="text-xs space-x-2">
                            <button className="text-blue-500" onClick={() => {
                              setEditingMaterial(prev => ({ ...prev, [key]: true }));
                              setMaterialForm(prev => ({ ...prev, [key]: m }));
                            }}>✏ 编辑</button>
                            <button className="text-red-500" onClick={async () => {
                              await fetch(`/api/output/${m.output_id}`, { method: 'DELETE' });
                              setMaterials(prev => ({ ...prev, [topic.topic_id]: undefined }));
                              loadMaterials(topic.topic_id);
                            }}>🗑 删除</button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
                <div className="flex flex-wrap gap-1 text-xs mt-1">
                  <select className="border p-1" id={`out_type_${topic.topic_id}`}>
                    <option value="exercise_set">练习题</option>
                    <option value="mock_exam">模拟卷</option>
                  </select>
                  <input className="border p-1" placeholder="标题" id={`out_title_${topic.topic_id}`} />
                  <input type="number" min="0" max="1" step="0.01" className="border p-1 w-24" placeholder="准确率 (0~1)" id={`out_acc_${topic.topic_id}`} />
                  <button className="bg-green-500 text-white px-2 rounded"
                    onClick={async () => {
                      const type = (document.getElementById(`out_type_${topic.topic_id}`) as HTMLInputElement).value;
                      const title = (document.getElementById(`out_title_${topic.topic_id}`) as HTMLInputElement).value;
                      const accuracy = parseFloat((document.getElementById(`out_acc_${topic.topic_id}`) as HTMLInputElement).value);

                      await fetch(`/api/topic/${topic.topic_id}/output`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ type, title, accuracy }),
                      });
                      setMaterials(prev => ({ ...prev, [topic.topic_id]: undefined }));
                      loadMaterials(topic.topic_id);
                    }}>添加输出</button>
                </div>
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

  // return (
  //   <div className="p-6 text-gray-800 max-w-4xl mx-auto">
  //     <h1 className="text-2xl font-bold mb-4">📚 考试复习知识结构树</h1>

  //   </div>
  // );
  return (
    <>
      {Object.entries(subjectsByExam).map(([examIdStr, data]) => {
        const examId = parseInt(examIdStr);
        const { exam_name, subjects } = data;
        return (
          <div key={examId} className="mb-6 border p-4 rounded shadow">
            <h2 className="text-2xl font-bold mb-3">🎓 考试：{exam_name}（ID: {examId}）</h2>

            {/* {subjects.map(subject => (
        <div key={subject.subject_id} className="mb-4">
          <h3 className="text-xl font-semibold mb-1">📘 {subject.subject_name}</h3>
          {subject.topics.map(topic => renderTopic(topic, 0, subject.subject_id))}
        </div>
      ))} */}
            {subjects.map(subject => (
              <div key={subject.subject_id} className="mb-4">
                <h3 className="text-xl font-semibold mb-1">📘 {subject.subject_name}</h3>
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
