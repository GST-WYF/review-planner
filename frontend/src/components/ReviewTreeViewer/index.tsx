import React from 'react';
import { useReviewTree } from './useReviewTree';
import { organizeSubjectsByExam } from '../../utils/organizeSubjects';
import SubjectPanel from './SubjectPanel';

export default function ReviewTreeViewer() {
  const {
    subjects,
    expanded,
    handlers
  } = useReviewTree();

  const subjectsByExam = organizeSubjectsByExam(subjects);

  return (
    <>
      {Object.entries(subjectsByExam).map(([examIdStr, data]) => {
        const examId = parseInt(examIdStr, 10);
        const { exam_name, subjects } = data;

        return (
          <SubjectPanel
            key={examId}
            examId={examId}
            examName={exam_name}
            subjects={subjects}
            handlers={handlers}
            uiState={{ expanded }}
          />
        );
      })}
    </>
  );
}
