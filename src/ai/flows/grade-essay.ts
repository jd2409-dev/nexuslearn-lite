'use server';
/**
 * @fileOverview Grades an essay based on clarity, neatness, argument, and checks for AI generation.
 *
 * - gradeEssay - A function that grades an essay.
 * - GradeEssayInput - The input type for the gradeEssay function.
 * - GradeEssayOutput - The return type for the gradeEssay function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GradeEssayInputSchema = z.object({
  essay: z.string().describe('The essay to be graded.'),
});
export type GradeEssayInput = z.infer<typeof GradeEssayInputSchema>;

const GradeEssayOutputSchema = z.object({
  clarity: z.number().min(0).max(10).describe('Score for clarity, from 0 to 10.'),
  argument: z.number().min(0).max(10).describe('Score for the strength of the argument, from 0 to 10.'),
  originality: z.number().min(0).max(10).describe('Score for originality, from 0 to 10. A lower score suggests AI generation.'),
  feedback: z.string().describe('Constructive feedback for the essay.'),
});
export type GradeEssayOutput = z.infer<typeof GradeEssayOutputSchema>;

export async function gradeEssay(input: GradeEssayInput): Promise<GradeEssayOutput> {
  return gradeEssayFlow(input);
}

const prompt = ai.definePrompt({
  name: 'gradeEssayPrompt',
  input: {schema: GradeEssayInputSchema},
  output: {schema: GradeEssayOutputSchema},
  prompt: `You are an expert essay grader. Analyze the following essay based on three criteria: clarity, strength of argument, and originality.

  1.  **Clarity**: How clear and easy to understand is the writing? Is the language precise? (0-10)
  2.  **Argument**: How strong, well-supported, and coherent is the main argument or thesis? (0-10)
  3.  **Originality**: How original and human-like is the text? A low score indicates it is likely AI-generated. A high score suggests human authorship. (0-10)

  Finally, provide concise, constructive feedback to help the student improve.

  Essay to grade:
  {{{essay}}}

  Provide your grading and feedback now.`,
});

const gradeEssayFlow = ai.defineFlow(
  {
    name: 'gradeEssayFlow',
    inputSchema: GradeEssayInputSchema,
    outputSchema: GradeEssayOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
