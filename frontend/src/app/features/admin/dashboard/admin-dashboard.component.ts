import { DatePipe, TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AdminStats } from '../../../core/models/stats.model';
import { StatsService } from '../../../core/services/stats.service';
import { ToastService } from '../../../core/services/toast.service';
import { errorMessage } from '../../../core/utils/http';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';

@Component({
  selector: 'app-admin-dashboard',
  imports: [
    RouterLink,
    DatePipe,
    TitleCasePipe,
    AvatarComponent,
    IconComponent,
    LoadingComponent,
    PageHeaderComponent,
    StatCardComponent,
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent implements OnInit {
  private readonly statsService = inject(StatsService);
  private readonly toast = inject(ToastService);

  protected readonly stats = signal<AdminStats | null>(null);
  protected readonly topEnrollment = computed(() =>
    Math.max(1, ...(this.stats()?.top_courses.map((course) => course.enrollment_count) ?? [])),
  );
  protected readonly inProgressShare = computed(() => {
    const stats = this.stats();
    return stats?.enrollments ? Math.round((stats.enrollments_in_progress / stats.enrollments) * 100) : 0;
  });

  ngOnInit(): void {
    this.statsService.adminStats().subscribe({
      next: (stats) => this.stats.set(stats),
      error: (error) => this.toast.error(errorMessage(error)),
    });
  }
}
