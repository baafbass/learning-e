import { DOCUMENT } from '@angular/common';
import { Injectable, effect, inject, signal } from '@angular/core';

import { storage } from '../utils/storage';

export type Theme = 'light' | 'dark';

const THEME_KEY = 'learnhub.theme';

/** Light/dark theme; the initial value is applied by a script in index.html. */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly root = inject(DOCUMENT).documentElement;
  private readonly current = signal<Theme>(this.root.dataset['theme'] === 'dark' ? 'dark' : 'light');

  readonly theme = this.current.asReadonly();

  constructor() {
    effect(() => {
      const theme = this.current();
      this.root.dataset['theme'] = theme;
      storage.set(THEME_KEY, theme);
    });
  }

  toggle(): void {
    this.current.update((theme) => (theme === 'dark' ? 'light' : 'dark'));
  }
}
