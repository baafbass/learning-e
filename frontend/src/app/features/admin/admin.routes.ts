import { Routes } from '@angular/router';

import {
  DashboardLayoutComponent,
  DashboardLayoutData,
} from '../../layout/dashboard-layout/dashboard-layout.component';

const layout: DashboardLayoutData = {
  heading: 'Administration',
  nav: [
    { id: 'admin-dashboard', label: 'Dashboard', icon: 'dashboard', path: '/admin', exact: true },
    { id: 'admin-users', label: 'Users', icon: 'manage_accounts', path: '/admin/users' },
    { id: 'admin-students', label: 'Students', icon: 'school', path: '/admin/students' },
    { id: 'admin-courses', label: 'Courses', icon: 'library_books', path: '/admin/courses' },
    { id: 'admin-categories', label: 'Categories', icon: 'category', path: '/admin/categories' },
    { id: 'admin-messages', label: 'Messages', icon: 'mail', path: '/admin/messages' },
  ],
};

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    data: layout,
    children: [
      {
        path: '',
        title: 'Admin dashboard',
        loadComponent: () =>
          import('./dashboard/admin-dashboard.component').then((m) => m.AdminDashboardComponent),
      },
      {
        path: 'users',
        title: 'Users',
        loadComponent: () =>
          import('./users/admin-users.component').then((m) => m.AdminUsersComponent),
      },
      {
        path: 'students',
        title: 'Students',
        loadComponent: () =>
          import('../students/student-list/student-list.component').then(
            (m) => m.StudentListComponent,
          ),
      },
      {
        path: 'students/:studentId',
        title: 'Student',
        loadComponent: () =>
          import('../students/student-detail/student-detail.component').then(
            (m) => m.StudentDetailComponent,
          ),
      },
      {
        path: 'courses',
        title: 'All courses',
        loadComponent: () =>
          import('../teach/course-manage-list/course-manage-list.component').then(
            (m) => m.CourseManageListComponent,
          ),
      },
      {
        path: 'categories',
        title: 'Categories',
        loadComponent: () =>
          import('./categories/admin-categories.component').then((m) => m.AdminCategoriesComponent),
      },
      {
        path: 'messages',
        title: 'Messages',
        loadComponent: () =>
          import('./messages/admin-messages.component').then((m) => m.AdminMessagesComponent),
      },
    ],
  },
];
