// 这里集中放置所有与后端交互的请求函数

import axios from "axios";

export async function fetchReviewTree() {
  const res = await fetch('/api/review-tree');
  return await res.json();
}

export async function fetchTopicMaterials(topicId: number) {
  const res = await fetch(`/api/topic/${topicId}/materials`);
  return await res.json();
}

export async function updateTopic(topicId: number, payload: any) {
  const res = await fetch(`/api/topic/${topicId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function deleteTopic(topicId: number) {
  return fetch(`/api/topic/${topicId}`, { method: 'DELETE' });
}

export async function createTopic(payload: any) {
  return fetch('/api/topic/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function createSubject(data: { exam_id: number; subject_name: string; priority: number }) {
  const res = await axios.post('/api/subject/', data);
  return res.data;
}

export async function updateSubject(subject_id: number, data: { subject_name?: string; priority?: number }) {
  const res = await axios.put(`/api/subject/${subject_id}`, data);
  return res.data;
}

export async function updateExam(exam_id: number, data: { exam_name?: string; priority?: number }) {
  const res = await axios.put(`/api/exam/${exam_id}`, data);
  return res.data;
}

export async function getExam(exam_id: number) {
  const res = await axios.get(`/api/exam/${exam_id}`);
  return res.data;
}