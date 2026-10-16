import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Category } from '../../core/models/category.model';
import { CourseSummary } from '../../core/models/course.model';
import { PublicStats } from '../../core/models/stats.model';
import { AuthService } from '../../core/services/auth.service';
import { CategoryService } from '../../core/services/category.service';
import { CourseService } from '../../core/services/course.service';
import { StatsService } from '../../core/services/stats.service';
import { CourseCardComponent } from '../../shared/components/course-card/course-card.component';
import { IconComponent } from '../../shared/components/icon/icon.component';

const POPULAR_SEARCHES = ['Angular', 'Python', 'Design', 'Docker'];

const STEPS = [
  {
    icon: 'travel_explore',
    title: 'Find your course',
    text: 'Search and filter the catalog by category, level and price.',
  },
  {
    icon: 'play_lesson',
    title: 'Learn step by step',
    text: 'Follow short lessons and mark each one complete as you go.',
  },
  {
    icon: 'workspace_premium',
    title: 'Get graded',
    text: 'Receive grades and feedback from your instructor.',
  },
];

const FEATURES = [
  { icon: 'insights', title: 'Progress tracking', text: 'See exactly how far you are in every course.' },
  { icon: 'devices', title: 'Learn anywhere', text: 'A responsive experience on phone, tablet and desktop.' },
  { icon: 'verified', title: 'Expert instructors', text: 'Courses built by practitioners who teach what they do.' },
  { icon: 'dark_mode', title: 'Easy on the eyes', text: 'Switch between light and dark themes at any time.' },
];

@Component({
  selector: 'app-home',
  imports: [FormsModule, RouterLink, CourseCardComponent, IconComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly courseService = inject(CourseService);
  private readonly categoryService = inject(CategoryService);
  private readonly statsService = inject(StatsService);
  protected readonly auth = inject(AuthService);

  protected readonly popularSearches = POPULAR_SEARCHES;
  protected readonly steps = STEPS;
  protected readonly features = FEATURES;

  protected readonly stats = signal<PublicStats | null>(null);
  protected readonly categories = signal<Category[]>([]);
  protected readonly courses = signal<CourseSummary[]>([]);
  protected readonly loadingCourses = signal(true);
  protected searchTerm = '';

  ngOnInit(): void {
    this.statsService.publicStats().subscribe({ next: (stats) => this.stats.set(stats) });
    this.categoryService.list().subscribe({ next: (categories) => this.categories.set(categories) });
    this.courseService.list({ sort: 'popular', size: 6 }).subscribe({
      next: (page) => {
        this.courses.set(page.items);
        this.loadingCourses.set(false);
      },
      error: () => this.loadingCourses.set(false),
    });
  }

  protected search(term = this.searchTerm): void {
    const q = term.trim();
    void this.router.navigate(['/courses'], { queryParams: q ? { q } : {} });
  }
}
