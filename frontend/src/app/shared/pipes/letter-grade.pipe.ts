import { Pipe, PipeTransform } from '@angular/core';

const THRESHOLDS: readonly [number, string][] = [
  [90, 'A'],
  [80, 'B'],
  [70, 'C'],
  [60, 'D'],
];

/** Percentage → letter grade, using the same scale as the API. */
@Pipe({ name: 'letterGrade' })
export class LetterGradePipe implements PipeTransform {
  transform(percentage: number | null | undefined): string {
    if (percentage === null || percentage === undefined) {
      return '—';
    }
    return THRESHOLDS.find(([minimum]) => percentage >= minimum)?.[1] ?? 'F';
  }
}
