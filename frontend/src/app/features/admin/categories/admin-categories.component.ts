import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Category } from '../../../core/models/category.model';
import { CategoryService } from '../../../core/services/category.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { ToastService } from '../../../core/services/toast.service';
import { errorMessage } from '../../../core/utils/http';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { FieldErrorComponent } from '../../../shared/components/field-error/field-error.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

const ICON_CHOICES = [
  'category', 'code', 'analytics', 'palette', 'business_center', 'smartphone', 'cloud',
  'shield', 'translate', 'science', 'calculate', 'music_note', 'photo_camera', 'psychology',
  'sports_esports', 'health_and_safety', 'campaign', 'architecture',
];

@Component({
  selector: 'app-admin-categories',
  imports: [ReactiveFormsModule, EmptyStateComponent, FieldErrorComponent, IconComponent, PageHeaderComponent],
  templateUrl: './admin-categories.component.html',
  styleUrl: './admin-categories.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCategoriesComponent implements OnInit {
  private readonly categoryService = inject(CategoryService);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  protected readonly iconChoices = ICON_CHOICES;
  protected readonly categories = signal<Category[]>([]);
  protected readonly editing = signal<Category | null>(null);
  protected readonly saving = signal(false);

  protected readonly form = inject(NonNullableFormBuilder).group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    icon: ['category', Validators.required],
    description: ['', Validators.maxLength(255)],
  });

  ngOnInit(): void {
    this.load();
  }

  protected edit(category: Category): void {
    this.editing.set(category);
    this.form.reset({
      name: category.name,
      icon: category.icon,
      description: category.description ?? '',
    });
  }

  protected cancelEdit(): void {
    this.editing.set(null);
    this.form.reset();
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const payload = { ...value, name: value.name.trim(), description: value.description.trim() || null };
    const current = this.editing();
    const request = current
      ? this.categoryService.update(current.id, payload)
      : this.categoryService.create(payload);

    this.saving.set(true);
    request.subscribe({
      next: (category) => {
        this.saving.set(false);
        this.toast.success(current ? `“${category.name}” updated.` : `“${category.name}” created.`);
        this.cancelEdit();
        this.load();
      },
      error: (error) => {
        this.saving.set(false);
        this.toast.error(errorMessage(error));
      },
    });
  }

  protected async remove(category: Category): Promise<void> {
    const confirmed = await this.confirm.ask({
      title: 'Delete this category?',
      message: `“${category.name}” will be removed. Categories used by courses cannot be deleted.`,
      confirmText: 'Delete category',
      danger: true,
    });
    if (!confirmed) {
      return;
    }
    this.categoryService.delete(category.id).subscribe({
      next: () => {
        this.toast.success('Category deleted.');
        this.load();
      },
      error: (error) => this.toast.error(errorMessage(error)),
    });
  }

  private load(): void {
    this.categoryService.list().subscribe({
      next: (categories) => this.categories.set(categories),
      error: (error) => this.toast.error(errorMessage(error)),
    });
  }
}
