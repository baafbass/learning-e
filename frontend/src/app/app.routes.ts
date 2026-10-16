import { Routes } from '@angular/router';

import { authGuard, guestGuard, roleGuard } from './core/guards/auth.guards';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'courses',
    title: 'Courses',
    loadComponent: () =>
      import('./features/courses/course-list/course-list.component').then((m) => m.CourseListComponent),
  },
  {
    path: 'courses/:courseId',
    title: 'Course',
    loadComponent: () =>
      import('./features/courses/course-detail/course-detail.component').then(
        (m) => m.CourseDetailComponent,
      ),
  },
  {
    path: 'courses/:courseId/learn/:lessonId',
    title: 'Lesson',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/courses/lesson-viewer/lesson-viewer.component').then(
        (m) => m.LessonViewerComponent,
      ),
  },
  {
    path: 'login',
    title: 'Log in',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    title: 'Create an account',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'profile',
    title: 'Profile',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/profile.component').then((m) => m.ProfileComponent),
  },
  {
    path: 'my-learning',
    title: 'My learning',
    canActivate: [roleGuard('student')],
    loadComponent: () =>
      import('./features/learning/my-learning/my-learning.component').then((m) => m.MyLearningComponent),
  },
  {
    path: 'teach',
    canActivate: [roleGuard('instructor', 'admin')],
    loadChildren: () => import('./features/teach/teach.routes').then((m) => m.TEACH_ROUTES),
  },
  {
    path: 'admin',
    canActivate: [roleGuard('admin')],
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: 'about',
    title: 'About us',
    loadComponent: () => import('./features/pages/about/about.component').then((m) => m.AboutComponent),
  },
  {
    path: 'contact',
    title: 'Contact',
    loadComponent: () =>
      import('./features/pages/contact/contact.component').then((m) => m.ContactComponent),
  },
  {
    path: 'faq',
    title: 'FAQ',
    loadComponent: () => import('./features/pages/faq/faq.component').then((m) => m.FaqComponent),
  },
  {
    path: 'privacy',
    title: 'Privacy policy',
    data: { page: 'privacy' },
    loadComponent: () => import('./features/pages/legal/legal.component').then((m) => m.LegalComponent),
  },
  {
    path: 'terms',
    title: 'Terms of service',
    data: { page: 'terms' },
    loadComponent: () => import('./features/pages/legal/legal.component').then((m) => m.LegalComponent),
  },
  {
    path: '**',
    title: 'Page not found',
    loadComponent: () =>
      import('./features/pages/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
