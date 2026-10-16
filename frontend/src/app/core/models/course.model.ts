import { CategoryBrief } from './category.model';
import { PageQuery } from './page.model';
import { InstructorProfile, UserBrief } from './user.model';

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export type CourseSort = 'newest' | 'oldest' | 'title' | 'popular';
export type PriceFilter = 'free' | 'paid';
export type PublicationStatus = 'published' | 'draft';

export const COURSE_LEVELS: readonly CourseLevel[] = ['beginner', 'intermediate', 'advanced'];

export const COURSE_SORT_OPTIONS: readonly { value: CourseSort; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'popular', label: 'Most popular' },
  { value: 'title', label: 'Title A–Z' },
  { value: 'oldest', label: 'Oldest first' },
];

export interface CourseRef {
  id: number;
  title: string;
  level: CourseLevel;
  thumbnail_url: string | null;
}

export interface CourseSummary extends CourseRef {
  summary: string;
  price: number;
  duration_hours: number;
  is_published: boolean;
  lesson_count: number;
  enrollment_count: number;
  category: CategoryBrief;
  instructor: UserBrief;
  created_at: string;
  updated_at: string;
}

export interface LessonOutline {
  id: number;
  title: string;
  duration_minutes: number;
  position: number;
}

export interface Lesson extends LessonOutline {
  course_id: number;
  content: string;
  video_url: string | null;
}

export interface CourseDetail extends CourseSummary {
  description: string;
  outcomes: string[];
  category_id: number;
  instructor: InstructorProfile;
  lessons: LessonOutline[];
}

export interface CoursePayload {
  title: string;
  summary: string;
  description: string;
  outcomes: string[];
  level: CourseLevel;
  price: number;
  duration_hours: number;
  thumbnail_url: string | null;
  is_published: boolean;
  category_id: number;
}

export interface LessonPayload {
  title: string;
  content: string;
  video_url: string | null;
  duration_minutes: number;
  position: number;
}

export interface CourseQuery extends PageQuery {
  q?: string;
  category_id?: number | null;
  level?: CourseLevel | null;
  price?: PriceFilter | null;
  status?: PublicationStatus | null;
  sort?: CourseSort;
}
