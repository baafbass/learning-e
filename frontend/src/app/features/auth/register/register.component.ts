import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { RegisterPayload } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { matchFields, passwordStrength } from '../../../core/utils/form-validators';
import { errorMessage } from '../../../core/utils/http';
import { homeFor } from '../../../core/utils/navigation';
import { FieldErrorComponent } from '../../../shared/components/field-error/field-error.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { AuthShellComponent } from '../auth-shell/auth-shell.component';

const ROLE_OPTIONS = [
  {
    value: 'student',
    icon: 'school',
    title: 'I want to learn',
    description: 'Enroll in courses and track your progress.',
  },
  {
    value: 'instructor',
    icon: 'co_present',
    title: 'I want to teach',
    description: 'Create courses and grade your students.',
  },
] as const;

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, AuthShellComponent, FieldErrorComponent, IconComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly roleOptions = ROLE_OPTIONS;
  protected readonly submitting = signal(false);
  protected readonly showPassword = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = inject(NonNullableFormBuilder).group(
    {
      full_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['student' as RegisterPayload['role'], Validators.required],
      password: [
        '',
        [Validators.required, Validators.minLength(8), Validators.maxLength(72), passwordStrength],
      ],
      confirm_password: ['', Validators.required],
      accept_terms: [false, Validators.requiredTrue],
    },
    { validators: matchFields('password', 'confirm_password') },
  );

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { full_name, email, role, password } = this.form.getRawValue();
    this.submitting.set(true);
    this.error.set(null);
    this.auth.register({ full_name: full_name.trim(), email, role, password }).subscribe({
      next: (user) => {
        this.toast.success(`Welcome to LearnHub, ${user.full_name.split(' ')[0]}!`);
        void this.router.navigateByUrl(homeFor(user.role));
      },
      error: (error) => {
        this.error.set(errorMessage(error));
        this.submitting.set(false);
      },
    });
  }
}
