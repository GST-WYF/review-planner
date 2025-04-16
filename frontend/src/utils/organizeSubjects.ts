import { Subject } from '@/LReview/ReviewTreeViewer/types';

export function organizeSubjectsByExam(subjects: Subject[]) {
  const grouped: Record<number, { exam_name: string, subjects: Subject[] }> = {};

  subjects.forEach(subject => {
    if (!grouped[subject.exam_id]) {
      grouped[subject.exam_id] = {
        exam_name: subject.exam_name,
        subjects: []
      };
    }
    grouped[subject.exam_id].subjects.push(subject);
  });

  return grouped;
}
