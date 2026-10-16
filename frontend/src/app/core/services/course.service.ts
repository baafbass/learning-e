import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  CourseDetail,
  CoursePayload,
  CourseQuery,
  CourseSummary,
  Lesson,
  LessonPayload,
} from '../models/course.model';
import { Page } from '../models/page.model';
import { toHttpParams } from '../utils/http';

@Injectable({ providedIn: 'root' })
export class CourseService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/courses`;

  /** Public catalog: published courses only. */
  list(query: CourseQuery = {}): Observable<Page<CourseSummary>> {
    return this.http.get<Page<CourseSummary>>(this.url, { params: toHttpParams(query) });
  }

  /** Courses the current instructor (or admin) can manage, drafts included. */
  listManaged(query: CourseQuery = {}): Observable<Page<CourseSummary>> {
    return this.http.get<Page<CourseSummary>>(`${this.url}/manage`, {
      params: toHttpParams(query),
    });
  }

  get(courseId: number): Observable<CourseDetail> {
    return this.http.get<CourseDetail>(`${this.url}/${courseId}`);
  }

  create(payload: CoursePayload): Observable<CourseDetail> {
    return this.http.post<CourseDetail>(this.url, payload);
  }

  update(courseId: number, payload: Partial<CoursePayload>): Observable<CourseDetail> {
    return this.http.patch<CourseDetail>(`${this.url}/${courseId}`, payload);
  }

  delete(courseId: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${courseId}`);
  }

  getLesson(courseId: number, lessonId: number): Observable<Lesson> {
    return this.http.get<Lesson>(`${this.url}/${courseId}/lessons/${lessonId}`);
  }

  createLesson(courseId: number, payload: LessonPayload): Observable<Lesson> {
    return this.http.post<Lesson>(`${this.url}/${courseId}/lessons`, payload);
  }

  updateLesson(courseId: number, lessonId: number, payload: LessonPayload): Observable<Lesson> {
    return this.http.patch<Lesson>(`${this.url}/${courseId}/lessons/${lessonId}`, payload);
  }

  deleteLesson(courseId: number, lessonId: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${courseId}/lessons/${lessonId}`);
  }
}
