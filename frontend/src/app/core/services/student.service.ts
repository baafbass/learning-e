import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Page } from '../models/page.model';
import { StudentDetail, StudentListItem, StudentQuery } from '../models/student.model';
import { toHttpParams } from '../utils/http';

@Injectable({ providedIn: 'root' })
export class StudentService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/students`;

  list(query: StudentQuery = {}): Observable<Page<StudentListItem>> {
    return this.http.get<Page<StudentListItem>>(this.url, { params: toHttpParams(query) });
  }

  get(studentId: number): Observable<StudentDetail> {
    return this.http.get<StudentDetail>(`${this.url}/${studentId}`);
  }
}
