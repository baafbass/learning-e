import { TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { filter, switchMap } from 'rxjs';

import { Category } from '../../../core/models/category.model';
import { COURSE_LEVELS, CourseDetail, CourseLevel, CoursePayload } from '../../../core/models/course.model';
import { CategoryService } from '../../../core/services/category.service';
import { CourseService } from '../../../core/services/course.service';
import { ToastService } from '../../../core/services/toast.service';
import { httpUrl } from '../../../core/utils/form-validators';
import { errorMessage } from '../../../core/utils/http';
import { FieldErrorComponent } from '../../../shared/components/field-error/field-error.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LessonManagerComponent } from '../lesson-manager/lesson-manager.component';

const MAX_OUTCOMES = 12;

@Component({
  selector: 'app-course-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TitleCasePipe,
    FieldErrorComponent,
    IconComponent,
    LoadingComponent,
    PageHeaderComponent,
    LessonManagerComponent,
  ],
  templateUrl: './course-form.component.html',
  styleUrl: './course-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseFormComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly courseService = inject(CourseService);
  private readonly toast = inject(ToastService);

  /** Bound from the `:courseId` route parameter; absent when creating a course. */
  readonly courseId = input<string>();

  protected readonly levels = COURSE_LEVELS;
  protected readonly maxOutcomes = MAX_OUTCOMES;
  protected readonly categories = signal<Category[]>([]);
  protected readonly course = signal<CourseDetail | null>(null);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly isEdit = computed(() => !!this.courseId());

  protected readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
    summary: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(300)]],
    description: ['', [Validators.required, Validators.minLength(20)]],
    category_id: [null as number | null, Validators.required],
    level: ['beginner' as CourseLevel, Validators.required],
    price: [0, [Validators.required, Validators.min(0), Validators.max(10000)]],
    duration_hours: [1, [Validators.required, Validators.min(0), Validators.max(1000)]],
    thumbnail_url: ['', [Validators.maxLength(500), httpUrl]],
    is_published: [false],
    outcomes: this.fb.array([this.outcomeControl()]),
  });

  constructor() {
    inject(CategoryService)
      .list()
      .pipe(takeUntilDestroyed())
      .subscribe((categories) => this.categories.set(categories));

    toObservable(this.courseId)
      .pipe(
        filter((id): id is string => !!id),
        switchMap((id) => {
          this.loading.set(true);
          return this.courseService.get(Number(id));
        }),
        takeUntilDestroyed(),
      )
      .subscribe({
        next: (course) => {
          this.course.set(course);
          this.fillForm(course);
          this.loading.set(false);
        },
        error: (error) => {
          this.toast.error(errorMessage(error));
          void this.router.navigateByUrl('/teach');
        },
      });
  }

  protected get outcomes() {
    return this.form.controls.outcomes;
  }

  protected addOutcome(): void {
    if (this.outcomes.length < MAX_OUTCOMES) {
      this.outcomes.push(this.outcomeControl());
    }
  }

  protected removeOutcome(index: number): void {
    this.outcomes.removeAt(index);
    this.form.markAsDirty();
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Please fix the highlighted fields.');
      return;
    }
    const value = this.form.getRawValue();
    const payload: CoursePayload = {
      ...value,
      category_id: value.category_id as number,
      thumbnail_url: value.thumbnail_url.trim() || null,
      outcomes: value.outcomes.map((outcome) => outcome.trim()).filter(Boolean),
    };
    const existing = this.course();
    const request = existing
      ? this.courseService.update(existing.id, payload)
      : this.courseService.create(payload);

    this.saving.set(true);
    request.subscribe({
      next: (course) => {
        this.saving.set(false);
        this.form.markAsPristine();
        if (existing) {
          this.course.set(course);
          this.toast.success('Course saved.');
        } else {
          this.toast.success('Course created. Now add some lessons!');
          void this.router.navigate(['/teach/courses', course.id, 'edit']);
        }
      },
      error: (error) => {
        this.saving.set(false);
        this.toast.error(errorMessage(error));
      },
    });
  }

  protected reloadCourse(): void {
    const course = this.course();
    if (course) {
      this.courseService.get(course.id).subscribe((updated) => this.course.set(updated));
    }
  }

  private outcomeControl(value = ''): FormControl<string> {
    return this.fb.control(value, [Validators.maxLength(200)]);
  }

  private fillForm(course: CourseDetail): void {
    this.outcomes.clear();
    const outcomes = course.outcomes.length ? course.outcomes : [''];
    outcomes.forEach((outcome) => this.outcomes.push(this.outcomeControl(outcome)));
    this.form.patchValue({
      title: course.title,
      summary: course.summary,
      description: course.description,
      category_id: course.category_id,
      level: course.level,
      price: course.price,
      duration_hours: course.duration_hours,
      thumbnail_url: course.thumbnail_url ?? '',
      is_published: course.is_published,
    });
    this.form.markAsPristine();
  }
}
