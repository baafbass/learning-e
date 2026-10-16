import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-empty-state',
  imports: [IconComponent],
  template: `
    <div class="icon-wrap"><app-icon [name]="icon()" [size]="34" /></div>
    <h3>{{ title() }}</h3>
    @if (message()) {
      <p>{{ message() }}</p>
    }
    <ng-content />
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 3rem 1.5rem;
      border: 1px dashed var(--color-border);
      border-radius: var(--radius-lg);
      background: var(--color-surface);
      text-align: center;
    }

    .icon-wrap {
      display: grid;
      place-items: center;
      width: 68px;
      height: 68px;
      margin-bottom: 1rem;
      border-radius: 50%;
      background: var(--color-primary-soft);
      color: var(--color-primary);
    }

    p {
      max-width: 420px;
      color: var(--color-text-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  readonly icon = input('inbox');
  readonly title = input.required<string>();
  readonly message = input<string | null>(null);
}
