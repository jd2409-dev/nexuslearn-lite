'use client';

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// This is a client-side only initialization of Genkit.
// It is configured to avoid pulling in server-side dependencies like
// those that rely on 'async_hooks'.
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    }),
  ],
  // By not specifying a logger or other server-side plugins,
  // we ensure this instance is safe for the browser.
});
