import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  template: `
    <div
      class="track"
      role="progressbar"
      [attr.aria-valuenow]="clamped()"
      aria-valuemin="0"
      aria-valuemax="100"
      [attr.aria-label]="label()"
    >
      <div class="fill" [class.complete]="clamped() === 100" [style.width.%]="clamped()"></div>
    </div>
    @if (showValue()) {
      <span class="value">{{ clamped() }}%</span>
    }
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      min-width: 120px;
    }

    .track {
      flex: 1;
      height: 8px;
      border-radius: 999px;
      background: var(--color-surface-2);
      overflow: hidden;
    }

    .fill {
      height: 100%;
      border-radius: inherit;
      background: var(--gradient-brand);
      transition: width 400ms ease;

      &.complete {
        background: var(--color-success);
      }
    }

    .value {
      min-width: 2.6rem;
      font-size: 0.82rem;
      font-weight: 600;
      text-align: right;
      color: var(--color-text-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressBarComponent {
  readonly value = input.required<number>();
  readonly label = input('Progress');
  readonly showValue = input(true);

  protected readonly clamped = computed(() => Math.min(100, Math.max(0, Math.round(this.value()))));
}
