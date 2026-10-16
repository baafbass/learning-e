import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { IconComponent } from '../icon/icon.component';

const GRADIENTS = [
  'linear-gradient(135deg, #4f46e5, #7c3aed)',
  'linear-gradient(135deg, #0891b2, #2563eb)',
  'linear-gradient(135deg, #db2777, #9333ea)',
  'linear-gradient(135deg, #059669, #0d9488)',
  'linear-gradient(135deg, #ea580c, #db2777)',
  'linear-gradient(135deg, #2563eb, #0ea5e9)',
  'linear-gradient(135deg, #7c3aed, #c026d3)',
  'linear-gradient(135deg, #0f766e, #4f46e5)',
];

/** Course image, or a branded gradient with the category icon when no image is set. */
@Component({
  selector: 'app-course-cover',
  imports: [IconComponent],
  template: `
    @if (imageUrl(); as url) {
      <img [src]="url" [alt]="'Cover image for ' + title()" loading="lazy" />
    } @else {
      <div class="placeholder" [style.background]="gradient()" role="img" [attr.aria-label]="title()">
        <app-icon [name]="icon()" [size]="iconSize()" />
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
      overflow: hidden;
      aspect-ratio: 16 / 9;
      background: var(--color-surface-2);
    }

    img,
    .placeholder {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .placeholder {
      display: grid;
      place-items: center;
      color: rgb(255 255 255 / 92%);
      background-blend-mode: overlay;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseCoverComponent {
  readonly courseId = input.required<number>();
  readonly title = input.required<string>();
  readonly icon = input('school');
  readonly imageUrl = input<string | null>(null);
  readonly iconSize = input(52);

  protected readonly gradient = computed(() => GRADIENTS[this.courseId() % GRADIENTS.length]);
}
