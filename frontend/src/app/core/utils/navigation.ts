import { UserRole } from '../models/user.model';

const HOME_BY_ROLE: Record<UserRole, string> = {
  student: '/my-learning',
  instructor: '/teach',
  admin: '/admin',
};

/** Landing page after login or registration. */
export function homeFor(role: UserRole): string {
  return HOME_BY_ROLE[role];
}

/** Only allow in-app redirects, never an absolute URL from the query string. */
export function safeReturnUrl(url: string | null | undefined): string | null {
  return url && url.startsWith('/') && !url.startsWith('//') ? url : null;
}
