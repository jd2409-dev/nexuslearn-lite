'use server';
/**
 * @fileoverview A flow that acts as a helpful AI tutor.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit/zod';

export const askTutor = ai.defineFlow(
  {
    name: 'askTutor',
    inputSchema: z.object({
      query: z.string(),
    }),
    outputSchema: z.string(),
  },
  async ({query}) => {
    const llmResponse = await ai.generate({
      prompt: `You are a friendly and encouraging AI tutor for a student. 
      The user has asked the following question: "${query}".
      Provide a clear, concise, and helpful answer. 
      If the question is complex, break it down into smaller, easy-to-understand parts.
      Keep your tone positive and supportive.`,
      model: 'googleai/gemini-1.5-flash-latest',
      config: {
        temperature: 0.7,
      },
    });

    return llmResponse.text;
  }
);
