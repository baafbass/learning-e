import { DatePipe, LowerCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { EnrollmentStatus, MyEnrollment } from '../../../core/models/enrollment.model';
import { AuthService } from '../../../core/services/auth.service';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { ToastService } from '../../../core/services/toast.service';
import { errorMessage } from '../../../core/utils/http';
import { CourseCoverComponent } from '../../../shared/components/course-cover/course-cover.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ProgressBarComponent } from '../../../shared/components/progress-bar/progress-bar.component';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { StatusLabelPipe } from '../../../shared/pipes/status-label.pipe';

type Tab = 'all' | EnrollmentStatus;

@Component({
  selector: 'app-my-learning',
  imports: [
    RouterLink,
    DatePipe,
    LowerCasePipe,
    StatusLabelPipe,
    CourseCoverComponent,
    EmptyStateComponent,
    IconComponent,
    LoadingComponent,
    PageHeaderComponent,
    ProgressBarComponent,
    StatCardComponent,
  ],
  templateUrl: './my-learning.component.html',
  styleUrl: './my-learning.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyLearningComponent implements OnInit {
  private readonly enrollmentService = inject(EnrollmentService);
  private readonly toast = inject(ToastService);
  protected readonly auth = inject(AuthService);

  protected readonly enrollments = signal<MyEnrollment[]>([]);
  protected readonly loading = signal(true);
  protected readonly activeTab = signal<Tab>('all');

  protected readonly inProgress = computed(() =>
    this.enrollments().filter((enrollment) => enrollment.status === 'in_progress'),
  );
  protected readonly completed = computed(() =>
    this.enrollments().filter((enrollment) => enrollment.status === 'completed'),
  );
  protected readonly visible = computed(() => {
    switch (this.activeTab()) {
      case 'in_progress':
        return this.inProgress();
      case 'completed':
        return this.completed();
      default:
        return this.enrollments();
    }
  });
  protected readonly tabs = computed(() => [
    { id: 'all' as Tab, label: 'All courses', count: this.enrollments().length },
    { id: 'in_progress' as Tab, label: 'In progress', count: this.inProgress().length },
    { id: 'completed' as Tab, label: 'Completed', count: this.completed().length },
  ]);
  protected readonly averageGrade = computed(() => {
    const grades = this.enrollments().flatMap((enrollment) => enrollment.grades);
    if (!grades.length) {
      return null;
    }
    return Math.round((grades.reduce((sum, grade) => sum + grade.percentage, 0) / grades.length) * 10) / 10;
  });
  protected readonly firstName = computed(() => this.auth.user()?.full_name.split(' ')[0] ?? '');

  ngOnInit(): void {
    this.enrollmentService.listMine().subscribe({
      next: (enrollments) => {
        this.enrollments.set(enrollments);
        this.loading.set(false);
      },
      error: (error) => {
        this.toast.error(errorMessage(error));
        this.loading.set(false);
      },
    });
  }
}
