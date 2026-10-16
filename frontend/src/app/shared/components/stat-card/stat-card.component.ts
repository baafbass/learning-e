import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { IconComponent } from '../icon/icon.component';

export type StatTone = 'primary' | 'success' | 'warning' | 'accent' | 'danger';

@Component({
  selector: 'app-stat-card',
  imports: [IconComponent],
  template: `
    <div class="icon" [attr.data-tone]="tone()"><app-icon [name]="icon()" /></div>
    <div>
      <p class="label">{{ label() }}</p>
      <p class="value">{{ value() }}</p>
      @if (hint()) {
        <p class="hint">{{ hint() }}</p>
      }
    </div>
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.15rem 1.25rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      background: var(--color-surface);
      box-shadow: var(--shadow-sm);
    }

    .icon {
      display: grid;
      place-items: center;
      flex-shrink: 0;
      width: 48px;
      height: 48px;
      border-radius: 14px;
      background: var(--color-primary-soft);
      color: var(--color-primary);

      &[data-tone='success'] {
        background: var(--color-success-soft);
        color: var(--color-success);
      }

      &[data-tone='warning'] {
        background: var(--color-warning-soft);
        color: var(--color-warning);
      }

      &[data-tone='danger'] {
        background: var(--color-danger-soft);
        color: var(--color-danger);
      }

      &[data-tone='accent'] {
        background: color-mix(in srgb, var(--color-accent) 14%, transparent);
        color: var(--color-accent);
      }
    }

    p {
      margin: 0;
    }

    .label {
      font-size: 0.84rem;
      color: var(--color-text-muted);
    }

    .value {
      font-size: 1.55rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      line-height: 1.2;
    }

    .hint {
      font-size: 0.78rem;
      color: var(--color-text-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatCardComponent {
  readonly icon = input.required<string>();
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly hint = input<string | null>(null);
  readonly tone = input<StatTone>('primary');
}
