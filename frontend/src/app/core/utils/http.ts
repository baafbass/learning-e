import { HttpErrorResponse, HttpParams } from '@angular/common/http';

/** Build query params, skipping empty values so the API applies its defaults. */
export function toHttpParams(query: object): HttpParams {
  let params = new HttpParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== null && value !== undefined && value !== '') {
      params = params.set(key, String(value));
    }
  }
  return params;
}

/** Extract the human-readable message from an API error (`{ "detail": "..." }`). */
export function errorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return 'Cannot reach the server. Please check your connection.';
    }
    const detail: unknown = error.error?.detail;
    if (typeof detail === 'string') {
      return detail;
    }
  }
  return fallback;
}
