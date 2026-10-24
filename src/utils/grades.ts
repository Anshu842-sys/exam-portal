import { ResultStatus } from '../types/database';

export interface GradeResult {
  total: number;
  percentage: number;
  grade: string;
  resultStatus: ResultStatus;
}

export function calculateGrade(internalMarks: number, externalMarks: number, maxMarks: number = 100, passingMarks: number = 40): GradeResult {
  const safeInternal = Math.max(0, Number(internalMarks) || 0);
  const safeExternal = Math.max(0, Number(externalMarks) || 0);
  const total = Number((safeInternal + safeExternal).toFixed(2));
  const safeMax = maxMarks > 0 ? maxMarks : 100;
  const percentage = Number(((total / safeMax) * 100).toFixed(2));

  let grade = 'F';
  if (percentage >= 90) grade = 'A+';
  else if (percentage >= 80) grade = 'A';
  else if (percentage >= 70) grade = 'B+';
  else if (percentage >= 60) grade = 'B';
  else if (percentage >= 50) grade = 'C';
  else if (percentage >= 40) grade = 'D';
  else grade = 'F';

  const resultStatus: ResultStatus = total >= passingMarks ? 'Pass' : 'Fail';

  return {
    total,
    percentage,
    grade,
    resultStatus
  };
}

export function calculateSgpa(grades: string[]): number {
  if (!grades || grades.length === 0) return 0;
  const pointsMap: Record<string, number> = {
    'A+': 10,
    'A': 9,
    'B+': 8,
    'B': 7,
    'C': 6,
    'D': 5,
    'F': 0
  };

  const totalPoints = grades.reduce((acc, g) => acc + (pointsMap[g] ?? 0), 0);
  return Number((totalPoints / grades.length).toFixed(2));
}
