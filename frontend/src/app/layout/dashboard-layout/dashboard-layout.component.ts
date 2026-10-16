import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { map } from 'rxjs';

import { IconComponent } from '../../shared/components/icon/icon.component';

export interface DashboardNavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  exact?: boolean;
}

export interface DashboardLayoutData {
  heading: string;
  nav: DashboardNavItem[];
}

/** Sidebar layout shared by the Teach and Admin areas; links come from the route's `data`. */
@Component({
  selector: 'app-dashboard-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent],
  template: `
    <div class="container layout">
      <aside class="sidebar" [attr.aria-label]="layout()?.heading + ' navigation'">
        <p class="heading">{{ layout()?.heading }}</p>
        <nav>
          @for (item of layout()?.nav; track item.id) {
            <a
              [id]="'sidebar-link-' + item.id"
              [routerLink]="item.path"
              routerLinkActive="active"
              ariaCurrentWhenActive="page"
              [routerLinkActiveOptions]="{ exact: item.exact ?? false }"
            >
              <app-icon [name]="item.icon" />
              <span>{{ item.label }}</span>
            </a>
          }
        </nav>
      </aside>
      <section class="content" id="dashboard-content">
        <router-outlet />
      </section>
    </div>
  `,
  styles: `
    .layout {
      display: grid;
      grid-template-columns: 240px minmax(0, 1fr);
      gap: 2rem;
      padding-block: 2rem 4rem;
    }

    .sidebar {
      position: sticky;
      top: calc(var(--navbar-height) + 1.5rem);
      align-self: start;
      padding: 1rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      background: var(--color-surface);
    }

    .heading {
      margin: 0.25rem 0.5rem 0.75rem;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--color-text-muted);
    }

    nav {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    a {
      display: flex;
      align-items: center;
      gap: 0.7rem;
      padding: 0.65rem 0.75rem;
      border-radius: var(--radius-sm);
      color: var(--color-text-muted);
      font-weight: 600;
      font-size: 0.93rem;

      &:hover {
        background: var(--color-surface-2);
        color: var(--color-text);
        text-decoration: none;
      }

      &.active {
        background: var(--color-primary-soft);
        color: var(--color-primary);
      }
    }

    @media (max-width: 900px) {
      .layout {
        grid-template-columns: 1fr;
        gap: 1.25rem;
      }

      .sidebar {
        position: static;
        padding: 0.5rem;
      }

      .heading {
        display: none;
      }

      nav {
        flex-direction: row;
        overflow-x: auto;
      }

      a {
        white-space: nowrap;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardLayoutComponent {
  protected readonly layout = toSignal(
    inject(ActivatedRoute).data.pipe(map((data) => data as DashboardLayoutData)),
  );
}
