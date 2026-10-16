import { DatePipe, LowerCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';

import { StudentDetail } from '../../../core/models/student.model';
import { StudentService } from '../../../core/services/student.service';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ProgressBarComponent } from '../../../shared/components/progress-bar/progress-bar.component';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { StatusLabelPipe } from '../../../shared/pipes/status-label.pipe';

@Component({
  selector: 'app-student-detail',
  imports: [
    RouterLink,
    DatePipe,
    LowerCasePipe,
    StatusLabelPipe,
    AvatarComponent,
    EmptyStateComponent,
    IconComponent,
    LoadingComponent,
    ProgressBarComponent,
    StatCardComponent,
  ],
  templateUrl: './student-detail.component.html',
  styleUrl: './student-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentDetailComponent {
  private readonly studentService = inject(StudentService);

  /** Bound from the `:studentId` route parameter. */
  readonly studentId = input.required<string>();

  protected readonly student = signal<StudentDetail | null>(null);
  protected readonly loading = signal(true);

  constructor() {
    toObservable(this.studentId)
      .pipe(
        switchMap((id) => this.studentService.get(Number(id)).pipe(catchError(() => of(null)))),
        takeUntilDestroyed(),
      )
      .subscribe((student) => {
        this.student.set(student);
        this.loading.set(false);
      });
  }
}
