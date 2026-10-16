import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const COLORS = ['#4f46e5', '#0891b2', '#db2777', '#059669', '#ea580c', '#7c3aed', '#2563eb'];
const SIZES = { sm: 32, md: 40, lg: 72 } as const;

/** Profile picture, or coloured initials when the user has no avatar. */
@Component({
  selector: 'app-avatar',
  template: `
    @if (url(); as src) {
      <img [src]="src" [alt]="name() + ' avatar'" [width]="pixels()" [height]="pixels()" />
    } @else {
      <span [style.background]="color()" [attr.aria-label]="name()" role="img">{{ initials() }}</span>
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      flex-shrink: 0;
    }

    img,
    span {
      width: var(--avatar-size);
      height: var(--avatar-size);
      border-radius: 50%;
      object-fit: cover;
    }

    span {
      display: grid;
      place-items: center;
      color: #fff;
      font-weight: 700;
      font-size: calc(var(--avatar-size) * 0.38);
    }
  `,
  host: { '[style.--avatar-size.px]': 'pixels()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarComponent {
  readonly name = input.required<string>();
  readonly url = input<string | null>(null);
  readonly size = input<keyof typeof SIZES>('md');

  protected readonly pixels = computed(() => SIZES[this.size()]);
  protected readonly initials = computed(() =>
    this.name()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join(''),
  );
  protected readonly color = computed(() => {
    const hash = [...this.name()].reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return COLORS[hash % COLORS.length];
  });
}
