import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';

import { UserRole } from '../../core/models/user.model';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { ToastService } from '../../core/services/toast.service';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { IconComponent } from '../../shared/components/icon/icon.component';

interface NavLink {
  id: string;
  label: string;
  path: string;
  icon: string;
  exact?: boolean;
}

const PUBLIC_LINKS: NavLink[] = [
  { id: 'home', label: 'Home', path: '/', icon: 'home', exact: true },
  { id: 'courses', label: 'Courses', path: '/courses', icon: 'auto_stories' },
  { id: 'about', label: 'About', path: '/about', icon: 'info' },
  { id: 'contact', label: 'Contact', path: '/contact', icon: 'mail' },
];

const ROLE_LINKS: Record<UserRole, NavLink> = {
  student: { id: 'my-learning', label: 'My learning', path: '/my-learning', icon: 'school' },
  instructor: { id: 'teach', label: 'Teach', path: '/teach', icon: 'co_present' },
  admin: { id: 'admin', label: 'Admin', path: '/admin', icon: 'admin_panel_settings' },
};

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, AvatarComponent, IconComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  host: {
    '(document:click)': 'closeOnOutsideClick($event)',
    '(document:keydown.escape)': 'closeMenus()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  protected readonly auth = inject(AuthService);
  protected readonly theme = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly mobileOpen = signal(false);
  protected readonly userMenuOpen = signal(false);
  protected readonly links = computed(() => {
    const role = this.auth.role();
    return role ? [...PUBLIC_LINKS, ROLE_LINKS[role]] : PUBLIC_LINKS;
  });
  protected readonly dashboardLink = computed(() => {
    const role = this.auth.role();
    return role ? ROLE_LINKS[role] : null;
  });

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.closeMenus());
  }

  protected toggleMobile(): void {
    this.mobileOpen.update((open) => !open);
  }

  protected toggleUserMenu(): void {
    this.userMenuOpen.update((open) => !open);
  }

  protected closeMenus(): void {
    this.mobileOpen.set(false);
    this.userMenuOpen.set(false);
  }

  protected closeOnOutsideClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.closeMenus();
    }
  }

  protected logout(): void {
    this.auth.logout();
    this.toast.info('You have been logged out.');
    void this.router.navigateByUrl('/');
  }
}
