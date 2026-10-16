import { CourseRef, CourseSummary } from './course.model';

export type EnrollmentStatus = 'in_progress' | 'completed';

export interface Grade {
  id: number;
  enrollment_id: number;
  title: string;
  score: number;
  max_score: number;
  percentage: number;
  letter: string;
  feedback: string | null;
  created_at: string;
  updated_at: string;
}

export interface GradePayload {
  title: string;
  score: number;
  max_score: number;
  feedback: string | null;
}

export interface Enrollment {
  id: number;
  course_id: number;
  status: EnrollmentStatus;
  progress: number;
  enrolled_at: string;
  completed_at: string | null;
  completed_lesson_ids: number[];
  next_lesson_id: number | null;
  average_score: number | null;
  letter_grade: string | null;
  grades: Grade[];
}

export interface MyEnrollment extends Enrollment {
  course: CourseSummary;
}

export interface StudentBrief {
  id: number;
  full_name: string;
  email: string;
  avatar_url: string | null;
}

export interface GradebookEntry extends Enrollment {
  student: StudentBrief;
}

export interface StudentEnrollment extends Enrollment {
  course: CourseRef;
}
