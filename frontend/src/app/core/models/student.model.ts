import { StudentEnrollment } from './enrollment.model';
import { PageQuery } from './page.model';

export interface StudentListItem {
  id: number;
  full_name: string;
  email: string;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  enrollment_count: number;
  completed_count: number;
  average_score: number | null;
}

export interface StudentDetail extends StudentListItem {
  bio: string | null;
  enrollments: StudentEnrollment[];
}

export interface StudentQuery extends PageQuery {
  q?: string;
}
