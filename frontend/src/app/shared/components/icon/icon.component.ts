import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Decorative Material Symbols icon; screen readers skip it. */
@Component({
  selector: 'app-icon',
  template: `<span
    class="material-symbols-rounded"
    [class.filled]="filled()"
    [style.font-size.px]="size()"
    aria-hidden="true"
    >{{ name() }}</span
  >`,
  styles: `
    :host {
      display: inline-flex;
      line-height: 1;
    }

    .filled {
      font-variation-settings: 'FILL' 1;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  readonly name = input.required<string>();
  readonly size = input<number | null>(null);
  readonly filled = input(false);
}
