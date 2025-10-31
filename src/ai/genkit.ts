'use server';

/**
 * @fileoverview This file initializes the Genkit AI instance with the Google AI plugin.
 * It exports a singleton `ai` object that should be used for all AI-related
 * functionalities throughout the application, such as defining flows and prompts.
 */

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// Initialize the Genkit AI instance with the Google AI plugin.
// This configures Genkit to use Google's generative models (e.g., Gemini).
export const ai = genkit({
  plugins: [googleAI()],
});
