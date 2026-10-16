import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  Enrollment,
  EnrollmentStatus,
  Grade,
  GradePayload,
  GradebookEntry,
  MyEnrollment,
} from '../models/enrollment.model';
import { toHttpParams } from '../utils/http';

/** Enrollment, lesson progress and grade endpoints. */
@Injectable({ providedIn: 'root' })
export class EnrollmentService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  enroll(courseId: number): Observable<Enrollment> {
    return this.http.post<Enrollment>(`${this.api}/courses/${courseId}/enroll`, {});
  }

  unenroll(courseId: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/courses/${courseId}/enroll`);
  }

  /** The current student's enrollment in a course (404 when not enrolled). */
  getForCourse(courseId: number): Observable<Enrollment> {
    return this.http.get<Enrollment>(`${this.api}/courses/${courseId}/enrollment`);
  }

  listMine(status?: EnrollmentStatus): Observable<MyEnrollment[]> {
    return this.http.get<MyEnrollment[]>(`${this.api}/enrollments/me`, {
      params: toHttpParams({ status }),
    });
  }

  setLessonCompleted(courseId: number, lessonId: number, completed: boolean): Observable<Enrollment> {
    const url = `${this.api}/courses/${courseId}/lessons/${lessonId}/complete`;
    return completed
      ? this.http.post<Enrollment>(url, {})
      : this.http.delete<Enrollment>(url);
  }

  gradebook(courseId: number): Observable<GradebookEntry[]> {
    return this.http.get<GradebookEntry[]>(`${this.api}/courses/${courseId}/enrollments`);
  }

  addGrade(enrollmentId: number, payload: GradePayload): Observable<Grade> {
    return this.http.post<Grade>(`${this.api}/enrollments/${enrollmentId}/grades`, payload);
  }

  updateGrade(gradeId: number, payload: GradePayload): Observable<Grade> {
    return this.http.patch<Grade>(`${this.api}/grades/${gradeId}`, payload);
  }

  deleteGrade(gradeId: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/grades/${gradeId}`);
  }
}
