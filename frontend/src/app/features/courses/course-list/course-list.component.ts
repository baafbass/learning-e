import { TitleCasePipe, ViewportScroller } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { catchError, debounceTime, distinctUntilChanged, map, merge, of, switchMap, tap } from 'rxjs';

import { Category } from '../../../core/models/category.model';
import {
  COURSE_LEVELS,
  COURSE_SORT_OPTIONS,
  CourseLevel,
  CourseQuery,
  CourseSort,
  CourseSummary,
  PriceFilter,
} from '../../../core/models/course.model';
import { Page } from '../../../core/models/page.model';
import { CategoryService } from '../../../core/services/category.service';
import { CourseService } from '../../../core/services/course.service';
import { ToastService } from '../../../core/services/toast.service';
import { errorMessage } from '../../../core/utils/http';
import { CourseCardComponent } from '../../../shared/components/course-card/course-card.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

const PAGE_SIZE = 9;
const PRICE_OPTIONS: readonly { value: PriceFilter; label: string }[] = [
  { value: 'free', label: 'Free' },
  { value: 'paid', label: 'Paid' },
];

function parseQuery(params: ParamMap): CourseQuery {
  const level = params.get('level') as CourseLevel | null;
  const price = params.get('price') as PriceFilter | null;
  const sort = params.get('sort') as CourseSort | null;
  return {
    q: params.get('q') ?? '',
    category_id: Number(params.get('category_id')) || null,
    level: level && COURSE_LEVELS.includes(level) ? level : null,
    price: price && PRICE_OPTIONS.some((option) => option.value === price) ? price : null,
    sort: sort && COURSE_SORT_OPTIONS.some((option) => option.value === sort) ? sort : 'newest',
    page: Math.max(1, Number(params.get('page')) || 1),
  };
}

@Component({
  selector: 'app-course-list',
  imports: [
    ReactiveFormsModule,
    TitleCasePipe,
    CourseCardComponent,
    EmptyStateComponent,
    IconComponent,
    PaginationComponent,
  ],
  templateUrl: './course-list.component.html',
  styleUrl: './course-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseListComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly scroller = inject(ViewportScroller);
  private readonly courseService = inject(CourseService);
  private readonly toast = inject(ToastService);

  protected readonly levels = COURSE_LEVELS;
  protected readonly sortOptions = COURSE_SORT_OPTIONS;
  protected readonly priceOptions = PRICE_OPTIONS;

  protected readonly categories = signal<Category[]>([]);
  protected readonly result = signal<Page<CourseSummary> | null>(null);
  protected readonly loading = signal(true);
  protected readonly filtersOpen = signal(false);
  protected readonly query = signal<CourseQuery>({});
  protected readonly activeFilters = computed(() => {
    const { q, category_id, level, price } = this.query();
    return [q, category_id, level, price].filter(Boolean).length;
  });

  protected readonly form = inject(NonNullableFormBuilder).group({
    q: [''],
    category_id: [null as number | null],
    level: [null as CourseLevel | null],
    price: [null as PriceFilter | null],
    sort: ['newest' as CourseSort],
  });

  constructor() {
    inject(CategoryService)
      .list()
      .pipe(takeUntilDestroyed())
      .subscribe((categories) => this.categories.set(categories));

    this.route.queryParamMap
      .pipe(
        map(parseQuery),
        tap((query) => {
          this.query.set(query);
          this.form.setValue(
            {
              q: query.q ?? '',
              category_id: query.category_id ?? null,
              level: query.level ?? null,
              price: query.price ?? null,
              sort: query.sort ?? 'newest',
            },
            { emitEvent: false },
          );
          this.loading.set(true);
        }),
        switchMap((query) =>
          this.courseService.list({ ...query, size: PAGE_SIZE }).pipe(
            catchError((error) => {
              this.toast.error(errorMessage(error));
              return of(null);
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((page) => {
        this.result.set(page);
        this.loading.set(false);
      });

    const { q, category_id, level, price, sort } = this.form.controls;
    merge(
      q.valueChanges.pipe(debounceTime(350), distinctUntilChanged()),
      category_id.valueChanges,
      level.valueChanges,
      price.valueChanges,
      sort.valueChanges,
    )
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.applyFilters());
  }

  protected applyFilters(page = 1): void {
    const { q, category_id, level, price, sort } = this.form.getRawValue();
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: q.trim() || null,
        category_id,
        level,
        price,
        sort: sort === 'newest' ? null : sort,
        page: page > 1 ? page : null,
      },
    });
  }

  protected changePage(page: number): void {
    this.applyFilters(page);
    this.scroller.scrollToPosition([0, 0]);
  }

  protected clearFilters(): void {
    this.form.reset(undefined, { emitEvent: false });
    this.applyFilters();
  }
}
