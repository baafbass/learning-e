import { LowerCasePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of, switchMap } from 'rxjs';

import { CourseDetail } from '../../../core/models/course.model';
import { Grade, GradebookEntry } from '../../../core/models/enrollment.model';
import { ConfirmService } from '../../../core/services/confirm.service';
import { CourseService } from '../../../core/services/course.service';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { ToastService } from '../../../core/services/toast.service';
import { errorMessage } from '../../../core/utils/http';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { FieldErrorComponent } from '../../../shared/components/field-error/field-error.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ProgressBarComponent } from '../../../shared/components/progress-bar/progress-bar.component';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { StatusLabelPipe } from '../../../shared/pipes/status-label.pipe';

function average(values: number[]): number | null {
  return values.length
    ? Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10
    : null;
}

@Component({
  selector: 'app-gradebook',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    LowerCasePipe,
    StatusLabelPipe,
    AvatarComponent,
    EmptyStateComponent,
    FieldErrorComponent,
    IconComponent,
    LoadingComponent,
    PageHeaderComponent,
    ProgressBarComponent,
    StatCardComponent,
  ],
  templateUrl: './gradebook.component.html',
  styleUrl: './gradebook.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GradebookComponent {
  private readonly courseService = inject(CourseService);
  private readonly enrollmentService = inject(EnrollmentService);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('gradeDialog');

  /** Bound from the `:courseId` route parameter. */
  readonly courseId = input.required<string>();

  protected readonly course = signal<CourseDetail | null>(null);
  protected readonly entries = signal<GradebookEntry[]>([]);
  protected readonly loading = signal(true);
  protected readonly searchControl = new FormControl('', { nonNullable: true });
  private readonly search = toSignal(this.searchControl.valueChanges, { initialValue: '' });
  protected readonly saving = signal(false);
  protected readonly activeEntry = signal<GradebookEntry | null>(null);
  protected readonly editingGrade = signal<Grade | null>(null);

  protected readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    return term
      ? this.entries().filter(
          (entry) =>
            entry.student.full_name.toLowerCase().includes(term) ||
            entry.student.email.toLowerCase().includes(term),
        )
      : this.entries();
  });
  protected readonly summary = computed(() => {
    const entries = this.entries();
    return {
      enrolled: entries.length,
      completed: entries.filter((entry) => entry.status === 'completed').length,
      averageProgress: average(entries.map((entry) => entry.progress)),
      averageGrade: average(
        entries.map((entry) => entry.average_score).filter((score): score is number => score !== null),
      ),
    };
  });

  protected readonly form = inject(NonNullableFormBuilder).group({
    title: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
    score: [0, [Validators.required, Validators.min(0), Validators.max(1000)]],
    max_score: [100, [Validators.required, Validators.min(1), Validators.max(1000)]],
    feedback: ['', Validators.maxLength(2000)],
  });

  constructor() {
    toObservable(this.courseId)
      .pipe(
        switchMap((id) =>
          forkJoin({
            course: this.courseService.get(Number(id)).pipe(catchError(() => of(null))),
            entries: this.enrollmentService.gradebook(Number(id)).pipe(
              catchError((error) => {
                this.toast.error(errorMessage(error));
                return of([]);
              }),
            ),
          }),
        ),
        takeUntilDestroyed(),
      )
      .subscribe(({ course, entries }) => {
        this.course.set(course);
        this.entries.set(entries);
        this.loading.set(false);
      });
  }

  protected openGradeDialog(entry: GradebookEntry, grade: Grade | null = null): void {
    this.activeEntry.set(entry);
    this.editingGrade.set(grade);
    this.form.reset({
      title: grade?.title ?? '',
      score: grade?.score ?? 0,
      max_score: grade?.max_score ?? 100,
      feedback: grade?.feedback ?? '',
    });
    this.dialog().nativeElement.showModal();
  }

  protected closeDialog(): void {
    this.dialog().nativeElement.close();
  }

  protected saveGrade(): void {
    const entry = this.activeEntry();
    const { score, max_score } = this.form.getRawValue();
    if (this.form.invalid || !entry) {
      this.form.markAllAsTouched();
      return;
    }
    if (score > max_score) {
      this.toast.error('Score cannot exceed the maximum score.');
      return;
    }
    const value = this.form.getRawValue();
    const payload = { ...value, feedback: value.feedback.trim() || null };
    const grade = this.editingGrade();
    const request = grade
      ? this.enrollmentService.updateGrade(grade.id, payload)
      : this.enrollmentService.addGrade(entry.id, payload);

    this.saving.set(true);
    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeDialog();
        this.toast.success(grade ? 'Grade updated.' : 'Grade added.');
        this.refresh();
      },
      error: (error) => {
        this.saving.set(false);
        this.toast.error(errorMessage(error));
      },
    });
  }

  protected async deleteGrade(): Promise<void> {
    const grade = this.editingGrade();
    if (!grade) {
      return;
    }
    this.closeDialog();
    const confirmed = await this.confirm.ask({
      title: 'Delete this grade?',
      message: `“${grade.title}” will be removed from the student's record.`,
      confirmText: 'Delete grade',
      danger: true,
    });
    if (!confirmed) {
      return;
    }
    this.enrollmentService.deleteGrade(grade.id).subscribe({
      next: () => {
        this.toast.success('Grade deleted.');
        this.refresh();
      },
      error: (error) => this.toast.error(errorMessage(error)),
    });
  }

  private refresh(): void {
    this.enrollmentService
      .gradebook(Number(this.courseId()))
      .subscribe((entries) => this.entries.set(entries));
  }
}
