import { TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CourseSummary } from '../../../core/models/course.model';
import { PricePipe } from '../../pipes/price.pipe';
import { AvatarComponent } from '../avatar/avatar.component';
import { CourseCoverComponent } from '../course-cover/course-cover.component';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-course-card',
  imports: [
    RouterLink,
    TitleCasePipe,
    PricePipe,
    AvatarComponent,
    CourseCoverComponent,
    IconComponent,
  ],
  templateUrl: './course-card.component.html',
  styleUrl: './course-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseCardComponent {
  readonly course = input.required<CourseSummary>();
}
