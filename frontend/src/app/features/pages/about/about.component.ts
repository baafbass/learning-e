import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';

import { StatsService } from '../../../core/services/stats.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

const VALUES = [
  { icon: 'lightbulb', title: 'Practical first', text: 'Every course is built around skills you can use the next day.' },
  { icon: 'visibility', title: 'Transparent progress', text: 'Students always know where they stand and what comes next.' },
  { icon: 'diversity_3', title: 'Open to everyone', text: 'Many courses are free, and the platform works on any device.' },
  { icon: 'forum', title: 'Real feedback', text: 'Instructors grade work and leave personal feedback.' },
];

@Component({
  selector: 'app-about',
  imports: [RouterLink, IconComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent {
  protected readonly values = VALUES;
  protected readonly stats = toSignal(inject(StatsService).publicStats().pipe(catchError(() => of(null))));
}
