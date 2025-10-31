'use server';
/**
 * @fileoverview An AI flow for answering student questions.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit/zod';

export const askTutor = ai.defineFlow(
  {
    name: 'askTutor',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (prompt) => {
    const llmResponse = await ai.generate({
      prompt: `You are an expert tutor. Answer the following student question concisely and clearly: ${prompt}`,
      model: 'gemini-1.5-flash-latest',
      config: {
        temperature: 0.5,
      },
    });

    return llmResponse.text;
  }
);
