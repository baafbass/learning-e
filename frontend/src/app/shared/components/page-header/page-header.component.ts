import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Title row of dashboard pages, with a slot for action buttons. */
@Component({
  selector: 'app-page-header',
  template: `
    <div>
      @if (eyebrow()) {
        <span class="eyebrow">{{ eyebrow() }}</span>
      }
      <h1 class="page-title">{{ title() }}</h1>
      @if (subtitle()) {
        <p class="muted mb-0">{{ subtitle() }}</p>
      }
    </div>
    <div class="actions"><ng-content /></div>
  `,
  styles: `
    :host {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 1.75rem;
    }

    h1 {
      font-size: clamp(1.5rem, 2.6vw, 1.95rem);
    }

    .actions {
      display: flex;
      gap: 0.6rem;
      flex-wrap: wrap;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string | null>(null);
  readonly eyebrow = input<string | null>(null);
}
