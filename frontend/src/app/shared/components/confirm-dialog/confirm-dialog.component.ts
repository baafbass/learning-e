import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  inject,
  viewChild,
} from '@angular/core';

import { ConfirmService } from '../../../core/services/confirm.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-confirm-dialog',
  imports: [IconComponent],
  template: `
    <dialog
      #dialog
      class="modal"
      id="confirm-dialog"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
      (cancel)="confirm.answer(false)"
    >
      @if (confirm.request(); as request) {
        <div class="modal-body">
          <div class="icon" [class.danger]="request.danger">
            <app-icon [name]="request.danger ? 'warning' : 'help'" />
          </div>
          <h2 id="confirm-dialog-title">{{ request.title }}</h2>
          <p id="confirm-dialog-message" class="muted">{{ request.message }}</p>
          <div class="form-actions">
            <button
              type="button"
              class="btn"
              id="confirm-dialog-cancel"
              name="confirm-dialog-cancel"
              (click)="confirm.answer(false)"
            >
              {{ request.cancelText ?? 'Cancel' }}
            </button>
            <button
              type="button"
              class="btn"
              id="confirm-dialog-accept"
              name="confirm-dialog-accept"
              [class.btn-danger]="request.danger"
              [class.btn-primary]="!request.danger"
              (click)="confirm.answer(true)"
            >
              {{ request.confirmText ?? 'Confirm' }}
            </button>
          </div>
        </div>
      }
    </dialog>
  `,
  styles: `
    .modal {
      width: min(440px, calc(100vw - 2rem));
    }

    .icon {
      display: grid;
      place-items: center;
      width: 48px;
      height: 48px;
      margin-bottom: 1rem;
      border-radius: 50%;
      background: var(--color-primary-soft);
      color: var(--color-primary);

      &.danger {
        background: var(--color-danger-soft);
        color: var(--color-danger);
      }
    }

    h2 {
      font-size: 1.15rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {
  protected readonly confirm = inject(ConfirmService);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    effect(() => {
      const element = this.dialog().nativeElement;
      if (this.confirm.request() && !element.open) {
        element.showModal();
      } else if (!this.confirm.request() && element.open) {
        element.close();
      }
    });
  }
}
