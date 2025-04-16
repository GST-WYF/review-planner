import { useEffect, useState } from 'react';
import { Subject } from './types';
import * as api from '../../utils/api';

export function useReviewTree() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  // 加载数据
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await api.fetchReviewTree();
    setSubjects(data);
  };

  // 控制展开/收起
  const toggleExpand = (id: number) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // 刷新
  const reload = () => {
    loadData();
  };

  return {
    subjects,
    expanded,
    handlers: {
      toggleExpand,
      reload,
    }
  };
}
