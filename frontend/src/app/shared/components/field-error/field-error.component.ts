import { Component, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

import { IconComponent } from '../icon/icon.component';

/**
 * Validation message for one form control, shown once the control was touched.
 * Uses default change detection so it re-evaluates whenever its form re-renders.
 */
@Component({
  selector: 'app-field-error',
  imports: [IconComponent],
  template: `
    @if (message(); as text) {
      <p class="error-text" [id]="errorId()" role="alert">
        <app-icon name="error" [size]="16" />{{ text }}
      </p>
    }
  `,
  styles: `
    p {
      margin: 0;
    }
  `,
})
export class FieldErrorComponent {
  readonly control = input.required<AbstractControl>();
  readonly label = input('This field');
  readonly errorId = input<string | null>(null);

  protected message(): string | null {
    const control = this.control();
    const errors = control.errors;
    if (!errors || !(control.touched || control.dirty)) {
      return null;
    }
    const label = this.label();
    if (errors['required']) return `${label} is required.`;
    if (errors['email']) return 'Enter a valid email address.';
    if (errors['minlength']) {
      return `${label} must be at least ${errors['minlength'].requiredLength} characters.`;
    }
    if (errors['maxlength']) {
      return `${label} must be at most ${errors['maxlength'].requiredLength} characters.`;
    }
    if (errors['min']) return `${label} must be at least ${errors['min'].min}.`;
    if (errors['max']) return `${label} must be at most ${errors['max'].max}.`;
    if (errors['passwordStrength']) return 'Use at least one letter and one digit.';
    if (errors['pattern']) return `${label} has an invalid format.`;
    return `${label} is invalid.`;
  }
}
