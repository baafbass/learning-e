export interface CategoryBrief {
  id: number;
  name: string;
  icon: string;
}

export interface Category extends CategoryBrief {
  description: string | null;
  course_count: number;
}

export interface CategoryPayload {
  name: string;
  description?: string | null;
  icon?: string;
}
