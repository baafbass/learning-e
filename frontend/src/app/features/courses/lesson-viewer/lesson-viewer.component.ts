import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of, switchMap, tap } from 'rxjs';

import { CourseDetail, Lesson } from '../../../core/models/course.model';
import { Enrollment } from '../../../core/models/enrollment.model';
import { AuthService } from '../../../core/services/auth.service';
import { CourseService } from '../../../core/services/course.service';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { ToastService } from '../../../core/services/toast.service';
import { errorMessage } from '../../../core/utils/http';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ProgressBarComponent } from '../../../shared/components/progress-bar/progress-bar.component';
import { VideoEmbedPipe } from '../../../shared/pipes/video-embed.pipe';

@Component({
  selector: 'app-lesson-viewer',
  imports: [
    RouterLink,
    VideoEmbedPipe,
    EmptyStateComponent,
    IconComponent,
    LoadingComponent,
    ProgressBarComponent,
  ],
  templateUrl: './lesson-viewer.component.html',
  styleUrl: './lesson-viewer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LessonViewerComponent {
  private readonly title = inject(Title);
  private readonly courseService = inject(CourseService);
  private readonly enrollmentService = inject(EnrollmentService);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthService);

  /** Bound from the route parameters. */
  readonly courseId = input.required<string>();
  readonly lessonId = input.required<string>();

  protected readonly course = signal<CourseDetail | null>(null);
  protected readonly enrollment = signal<Enrollment | null>(null);
  protected readonly lesson = signal<Lesson | null>(null);
  protected readonly loadingCourse = signal(true);
  protected readonly loadingLesson = signal(true);
  protected readonly lessonError = signal<string | null>(null);
  protected readonly saving = signal(false);
  protected readonly sidebarOpen = signal(false);

  protected readonly completedIds = computed(
    () => new Set(this.enrollment()?.completed_lesson_ids ?? []),
  );
  protected readonly isCompleted = computed(() => {
    const lesson = this.lesson();
    return !!lesson && this.completedIds().has(lesson.id);
  });
  private readonly position = computed(
    () => this.course()?.lessons.findIndex((item) => item.id === Number(this.lessonId())) ?? -1,
  );
  protected readonly lessonNumber = computed(() => this.position() + 1);
  protected readonly previousLesson = computed(
    () => this.course()?.lessons[this.position() - 1] ?? null,
  );
  protected readonly nextLesson = computed(() => {
    const index = this.position();
    return index >= 0 ? (this.course()?.lessons[index + 1] ?? null) : null;
  });

  constructor() {
    toObservable(this.courseId)
      .pipe(
        tap(() => this.loadingCourse.set(true)),
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
        this.loadingCourse.set(false);
      });

    toObservable(this.lessonId)
      .pipe(
        tap(() => {
          this.loadingLesson.set(true);
          this.lessonError.set(null);
          this.sidebarOpen.set(false);
        }),
        switchMap((id) =>
          this.courseService.getLesson(Number(this.courseId()), Number(id)).pipe(
            catchError((error) => {
              this.lessonError.set(errorMessage(error, 'This lesson could not be loaded.'));
              return of(null);
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((lesson) => {
        this.lesson.set(lesson);
        this.loadingLesson.set(false);
        if (lesson) {
          this.title.setTitle(`${lesson.title} | LearnHub`);
        }
      });
  }

  protected toggleCompleted(): void {
    const lesson = this.lesson();
    const wasCompleted = this.enrollment()?.status === 'completed';
    if (!lesson || !this.enrollment()) {
      return;
    }
    this.saving.set(true);
    this.enrollmentService
      .setLessonCompleted(lesson.course_id, lesson.id, !this.isCompleted())
      .subscribe({
        next: (enrollment) => {
          this.enrollment.set(enrollment);
          this.saving.set(false);
          if (enrollment.status === 'completed' && !wasCompleted) {
            this.toast.success('Congratulations! You have completed this course.');
          }
        },
        error: (error) => {
          this.toast.error(errorMessage(error));
          this.saving.set(false);
        },
      });
  }
}
