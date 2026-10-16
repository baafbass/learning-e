import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, IconComponent],
  template: `
    <section class="container page not-found" aria-labelledby="not-found-title">
      <p class="code text-gradient" aria-hidden="true">404</p>
      <h1 id="not-found-title">Page not found</h1>
      <p class="muted">The page you are looking for does not exist or has been moved.</p>
      <div class="flex gap-sm wrap center">
        <a class="btn btn-primary" routerLink="/" id="not-found-home-link"><app-icon name="home" /> Go home</a>
        <a class="btn" routerLink="/courses" id="not-found-courses-link">Browse courses</a>
      </div>
    </section>
  `,
  styles: `
    .not-found {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-block: 5rem;
      text-align: center;
    }

    .code {
      margin: 0;
      font-size: clamp(5rem, 15vw, 9rem);
      font-weight: 800;
      line-height: 1;
      letter-spacing: -0.05em;
    }

    .center {
      justify-content: center;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundComponent {}
