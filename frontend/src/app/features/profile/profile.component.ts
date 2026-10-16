import { DatePipe, TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { httpUrl, matchFields, passwordStrength } from '../../core/utils/form-validators';
import { errorMessage } from '../../core/utils/http';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { FieldErrorComponent } from '../../shared/components/field-error/field-error.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-profile',
  imports: [
    ReactiveFormsModule,
    DatePipe,
    TitleCasePipe,
    AvatarComponent,
    FieldErrorComponent,
    IconComponent,
    PageHeaderComponent,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly toast = inject(ToastService);
  protected readonly auth = inject(AuthService);

  protected readonly savingProfile = signal(false);
  protected readonly savingPassword = signal(false);

  protected readonly profileForm = this.fb.group({
    full_name: [
      this.auth.user()?.full_name ?? '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(120)],
    ],
    bio: [this.auth.user()?.bio ?? '', Validators.maxLength(1000)],
    avatar_url: [this.auth.user()?.avatar_url ?? '', [Validators.maxLength(500), httpUrl]],
  });

  protected readonly passwordForm = this.fb.group(
    {
      current_password: ['', Validators.required],
      new_password: [
        '',
        [Validators.required, Validators.minLength(8), Validators.maxLength(72), passwordStrength],
      ],
      confirm_password: ['', Validators.required],
    },
    { validators: matchFields('new_password', 'confirm_password') },
  );

  protected saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    const { full_name, bio, avatar_url } = this.profileForm.getRawValue();
    this.savingProfile.set(true);
    this.auth
      .updateProfile({ full_name: full_name.trim(), bio: bio.trim() || null, avatar_url: avatar_url.trim() || null })
      .subscribe({
        next: () => {
          this.toast.success('Your profile has been updated.');
          this.profileForm.markAsPristine();
          this.savingProfile.set(false);
        },
        error: (error) => {
          this.toast.error(errorMessage(error));
          this.savingProfile.set(false);
        },
      });
  }

  protected changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    const { current_password, new_password } = this.passwordForm.getRawValue();
    this.savingPassword.set(true);
    this.auth.changePassword({ current_password, new_password }).subscribe({
      next: () => {
        this.toast.success('Your password has been changed.');
        this.passwordForm.reset();
        this.savingPassword.set(false);
      },
      error: (error) => {
        this.toast.error(errorMessage(error));
        this.savingPassword.set(false);
      },
    });
  }
}
