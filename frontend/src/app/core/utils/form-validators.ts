import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

/** Mirrors the API rule: at least one letter and one digit. */
export const passwordStrength: ValidatorFn = (control) => {
  const value = String(control.value ?? '');
  if (!value) {
    return null;
  }
  return /[a-z]/i.test(value) && /\d/.test(value) ? null : { passwordStrength: true };
};

/** Optional http(s) URL. */
export const httpUrl: ValidatorFn = Validators.pattern(/^https?:\/\/\S+$/);

/** Group validator: the two named controls must hold the same value. */
export function matchFields(field: string, confirmation: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const value = group.get(field)?.value;
    const repeated = group.get(confirmation)?.value;
    return value && repeated && value !== repeated ? { mismatch: true } : null;
  };
}
