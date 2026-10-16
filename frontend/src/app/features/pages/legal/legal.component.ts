import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

interface LegalPage {
  title: string;
  updated: string;
  sections: { heading: string; text: string }[];
}

const PAGES: Record<'privacy' | 'terms', LegalPage> = {
  privacy: {
    title: 'Privacy policy',
    updated: 'October 2026',
    sections: [
      {
        heading: 'Data we collect',
        text: 'We store your name, email address, optional bio and avatar link, your enrollments, lesson progress and grades, and messages you send through the contact form.',
      },
      {
        heading: 'How we use it',
        text: 'Your data is used only to provide the service: signing you in, showing your progress, letting instructors grade their students and answering your messages.',
      },
      {
        heading: 'Security',
        text: 'Passwords are stored as one-way bcrypt hashes. All requests are authenticated with signed tokens and the database is reached over an encrypted connection.',
      },
      {
        heading: 'Your rights',
        text: 'You can update your profile at any time. To delete your account, contact us and an administrator will remove it together with your enrollments.',
      },
    ],
  },
  terms: {
    title: 'Terms of service',
    updated: 'October 2026',
    sections: [
      {
        heading: 'Using LearnHub',
        text: 'You agree to provide accurate information, keep your password private and use the platform for lawful learning and teaching only.',
      },
      {
        heading: 'Instructor content',
        text: 'Instructors keep ownership of their courses and are responsible for their content. Administrators may unpublish or remove content that breaks these terms.',
      },
      {
        heading: 'Accounts',
        text: 'Administrators may deactivate accounts that misuse the platform. Deactivated accounts cannot sign in.',
      },
      {
        heading: 'Changes',
        text: 'These terms may change as the platform evolves. Continued use after a change means you accept the updated terms.',
      },
    ],
  },
};

/** Privacy policy or terms of service, selected by the route's `page` data. */
@Component({
  selector: 'app-legal',
  template: `
    <article class="container page legal">
      <header>
        <span class="eyebrow">Legal</span>
        <h1>{{ content().title }}</h1>
        <p class="muted">Last updated: {{ content().updated }}</p>
      </header>
      @for (section of content().sections; track section.heading; let index = $index) {
        <section [attr.aria-labelledby]="'legal-section-' + index">
          <h2 [id]="'legal-section-' + index">{{ index + 1 }}. {{ section.heading }}</h2>
          <p>{{ section.text }}</p>
        </section>
      }
    </article>
  `,
  styles: `
    .legal {
      max-width: 780px;
    }

    h2 {
      margin-top: 2rem;
      font-size: 1.2rem;
    }

    p {
      color: var(--color-text-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegalComponent {
  /** Bound from the route's `data.page`. */
  readonly page = input.required<keyof typeof PAGES>();

  protected readonly content = computed(() => PAGES[this.page()]);
}
