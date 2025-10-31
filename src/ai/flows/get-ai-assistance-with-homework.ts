/**
 * @fileOverview An AI agent to provide homework assistance to students.
 *
 * - getAiAssistanceWithHomework - A function that provides AI assistance with homework.
 * - GetAiAssistanceWithHomeworkInput - The input type for the getAiAssistanceWithHomework function.
 * - GetAiAssistanceWithHomeworkOutput - The return type for the getAiAssistanceWithHomework function.
 */

import {ai} from '@/ai/client-genkit';
import {z} from 'genkit';

const GetAiAssistanceWithHomeworkInputSchema = z.object({
  question: z.string().describe('The academic question for which assistance is needed.'),
  subject: z.string().optional().describe('The subject of the question.'),
  gradeLevel: z.string().optional().describe('The grade level of the student.'),
  relevantMaterial: z
    .string()
    .optional()
    .describe('Optional relevant material or context for the question.'),
});
export type GetAiAssistanceWithHomeworkInput = z.infer<
  typeof GetAiAssistanceWithHomeworkInputSchema
>;

const GetAiAssistanceWithHomeworkOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer to the question.'),
  stepByStepSolution: z
    .string()
    .optional()
    .describe('A step-by-step solution to the problem, if applicable.'),
  explanation: z
    .string()
    .optional()
    .describe('An explanation of the concepts involved in the question.'),
});
export type GetAiAssistanceWithHomeworkOutput = z.infer<
  typeof GetAiAssistanceWithHomeworkOutputSchema
>;

export async function getAiAssistanceWithHomework(
  input: GetAiAssistanceWithHomeworkInput
): Promise<GetAiAssistanceWithHomeworkOutput> {
  return getAiAssistanceWithHomeworkFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getAiAssistanceWithHomeworkPrompt',
  input: {schema: GetAiAssistanceWithHomeworkInputSchema},
  output: {schema: GetAiAssistanceWithHomeworkOutputSchema},
  prompt: `You are an AI tutor helping a student with their homework.

  {{#if gradeLevel}}
  The student is in grade level: {{{gradeLevel}}}.
  {{/if}}
  {{#if subject}}
  The subject is: {{{subject}}}.
  {{/if}}

  Here is the question:
  {{{question}}}

  {{#if relevantMaterial}}
  Here is some relevant material:
  {{{relevantMaterial}}}
  {{/if}}

  Provide a clear and concise answer to the question.
  If applicable, provide a step-by-step solution.
  Also, provide an explanation of the concepts involved.

  Make sure that the answer is appropriate for the student's grade level.
`,
});

const getAiAssistanceWithHomeworkFlow = ai.defineFlow(
  {
    name: 'getAiAssistanceWithHomeworkFlow',
    inputSchema: GetAiAssistanceWithHomeworkInputSchema,
    outputSchema: GetAiAssistanceWithHomeworkOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);