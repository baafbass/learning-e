import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { IconComponent } from '../../../shared/components/icon/icon.component';

const HIGHLIGHTS = [
  { icon: 'auto_stories', text: 'Practical courses from experienced instructors' },
  { icon: 'trending_up', text: 'Track your progress lesson by lesson' },
  { icon: 'grade', text: 'Receive grades and personal feedback' },
];

/** Two-column frame for the login and register pages. */
@Component({
  selector: 'app-auth-shell',
  imports: [IconComponent],
  template: `
    <div class="shell container">
      <aside class="showcase" aria-hidden="true">
        <span class="eyebrow">LearnHub</span>
        <h2>{{ tagline() }}</h2>
        <ul>
          @for (item of highlights; track item.icon) {
            <li><app-icon [name]="item.icon" /> {{ item.text }}</li>
          }
        </ul>
        <div class="orb one"></div>
        <div class="orb two"></div>
      </aside>
      <section class="card form-card">
        <ng-content />
      </section>
    </div>
  `,
  styles: `
    .shell {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      align-items: stretch;
      padding-block: 3rem 4rem;
    }

    .showcase {
      position: relative;
      overflow: hidden;
      padding: 3rem 2.5rem;
      border-radius: var(--radius-lg);
      background: var(--gradient-brand);
      color: #fff;

      .eyebrow {
        color: rgb(255 255 255 / 80%);
      }

      h2 {
        position: relative;
        z-index: 1;
        max-width: 420px;
        margin-bottom: 2rem;
        font-size: clamp(1.6rem, 3vw, 2.2rem);
      }

      ul {
        position: relative;
        z-index: 1;
        display: grid;
        gap: 1rem;
        margin: 0;
        padding: 0;
        list-style: none;
      }

      li {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-weight: 500;
      }
    }

    .orb {
      position: absolute;
      border-radius: 50%;
      background: rgb(255 255 255 / 12%);

      &.one {
        width: 280px;
        height: 280px;
        right: -80px;
        bottom: -80px;
      }

      &.two {
        width: 140px;
        height: 140px;
        right: 120px;
        bottom: 140px;
      }
    }

    .form-card {
      padding: clamp(1.5rem, 4vw, 2.75rem);
    }

    @media (max-width: 860px) {
      .shell {
        grid-template-columns: 1fr;
      }

      .showcase {
        display: none;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthShellComponent {
  readonly tagline = input('Learn new skills, at your own pace.');
  protected readonly highlights = HIGHLIGHTS;
}
