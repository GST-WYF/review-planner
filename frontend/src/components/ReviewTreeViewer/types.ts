export type TopicNode = {
  topic_id: number;
  name: string;
  accuracy: number | null;
  importance: number | null;
  is_leaf: boolean;
  children: TopicNode[];
};

export type Subject = {
  subject_id: number;
  subject_name: string;
  exam_id: number;        // ✅ 加上这个
  exam_name: string;      // ✅ 加上这个
  topics: TopicNode[];
};
