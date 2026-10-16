import { User } from './user.model';

export interface PublicStats {
  courses: number;
  students: number;
  instructors: number;
  categories: number;
}

export interface TopCourse {
  id: number;
  title: string;
  instructor_name: string;
  enrollment_count: number;
  completed_count: number;
}

export interface AdminStats {
  users: number;
  students: number;
  instructors: number;
  admins: number;
  courses: number;
  published_courses: number;
  draft_courses: number;
  categories: number;
  enrollments: number;
  enrollments_in_progress: number;
  enrollments_completed: number;
  completion_rate: number;
  average_grade: number | null;
  unread_messages: number;
  top_courses: TopCourse[];
  recent_users: User[];
}
