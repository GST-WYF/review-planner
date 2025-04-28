export type TopicNode = {
  topic_id: number;
  name: string;
  accuracy: number | null;
  importance: number | null;
  is_leaf: boolean;
  children: TopicNode[];
};

export type Subject = {
  priority: number;
  subject_id: number;
  subject_name: string;
  exam_id: number;        // ✅ 加上这个
  exam_name: string;      // ✅ 加上这个
  topics: TopicNode[];
};

export type ExamInfo = {
  exam_id: number;
  exam_name: string;
  priority: number;
};