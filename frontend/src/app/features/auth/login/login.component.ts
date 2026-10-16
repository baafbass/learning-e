import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { errorMessage } from '../../../core/utils/http';
import { homeFor, safeReturnUrl } from '../../../core/utils/navigation';
import { FieldErrorComponent } from '../../../shared/components/field-error/field-error.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { AuthShellComponent } from '../auth-shell/auth-shell.component';

/** Accounts created by `python -m app.db.init_db --seed`. */
const DEMO_ACCOUNTS = [
  { role: 'Admin', email: 'admin@learnhub.dev', password: 'Admin@123' },
  { role: 'Instructor', email: 'sarah.johnson@learnhub.dev', password: 'Instructor@123' },
  { role: 'Student', email: 'yasmine.haddad@learnhub.dev', password: 'Student@123' },
];

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, AuthShellComponent, FieldErrorComponent, IconComponent],
  templateUrl: './login.component.html',
  styles: `
    .demo {
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--color-border);

      h2 {
        margin-bottom: 0.25rem;
        font-size: 0.95rem;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  /** Bound from the `returnUrl` query parameter. */
  readonly returnUrl = input<string>();

  protected readonly demoAccounts = DEMO_ACCOUNTS;
  protected readonly submitting = signal(false);
  protected readonly showPassword = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  protected useDemo(account: (typeof DEMO_ACCOUNTS)[number]): void {
    this.form.setValue({ email: account.email, password: account.password });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.error.set(null);
    this.auth.login(this.form.getRawValue()).subscribe({
      next: (user) => {
        this.toast.success(`Welcome back, ${user.full_name.split(' ')[0]}!`);
        void this.router.navigateByUrl(safeReturnUrl(this.returnUrl()) ?? homeFor(user.role));
      },
      error: (error) => {
        this.error.set(errorMessage(error));
        this.submitting.set(false);
      },
    });
  }
}
