import { DatePipe, LowerCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { catchError, debounceTime, distinctUntilChanged, of, switchMap, tap } from 'rxjs';

import { Page } from '../../../core/models/page.model';
import { StudentListItem, StudentQuery } from '../../../core/models/student.model';
import { AuthService } from '../../../core/services/auth.service';
import { StudentService } from '../../../core/services/student.service';
import { ToastService } from '../../../core/services/toast.service';
import { errorMessage } from '../../../core/utils/http';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { LetterGradePipe } from '../../../shared/pipes/letter-grade.pipe';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-student-list',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    DatePipe,
    LowerCasePipe,
    LetterGradePipe,
    AvatarComponent,
    EmptyStateComponent,
    IconComponent,
    LoadingComponent,
    PageHeaderComponent,
    PaginationComponent,
  ],
  templateUrl: './student-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentListComponent {
  private readonly studentService = inject(StudentService);
  private readonly toast = inject(ToastService);
  protected readonly auth = inject(AuthService);

  protected readonly searchControl = new FormControl('', { nonNullable: true });
  protected readonly query = signal<StudentQuery>({ page: 1, size: PAGE_SIZE });
  protected readonly result = signal<Page<StudentListItem> | null>(null);
  protected readonly loading = signal(true);

  constructor() {
    toObservable(this.query)
      .pipe(
        tap(() => this.loading.set(true)),
        switchMap((query) =>
          this.studentService.list(query).pipe(
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
  }

  protected changePage(page: number): void {
    this.query.update((query) => ({ ...query, page }));
  }
}
