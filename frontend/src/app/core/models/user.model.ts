import { PageQuery } from './page.model';

export type UserRole = 'student' | 'instructor' | 'admin';

export interface UserBrief {
  id: number;
  full_name: string;
  avatar_url: string | null;
}

export interface InstructorProfile extends UserBrief {
  bio: string | null;
}

export interface User extends UserBrief {
  email: string;
  role: UserRole;
  bio: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
  role: Exclude<UserRole, 'admin'>;
}

export interface ProfileUpdate {
  full_name?: string;
  bio?: string | null;
  avatar_url?: string | null;
}

export interface PasswordChange {
  current_password: string;
  new_password: string;
}

export interface UserAdminUpdate {
  full_name?: string;
  role?: UserRole;
  is_active?: boolean;
}

export interface UserQuery extends PageQuery {
  q?: string;
  role?: UserRole | '';
  is_active?: boolean | '';
}
