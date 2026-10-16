import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IconComponent } from '../../../shared/components/icon/icon.component';

const QUESTIONS = [
  {
    id: 'cost',
    question: 'How much does LearnHub cost?',
    answer: 'Creating an account is free and many courses are free. Paid courses show their price on the course card; enrollment is currently free for every course.',
  },
  {
    id: 'progress',
    question: 'How is my progress calculated?',
    answer: 'Progress is the share of lessons you have marked complete. When every lesson is complete, the course moves to your Completed tab automatically.',
  },
  {
    id: 'grades',
    question: 'Where can I see my grades?',
    answer: 'Open My learning and expand the grades of any course. Each grade shows the score, percentage, letter and your instructor’s feedback.',
  },
  {
    id: 'teach',
    question: 'How do I become an instructor?',
    answer: 'Choose “I want to teach” when you register. Instructors can create courses, add lessons, publish them and grade their students.',
  },
  {
    id: 'unenroll',
    question: 'Can I leave a course?',
    answer: 'Yes. Open the course page and click Unenroll. Your progress and grades for that course are removed.',
  },
  {
    id: 'account',
    question: 'I cannot log in. What should I do?',
    answer: 'Check your email and password. If your account was deactivated by an administrator, contact us through the contact page.',
  },
];

@Component({
  selector: 'app-faq',
  imports: [RouterLink, IconComponent],
  template: `
    <div class="container page narrow">
      <header class="text-center mb">
        <span class="eyebrow">Help center</span>
        <h1>Frequently asked questions</h1>
        <p class="muted">Can't find your answer? <a routerLink="/contact" id="faq-contact-link">Contact us</a>.</p>
      </header>
      <div class="faq">
        @for (item of questions; track item.id) {
          <details class="card" [id]="'faq-' + item.id">
            <summary>
              {{ item.question }}
              <app-icon name="expand_more" />
            </summary>
            <p>{{ item.answer }}</p>
          </details>
        }
      </div>
    </div>
  `,
  styles: `
    .narrow {
      max-width: 820px;
    }

    .faq {
      display: grid;
      gap: 0.75rem;
    }

    summary {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 1.1rem 1.25rem;
      font-weight: 600;
      list-style: none;
      cursor: pointer;

      &::-webkit-details-marker {
        display: none;
      }

      app-icon {
        transition: transform var(--transition);
      }
    }

    details[open] summary app-icon {
      transform: rotate(180deg);
    }

    p {
      margin: 0;
      padding: 0 1.25rem 1.25rem;
      color: var(--color-text-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FaqComponent {
  protected readonly questions = QUESTIONS;
}
