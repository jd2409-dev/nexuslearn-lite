/**
 * @fileOverview Provides personalized study suggestions based on quiz results.
 *
 * - receivePersonalizedStudySuggestions - A function that generates personalized study suggestions.
 * - PersonalizedStudySuggestionsInput - The input type for the receivePersonalizedStudySuggestions function.
 * - PersonalizedStudySuggestionsOutput - The return type for the receivePersonalizedStudySuggestions function.
 */

import {ai} from '@/ai/client-genkit';
import {z} from 'genkit';

const PersonalizedStudySuggestionsInputSchema = z.object({
  quizResults: z.string().describe('The results of the quiz or test.'),
  topicsCovered: z.string().describe('The topics covered in the quiz or test.'),
  studentGrade: z.string().describe('The grade of the student.'),
  studentBoard: z.string().describe('The board to which student belongs to.'),
});
export type PersonalizedStudySuggestionsInput = z.infer<typeof PersonalizedStudySuggestionsInputSchema>;

const PersonalizedStudySuggestionsOutputSchema = z.object({
  suggestions: z.string().describe('Personalized study suggestions based on quiz results.'),
});
export type PersonalizedStudySuggestionsOutput = z.infer<typeof PersonalizedStudySuggestionsOutputSchema>;

export async function receivePersonalizedStudySuggestions(
  input: PersonalizedStudySuggestionsInput
): Promise<PersonalizedStudySuggestionsOutput> {
  return receivePersonalizedStudySuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedStudySuggestionsPrompt',
  input: {schema: PersonalizedStudySuggestionsInputSchema},
  output: {schema: PersonalizedStudySuggestionsOutputSchema},
  prompt: `You are an AI study assistant that provides personalized study suggestions to students based on their quiz results.

You will receive the quiz results, the topics covered in the quiz, the student\'s grade, and the student\'s board.

Based on this information, you will provide personalized study suggestions to the student.

Quiz Results: {{{quizResults}}}
Topics Covered: {{{topicsCovered}}}
Student Grade: {{{studentGrade}}}
Student Board: {{{studentBoard}}}

Suggestions:`, // Provide study suggestions based on the quiz results and topics covered.
});

const receivePersonalizedStudySuggestionsFlow = ai.defineFlow(
  {
    name: 'receivePersonalizedStudySuggestionsFlow',
    inputSchema: PersonalizedStudySuggestionsInputSchema,
    outputSchema: PersonalizedStudySuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
