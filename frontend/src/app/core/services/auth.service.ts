import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, map, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  AuthResponse,
  LoginPayload,
  PasswordChange,
  ProfileUpdate,
  RegisterPayload,
  User,
  UserRole,
} from '../models/user.model';
import { storage } from '../utils/storage';

const TOKEN_KEY = 'learnhub.token';
const USER_KEY = 'learnhub.user';

function readStoredUser(): User | null {
  const raw = storage.get(USER_KEY);
  if (!raw || !storage.get(TOKEN_KEY)) {
    return null;
  }
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

/** Holds the signed-in user and token, and talks to the /auth endpoints. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/auth`;
  private readonly currentUser = signal<User | null>(readStoredUser());

  readonly user = this.currentUser.asReadonly();
  readonly isLoggedIn = computed(() => this.currentUser() !== null);
  readonly role = computed<UserRole | null>(() => this.currentUser()?.role ?? null);
  readonly isStudent = computed(() => this.role() === 'student');
  readonly isStaff = computed(() => this.role() === 'instructor' || this.role() === 'admin');
  readonly isAdmin = computed(() => this.role() === 'admin');

  get token(): string | null {
    return storage.get(TOKEN_KEY);
  }

  hasRole(...roles: UserRole[]): boolean {
    const role = this.role();
    return role !== null && roles.includes(role);
  }

  login(payload: LoginPayload): Observable<User> {
    return this.http
      .post<AuthResponse>(`${this.url}/login`, payload)
      .pipe(map((response) => this.startSession(response)));
  }

  register(payload: RegisterPayload): Observable<User> {
    return this.http
      .post<AuthResponse>(`${this.url}/register`, payload)
      .pipe(map((response) => this.startSession(response)));
  }

  logout(): void {
    storage.remove(TOKEN_KEY);
    storage.remove(USER_KEY);
    this.currentUser.set(null);
  }

  /** Re-read the profile from the API so role or status changes are picked up. */
  refreshProfile(): Observable<User> {
    return this.http.get<User>(`${this.url}/me`).pipe(tap((user) => this.setUser(user)));
  }

  updateProfile(payload: ProfileUpdate): Observable<User> {
    return this.http.patch<User>(`${this.url}/me`, payload).pipe(tap((user) => this.setUser(user)));
  }

  changePassword(payload: PasswordChange): Observable<void> {
    return this.http.post<void>(`${this.url}/change-password`, payload);
  }

  private startSession(response: AuthResponse): User {
    storage.set(TOKEN_KEY, response.access_token);
    this.setUser(response.user);
    return response.user;
  }

  private setUser(user: User): void {
    storage.set(USER_KEY, JSON.stringify(user));
    this.currentUser.set(user);
  }
}
