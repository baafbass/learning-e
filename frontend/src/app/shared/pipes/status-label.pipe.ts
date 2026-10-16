import { Pipe, PipeTransform } from '@angular/core';

import { EnrollmentStatus } from '../../core/models/enrollment.model';

const LABELS: Record<EnrollmentStatus, string> = {
  in_progress: 'In progress',
  completed: 'Completed',
};

@Pipe({ name: 'statusLabel' })
export class StatusLabelPipe implements PipeTransform {
  transform(status: EnrollmentStatus): string {
    return LABELS[status];
  }
}
