import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { IconComponent } from '../icon/icon.component';

const WINDOW = 2;

@Component({
  selector: 'app-pagination',
  imports: [IconComponent],
  template: `
    @if (pages() > 1) {
      <nav class="pagination" aria-label="Pagination">
        <button
          type="button"
          class="icon-btn"
          id="pagination-previous"
          name="pagination-previous"
          title="Previous page"
          aria-label="Previous page"
          [disabled]="page() <= 1"
          (click)="go(page() - 1)"
        >
          <app-icon name="chevron_left" />
        </button>
        @for (number of numbers(); track number) {
          <button
            type="button"
            class="page"
            [id]="'pagination-page-' + number"
            [attr.aria-current]="number === page() ? 'page' : null"
            [attr.aria-label]="'Page ' + number"
            (click)="go(number)"
          >
            {{ number }}
          </button>
        }
        <button
          type="button"
          class="icon-btn"
          id="pagination-next"
          name="pagination-next"
          title="Next page"
          aria-label="Next page"
          [disabled]="page() >= pages()"
          (click)="go(page() + 1)"
        >
          <app-icon name="chevron_right" />
        </button>
      </nav>
    }
  `,
  styles: `
    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0.3rem;
      margin-top: 2rem;
    }

    .page {
      min-width: 36px;
      height: 36px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      background: var(--color-surface);
      color: var(--color-text);
      font: inherit;
      font-weight: 600;
      cursor: pointer;

      &:hover {
        border-color: var(--color-primary);
      }

      &[aria-current='page'] {
        background: var(--color-primary);
        border-color: var(--color-primary);
        color: var(--color-on-primary);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent {
  readonly page = input.required<number>();
  readonly pages = input.required<number>();
  readonly pageChange = output<number>();

  protected readonly numbers = computed(() => {
    const first = Math.max(1, this.page() - WINDOW);
    const last = Math.min(this.pages(), this.page() + WINDOW);
    return Array.from({ length: last - first + 1 }, (_, index) => first + index);
  });

  protected go(page: number): void {
    if (page >= 1 && page <= this.pages() && page !== this.page()) {
      this.pageChange.emit(page);
    }
  }
}
