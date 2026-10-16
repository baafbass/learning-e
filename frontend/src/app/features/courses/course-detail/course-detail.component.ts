import { DatePipe, TitleCasePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { catchError, forkJoin, of, switchMap, tap } from 'rxjs';

import { CourseDetail } from '../../../core/models/course.model';
import { Enrollment } from '../../../core/models/enrollment.model';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { CourseService } from '../../../core/services/course.service';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { ToastService } from '../../../core/services/toast.service';
import { errorMessage } from '../../../core/utils/http';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { CourseCoverComponent } from '../../../shared/components/course-cover/course-cover.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ProgressBarComponent } from '../../../shared/components/progress-bar/progress-bar.component';
import { PricePipe } from '../../../shared/pipes/price.pipe';
import { StatusLabelPipe } from '../../../shared/pipes/status-label.pipe';

@Component({
  selector: 'app-course-detail',
  imports: [
    RouterLink,
    DatePipe,
    TitleCasePipe,
    PricePipe,
    StatusLabelPipe,
    AvatarComponent,
    CourseCoverComponent,
    EmptyStateComponent,
    IconComponent,
    LoadingComponent,
    ProgressBarComponent,
  ],
  templateUrl: './course-detail.component.html',
  styleUrl: './course-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseDetailComponent {
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly courseService = inject(CourseService);
  private readonly enrollmentService = inject(EnrollmentService);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);
  protected readonly auth = inject(AuthService);

  /** Bound from the `:courseId` route parameter. */
  readonly courseId = input.required<string>();

  protected readonly course = signal<CourseDetail | null>(null);
  protected readonly enrollment = signal<Enrollment | null>(null);
  protected readonly loading = signal(true);
  protected readonly busy = signal(false);

  protected readonly canManage = computed(() => {
    const course = this.course();
    const user = this.auth.user();
    return !!course && !!user && (user.role === 'admin' || course.instructor.id === user.id);
  });
  protected readonly totalMinutes = computed(
    () => this.course()?.lessons.reduce((sum, lesson) => sum + lesson.duration_minutes, 0) ?? 0,
  );
  protected readonly completedIds = computed(
    () => new Set(this.enrollment()?.completed_lesson_ids ?? []),
  );
  protected readonly resumeLessonId = computed(
    () => this.enrollment()?.next_lesson_id ?? this.course()?.lessons[0]?.id ?? null,
  );

  constructor() {
    toObservable(this.courseId)
      .pipe(
        tap(() => this.loading.set(true)),
        switchMap((id) =>
          forkJoin({
            course: this.courseService.get(Number(id)).pipe(catchError(() => of(null))),
            enrollment: this.auth.isStudent()
              ? this.enrollmentService.getForCourse(Number(id)).pipe(catchError(() => of(null)))
              : of(null),
          }),
        ),
        takeUntilDestroyed(),
      )
      .subscribe(({ course, enrollment }) => {
        this.course.set(course);
        this.enrollment.set(enrollment);
        this.loading.set(false);
        if (course) {
          this.title.setTitle(`${course.title} | LearnHub`);
        }
      });
  }

  protected enroll(): void {
    const course = this.course();
    if (!course) {
      return;
    }
    if (!this.auth.isLoggedIn()) {
      void this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    this.busy.set(true);
    this.enrollmentService.enroll(course.id).subscribe({
      next: (enrollment) => {
        this.enrollment.set(enrollment);
        this.course.update((current) =>
          current ? { ...current, enrollment_count: current.enrollment_count + 1 } : current,
        );
        this.toast.success(`You are enrolled in “${course.title}”. Happy learning!`);
        this.busy.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.toast.error(errorMessage(error));
        this.busy.set(false);
      },
    });
  }

  protected async unenroll(): Promise<void> {
    const course = this.course();
    const confirmed = await this.confirm.ask({
      title: 'Leave this course?',
      message: 'Your progress and grades for this course will be permanently removed.',
      confirmText: 'Unenroll',
      danger: true,
    });
    if (!course || !confirmed) {
      return;
    }
    this.enrollmentService.unenroll(course.id).subscribe({
      next: () => {
        this.enrollment.set(null);
        this.course.update((current) =>
          current ? { ...current, enrollment_count: current.enrollment_count - 1 } : current,
        );
        this.toast.info('You have left the course.');
      },
      error: (error) => this.toast.error(errorMessage(error)),
    });
  }
}
