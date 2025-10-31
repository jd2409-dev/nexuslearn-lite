'use server';

import {genkit, type GenkitErrorCode, type GenkitError} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiVersion: 'v1beta',
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

export function isGenkitError(
  error: unknown,
  code?: GenkitErrorCode
): error is GenkitError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'errorCode' in error &&
    (!code || (error as GenkitError).errorCode === code)
  );
}
