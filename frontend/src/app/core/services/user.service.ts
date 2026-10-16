import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Page } from '../models/page.model';
import { User, UserAdminUpdate, UserQuery } from '../models/user.model';
import { toHttpParams } from '../utils/http';

/** Admin-only user management. */
@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/users`;

  list(query: UserQuery = {}): Observable<Page<User>> {
    return this.http.get<Page<User>>(this.url, { params: toHttpParams(query) });
  }

  update(userId: number, payload: UserAdminUpdate): Observable<User> {
    return this.http.patch<User>(`${this.url}/${userId}`, payload);
  }

  delete(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${userId}`);
  }
}
