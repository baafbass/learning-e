import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IconComponent } from '../../shared/components/icon/icon.component';

interface FooterColumn {
  id: string;
  title: string;
  links: { label: string; path: string }[];
}

const COLUMNS: FooterColumn[] = [
  {
    id: 'platform',
    title: 'Platform',
    links: [
      { label: 'Browse courses', path: '/courses' },
      { label: 'About us', path: '/about' },
      { label: 'FAQ', path: '/faq' },
      { label: 'Contact', path: '/contact' },
    ],
  },
  {
    id: 'account',
    title: 'Account',
    links: [
      { label: 'Log in', path: '/login' },
      { label: 'Create account', path: '/register' },
      { label: 'My learning', path: '/my-learning' },
      { label: 'Profile', path: '/profile' },
    ],
  },
  {
    id: 'legal',
    title: 'Legal',
    links: [
      { label: 'Privacy policy', path: '/privacy' },
      { label: 'Terms of service', path: '/terms' },
    ],
  },
];

const SOCIAL_LINKS = [
  { label: 'LearnHub on GitHub', icon: 'code', url: 'https://github.com' },
  { label: 'LearnHub on YouTube', icon: 'smart_display', url: 'https://www.youtube.com' },
  { label: 'Email the LearnHub team', icon: 'mail', url: 'mailto:hello@learnhub.dev' },
];

@Component({
  selector: 'app-footer',
  imports: [RouterLink, IconComponent],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  protected readonly columns = COLUMNS;
  protected readonly socialLinks = SOCIAL_LINKS;
  protected readonly year = new Date().getFullYear();
}
