import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ContactMessage, ContactPayload, ContactQuery } from '../models/contact.model';
import { Page } from '../models/page.model';
import { toHttpParams } from '../utils/http';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/contact`;

  send(payload: ContactPayload): Observable<ContactMessage> {
    return this.http.post<ContactMessage>(this.url, payload);
  }

  list(query: ContactQuery = {}): Observable<Page<ContactMessage>> {
    return this.http.get<Page<ContactMessage>>(this.url, { params: toHttpParams(query) });
  }

  markRead(messageId: number, isRead: boolean): Observable<ContactMessage> {
    return this.http.patch<ContactMessage>(`${this.url}/${messageId}`, { is_read: isRead });
  }

  delete(messageId: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${messageId}`);
  }
}
