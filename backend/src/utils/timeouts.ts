// src/utils/timeouts.ts
import { ApiError } from './ApiError';

/**
 * Race a promise against a timeout.
 *
 * Wraps any async operation (HTTP fetch, DB query, whatever) with a hard
 * time limit. If the operation exceeds `ms`, rejects with a
 * TIMEOUT ApiError — which `investigation.service.ts` catches, records as
 * `ProviderStatus.TIMEOUT`, and moves on.
 *
 * This is what makes "one slow provider doesn't kill the investigation"
 * possible.
 *
 * Note: this does NOT cancel the underlying HTTP request (that requires
 * AbortController + passing the signal into axios). The provider clients
 * use their own AbortController for real cancellation. This helper is a
 * belt-and-suspenders safety net at the service layer.
 */
export function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label = 'Operation'
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(
        new ApiError(
          504,
          `${label} timed out after ${ms}ms`,
          'PROVIDER_TIMEOUT'
        )
      );
    }, ms);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

/**
 * Check whether an unknown value is a TIMEOUT ApiError.
 * Used by `investigation.service.ts` to decide between `FAILED` and
 * `TIMEOUT` provider statuses.
 */
export function isTimeoutError(err: unknown): boolean {
  return err instanceof ApiError && err.code === 'PROVIDER_TIMEOUT';
}