import { Routes } from '@angular/router';

import {
  DashboardLayoutComponent,
  DashboardLayoutData,
} from '../../layout/dashboard-layout/dashboard-layout.component';

const layout: DashboardLayoutData = {
  heading: 'Teaching',
  nav: [
    { id: 'teach-courses', label: 'My courses', icon: 'library_books', path: '/teach', exact: true },
    { id: 'teach-new-course', label: 'New course', icon: 'add_circle', path: '/teach/courses/new' },
    { id: 'teach-students', label: 'My students', icon: 'groups', path: '/teach/students' },
  ],
};

export const TEACH_ROUTES: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    data: layout,
    children: [
      {
        path: '',
        title: 'My courses',
        loadComponent: () =>
          import('./course-manage-list/course-manage-list.component').then(
            (m) => m.CourseManageListComponent,
          ),
      },
      {
        path: 'courses/new',
        title: 'New course',
        loadComponent: () =>
          import('./course-form/course-form.component').then((m) => m.CourseFormComponent),
      },
      {
        path: 'courses/:courseId/edit',
        title: 'Edit course',
        loadComponent: () =>
          import('./course-form/course-form.component').then((m) => m.CourseFormComponent),
      },
      {
        path: 'courses/:courseId/gradebook',
        title: 'Gradebook',
        loadComponent: () =>
          import('./gradebook/gradebook.component').then((m) => m.GradebookComponent),
      },
      {
        path: 'students',
        title: 'My students',
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
    ],
  },
];
