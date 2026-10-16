import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap, tap } from 'rxjs';

import { ContactMessage, ContactQuery } from '../../../core/models/contact.model';
import { Page } from '../../../core/models/page.model';
import { ConfirmService } from '../../../core/services/confirm.service';
import { ContactService } from '../../../core/services/contact.service';
import { ToastService } from '../../../core/services/toast.service';
import { errorMessage } from '../../../core/utils/http';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

type Filter = 'all' | 'unread' | 'read';

const FILTERS: readonly { id: Filter; label: string; isRead: boolean | '' }[] = [
  { id: 'all', label: 'All', isRead: '' },
  { id: 'unread', label: 'Unread', isRead: false },
  { id: 'read', label: 'Read', isRead: true },
];

@Component({
  selector: 'app-admin-messages',
  imports: [DatePipe, EmptyStateComponent, IconComponent, LoadingComponent, PageHeaderComponent, PaginationComponent],
  templateUrl: './admin-messages.component.html',
  styleUrl: './admin-messages.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminMessagesComponent {
  private readonly contactService = inject(ContactService);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  protected readonly filters = FILTERS;
  protected readonly activeFilter = signal<Filter>('all');
  protected readonly query = signal<ContactQuery>({ page: 1, size: 10 });
  protected readonly result = signal<Page<ContactMessage> | null>(null);
  protected readonly loading = signal(true);

  constructor() {
    toObservable(this.query)
      .pipe(
        tap(() => this.loading.set(true)),
        switchMap((query) =>
          this.contactService.list(query).pipe(
            catchError((error) => {
              this.toast.error(errorMessage(error));
              return of(null);
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((page) => {
        this.result.set(page);
        this.loading.set(false);
      });
  }

  protected setFilter(filter: (typeof FILTERS)[number]): void {
    this.activeFilter.set(filter.id);
    this.query.set({ page: 1, size: 10, is_read: filter.isRead });
  }

  protected changePage(page: number): void {
    this.query.update((query) => ({ ...query, page }));
  }

  protected toggleRead(message: ContactMessage): void {
    this.contactService.markRead(message.id, !message.is_read).subscribe({
      next: () => this.query.update((query) => ({ ...query })),
      error: (error) => this.toast.error(errorMessage(error)),
    });
  }

  protected async remove(message: ContactMessage): Promise<void> {
    const confirmed = await this.confirm.ask({
      title: 'Delete this message?',
      message: `The message “${message.subject}” from ${message.name} will be deleted.`,
      confirmText: 'Delete',
      danger: true,
    });
    if (!confirmed) {
      return;
    }
    this.contactService.delete(message.id).subscribe({
      next: () => {
        this.toast.success('Message deleted.');
        this.query.update((query) => ({ ...query }));
      },
      error: (error) => this.toast.error(errorMessage(error)),
    });
  }
}
