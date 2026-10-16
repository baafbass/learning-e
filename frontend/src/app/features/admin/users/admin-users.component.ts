import { DatePipe, TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { catchError, debounceTime, of, switchMap, tap } from 'rxjs';

import { Page } from '../../../core/models/page.model';
import { User, UserQuery, UserRole } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { ToastService } from '../../../core/services/toast.service';
import { UserService } from '../../../core/services/user.service';
import { errorMessage } from '../../../core/utils/http';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

const PAGE_SIZE = 10;
const ROLES: readonly UserRole[] = ['student', 'instructor', 'admin'];

@Component({
  selector: 'app-admin-users',
  imports: [
    ReactiveFormsModule,
    DatePipe,
    TitleCasePipe,
    AvatarComponent,
    EmptyStateComponent,
    IconComponent,
    LoadingComponent,
    PageHeaderComponent,
    PaginationComponent,
  ],
  templateUrl: './admin-users.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUsersComponent {
  private readonly userService = inject(UserService);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);
  protected readonly auth = inject(AuthService);

  protected readonly roles = ROLES;
  protected readonly query = signal<UserQuery>({ page: 1, size: PAGE_SIZE });
  protected readonly result = signal<Page<User> | null>(null);
  protected readonly loading = signal(true);

  protected readonly filters = inject(NonNullableFormBuilder).group({
    q: [''],
    role: ['' as UserRole | ''],
    is_active: ['' as 'true' | 'false' | ''],
  });

  constructor() {
    toObservable(this.query)
      .pipe(
        tap(() => this.loading.set(true)),
        switchMap((query) =>
          this.userService.list(query).pipe(
            catchError((error) => {
              this.toast.error(errorMessage(error));
              return of(null);
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((page) => {
        this.result.set(page);
        this.loading.set(false);
      });

    this.filters.valueChanges
      .pipe(debounceTime(300), takeUntilDestroyed())
      .subscribe(() => {
        const { q, role, is_active } = this.filters.getRawValue();
        this.query.set({
          page: 1,
          size: PAGE_SIZE,
          q: q.trim(),
          role,
          is_active: is_active === '' ? '' : is_active === 'true',
        });
      });
  }

  protected isSelf(user: User): boolean {
    return user.id === this.auth.user()?.id;
  }

  protected changePage(page: number): void {
    this.query.update((query) => ({ ...query, page }));
  }

  protected changeRole(user: User, value: string): void {
    const role = ROLES.find((option) => option === value);
    if (!role || role === user.role) {
      return;
    }
    this.userService.update(user.id, { role }).subscribe({
      next: (updated) => {
        this.toast.success(`${updated.full_name} is now ${updated.role === 'admin' ? 'an' : 'a'} ${updated.role}.`);
        this.reload();
      },
      error: (error) => {
        this.toast.error(errorMessage(error));
        this.reload();
      },
    });
  }

  protected async toggleActive(user: User): Promise<void> {
    if (user.is_active) {
      const confirmed = await this.confirm.ask({
        title: 'Deactivate this account?',
        message: `${user.full_name} will no longer be able to log in until reactivated.`,
        confirmText: 'Deactivate',
        danger: true,
      });
      if (!confirmed) {
        return;
      }
    }
    this.userService.update(user.id, { is_active: !user.is_active }).subscribe({
      next: (updated) => {
        this.toast.success(`${updated.full_name} has been ${updated.is_active ? 'activated' : 'deactivated'}.`);
        this.reload();
      },
      error: (error) => this.toast.error(errorMessage(error)),
    });
  }

  protected async remove(user: User): Promise<void> {
    const confirmed = await this.confirm.ask({
      title: 'Delete this user?',
      message: `${user.full_name}'s account will be permanently deleted, including their courses or enrollments.`,
      confirmText: 'Delete user',
      danger: true,
    });
    if (!confirmed) {
      return;
    }
    this.userService.delete(user.id).subscribe({
      next: () => {
        this.toast.success('The user has been deleted.');
        this.reload();
      },
      error: (error) => this.toast.error(errorMessage(error)),
    });
  }

  private reload(): void {
    this.query.update((query) => ({ ...query }));
  }
}
