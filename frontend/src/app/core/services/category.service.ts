import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Category, CategoryPayload } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/categories`;

  list(): Observable<Category[]> {
    return this.http.get<Category[]>(this.url);
  }

  create(payload: CategoryPayload): Observable<Category> {
    return this.http.post<Category>(this.url, payload);
  }

  update(categoryId: number, payload: Partial<CategoryPayload>): Observable<Category> {
    return this.http.patch<Category>(`${this.url}/${categoryId}`, payload);
  }

  delete(categoryId: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${categoryId}`);
  }
}
