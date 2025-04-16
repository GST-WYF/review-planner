// 这里集中放置所有与后端交互的请求函数

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

export async function createSubject(payload: any) {
  return fetch('/api/subject/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
