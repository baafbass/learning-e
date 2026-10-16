import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ToastService, ToastType } from '../../../core/services/toast.service';
import { IconComponent } from '../icon/icon.component';

const ICONS: Record<ToastType, string> = {
  success: 'check_circle',
  error: 'error',
  info: 'info',
};

@Component({
  selector: 'app-toast-container',
  imports: [IconComponent],
  template: `
    <div class="stack" aria-live="polite" aria-atomic="false">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast" [attr.data-type]="toast.type" [attr.role]="toast.type === 'error' ? 'alert' : 'status'">
          <app-icon [name]="icons[toast.type]" [filled]="true" />
          <p>{{ toast.message }}</p>
          <button
            type="button"
            class="icon-btn"
            [id]="'toast-dismiss-' + toast.id"
            title="Dismiss notification"
            aria-label="Dismiss notification"
            (click)="toastService.dismiss(toast.id)"
          >
            <app-icon name="close" [size]="18" />
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    .stack {
      position: fixed;
      right: 1rem;
      bottom: 1rem;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      width: min(380px, calc(100vw - 2rem));
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 0.7rem;
      padding: 0.75rem 0.6rem 0.75rem 1rem;
      border: 1px solid var(--color-border);
      border-left: 4px solid var(--color-primary);
      border-radius: var(--radius);
      background: var(--color-surface);
      box-shadow: var(--shadow-lg);
      animation: slide-in 220ms ease-out;

      p {
        flex: 1;
        margin: 0;
        font-size: 0.92rem;
      }

      > app-icon {
        color: var(--color-primary);
      }

      &[data-type='success'] {
        border-left-color: var(--color-success);

        > app-icon {
          color: var(--color-success);
        }
      }

      &[data-type='error'] {
        border-left-color: var(--color-danger);

        > app-icon {
          color: var(--color-danger);
        }
      }
    }

    @keyframes slide-in {
      from {
        opacity: 0;
        transform: translateY(12px);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastContainerComponent {
  protected readonly toastService = inject(ToastService);
  protected readonly icons = ICONS;
}
