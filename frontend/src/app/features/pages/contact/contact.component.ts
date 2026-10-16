import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AuthService } from '../../../core/services/auth.service';
import { ContactService } from '../../../core/services/contact.service';
import { ToastService } from '../../../core/services/toast.service';
import { errorMessage } from '../../../core/utils/http';
import { FieldErrorComponent } from '../../../shared/components/field-error/field-error.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';

const CONTACT_INFO = [
  { icon: 'mail', title: 'Email', text: 'hello@learnhub.dev', href: 'mailto:hello@learnhub.dev' },
  { icon: 'schedule', title: 'Response time', text: 'Within 2 business days', href: null },
  { icon: 'help', title: 'Quick answers', text: 'Read the FAQ', href: '/faq' },
];

@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule, FieldErrorComponent, IconComponent],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactComponent {
  private readonly contactService = inject(ContactService);
  private readonly toast = inject(ToastService);
  private readonly user = inject(AuthService).user();

  protected readonly contactInfo = CONTACT_INFO;
  protected readonly sending = signal(false);
  protected readonly sent = signal(false);

  protected readonly form = inject(NonNullableFormBuilder).group({
    name: [this.user?.full_name ?? '', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
    email: [this.user?.email ?? '', [Validators.required, Validators.email]],
    subject: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
    message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(5000)]],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.sending.set(true);
    this.contactService.send(this.form.getRawValue()).subscribe({
      next: () => {
        this.sending.set(false);
        this.sent.set(true);
        this.toast.success('Thank you! Your message has been sent.');
      },
      error: (error) => {
        this.sending.set(false);
        this.toast.error(errorMessage(error));
      },
    });
  }

  protected sendAnother(): void {
    this.form.controls.subject.reset();
    this.form.controls.message.reset();
    this.sent.set(false);
  }
}
