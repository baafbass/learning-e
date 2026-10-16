import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { LessonOutline, LessonPayload } from '../../../core/models/course.model';
import { ConfirmService } from '../../../core/services/confirm.service';
import { CourseService } from '../../../core/services/course.service';
import { ToastService } from '../../../core/services/toast.service';
import { httpUrl } from '../../../core/utils/form-validators';
import { errorMessage } from '../../../core/utils/http';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { FieldErrorComponent } from '../../../shared/components/field-error/field-error.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';

/** Lists a course's lessons and edits them in a modal dialog. */
@Component({
  selector: 'app-lesson-manager',
  imports: [ReactiveFormsModule, EmptyStateComponent, FieldErrorComponent, IconComponent],
  templateUrl: './lesson-manager.component.html',
  styleUrl: './lesson-manager.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LessonManagerComponent {
  private readonly courseService = inject(CourseService);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('lessonDialog');

  readonly courseId = input.required<number>();
  readonly lessons = input.required<LessonOutline[]>();
  readonly changed = output<void>();

  protected readonly editingId = signal<number | null>(null);
  protected readonly saving = signal(false);

  protected readonly form = inject(NonNullableFormBuilder).group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
    position: [1, [Validators.required, Validators.min(1), Validators.max(1000)]],
    duration_minutes: [10, [Validators.required, Validators.min(0), Validators.max(600)]],
    video_url: ['', [Validators.maxLength(500), httpUrl]],
    content: ['', [Validators.required, Validators.minLength(10)]],
  });

  protected openCreate(): void {
    this.editingId.set(null);
    this.form.reset({
      title: '',
      position: this.lessons().length + 1,
      duration_minutes: 10,
      video_url: '',
      content: '',
    });
    this.dialog().nativeElement.showModal();
  }

  protected openEdit(lesson: LessonOutline): void {
    this.courseService.getLesson(this.courseId(), lesson.id).subscribe({
      next: (full) => {
        this.editingId.set(full.id);
        this.form.reset({
          title: full.title,
          position: full.position,
          duration_minutes: full.duration_minutes,
          video_url: full.video_url ?? '',
          content: full.content,
        });
        this.dialog().nativeElement.showModal();
      },
      error: (error) => this.toast.error(errorMessage(error)),
    });
  }

  protected close(): void {
    this.dialog().nativeElement.close();
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const payload: LessonPayload = { ...value, video_url: value.video_url.trim() || null };
    const lessonId = this.editingId();
    const request = lessonId
      ? this.courseService.updateLesson(this.courseId(), lessonId, payload)
      : this.courseService.createLesson(this.courseId(), payload);

    this.saving.set(true);
    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success(lessonId ? 'Lesson updated.' : 'Lesson added.');
        this.close();
        this.changed.emit();
      },
      error: (error) => {
        this.saving.set(false);
        this.toast.error(errorMessage(error));
      },
    });
  }

  protected async remove(lesson: LessonOutline): Promise<void> {
    const confirmed = await this.confirm.ask({
      title: 'Delete this lesson?',
      message: `“${lesson.title}” will be removed and every student's progress will be recalculated.`,
      confirmText: 'Delete lesson',
      danger: true,
    });
    if (!confirmed) {
      return;
    }
    this.courseService.deleteLesson(this.courseId(), lesson.id).subscribe({
      next: () => {
        this.toast.success('Lesson deleted.');
        this.changed.emit();
      },
      error: (error) => this.toast.error(errorMessage(error)),
    });
  }
}
