'use server';
/**
 * @fileOverview Defines a Genkit flow for an AI tutor.
 *
 * This file exports the `askTutor` function, which is a Genkit flow
 * that takes a user's question as input and returns an AI-generated
 * response tailored to a 10th-grade student.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

// Define the input schema for the AI tutor flow.
// It expects a single string property: `question`.
const TutorInputSchema = z.object({
  question: z.string(),
});

// Define the prompt for the AI model.
// This prompt configures the model to act as a friendly and encouraging
// AI tutor for a 10th-grade student.
const tutorPrompt = ai.definePrompt(
  {
    name: 'tutorPrompt',
    input: {schema: TutorInputSchema},
    prompt: `
      You are an expert AI Tutor for a 10th-grade student.
      Your tone should be encouraging, friendly, and helpful.
      Explain concepts clearly and concisely, using examples when helpful.
      Do not overwhelm the student with too much information.
      Keep your response to a maximum of 3-4 paragraphs.

      Here is the student's question:
      {{{question}}}
    `,
  },
);


// Define the main flow for the AI tutor.
// This flow takes a question, invokes the prompt, and returns the response.
const askTutorFlow = ai.defineFlow(
  {
    name: 'askTutorFlow',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (question) => {
    // Generate a response using the tutor prompt.
    const {output} = await tutorPrompt({question});
    
    // Return the generated text or an empty string if no output.
    return output ?? '';
  },
);

/**
 * A simple wrapper function to call the `askTutorFlow`.
 * This provides a clean, typed interface for other parts of the application.
 * @param question The student's question as a string.
 * @returns A promise that resolves to the AI's response.
 */
export async function askTutor(question: string): Promise<string> {
  return await askTutorFlow(question);
}
