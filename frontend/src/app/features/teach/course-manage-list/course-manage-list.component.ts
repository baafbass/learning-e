import { DatePipe, TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { catchError, debounceTime, distinctUntilChanged, of, switchMap, tap } from 'rxjs';

import {
  CourseQuery,
  CourseSummary,
  PublicationStatus,
} from '../../../core/models/course.model';
import { Page } from '../../../core/models/page.model';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { CourseService } from '../../../core/services/course.service';
import { ToastService } from '../../../core/services/toast.service';
import { errorMessage } from '../../../core/utils/http';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { PricePipe } from '../../../shared/pipes/price.pipe';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-course-manage-list',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    DatePipe,
    TitleCasePipe,
    PricePipe,
    EmptyStateComponent,
    IconComponent,
    LoadingComponent,
    PageHeaderComponent,
    PaginationComponent,
  ],
  templateUrl: './course-manage-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseManageListComponent {
  private readonly courseService = inject(CourseService);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);
  protected readonly auth = inject(AuthService);

  protected readonly searchControl = new FormControl('', { nonNullable: true });
  protected readonly statusControl = new FormControl<PublicationStatus | ''>('', {
    nonNullable: true,
  });
  protected readonly query = signal<CourseQuery>({ page: 1, size: PAGE_SIZE, sort: 'newest' });
  protected readonly result = signal<Page<CourseSummary> | null>(null);
  protected readonly loading = signal(true);

  constructor() {
    toObservable(this.query)
      .pipe(
        tap(() => this.loading.set(true)),
        switchMap((query) =>
          this.courseService.listManaged(query).pipe(
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

    this.searchControl.valueChanges
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((q) => this.query.update((query) => ({ ...query, q: q.trim(), page: 1 })));

    this.statusControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((status) =>
        this.query.update((query) => ({ ...query, status: status || null, page: 1 })),
      );
  }

  protected changePage(page: number): void {
    this.query.update((query) => ({ ...query, page }));
  }

  protected togglePublished(course: CourseSummary): void {
    this.courseService.update(course.id, { is_published: !course.is_published }).subscribe({
      next: (updated) => {
        this.toast.success(
          updated.is_published ? `“${updated.title}” is now published.` : `“${updated.title}” is now a draft.`,
        );
        this.reload();
      },
      error: (error) => this.toast.error(errorMessage(error)),
    });
  }

  protected async remove(course: CourseSummary): Promise<void> {
    const confirmed = await this.confirm.ask({
      title: 'Delete this course?',
      message: `“${course.title}” and all its lessons, enrollments and grades will be permanently deleted.`,
      confirmText: 'Delete course',
      danger: true,
    });
    if (!confirmed) {
      return;
    }
    this.courseService.delete(course.id).subscribe({
      next: () => {
        this.toast.success('The course has been deleted.');
        this.reload();
      },
      error: (error) => this.toast.error(errorMessage(error)),
    });
  }

  private reload(): void {
    this.query.update((query) => ({ ...query }));
  }
}
