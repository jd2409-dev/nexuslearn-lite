'use server';

/**
 * @fileOverview Generates a quiz on a specific topic.
 *
 * - generateQuizFromTopic - A function that generates a quiz based on the provided topic and specifications.
 * - GenerateQuizFromTopicInput - The input type for the generateQuizFromTopic function.
 * - GenerateQuizFromTopicOutput - The return type for the generateQuizFromTopic function.
 */

import {ai} from '@/ai/server-genkit';
import {z} from 'genkit';

const GenerateQuizFromTopicInputSchema = z.object({
  topic: z.string().describe('The topic to generate the quiz on.'),
  numQuestions: z.number().describe('The number of questions to generate.'),
  questionType: z.enum(['MCQ', '1-mark', '2-mark', '3-mark', '5-mark']).describe('The type of questions to generate.'),
});
export type GenerateQuizFromTopicInput = z.infer<typeof GenerateQuizFromTopicInputSchema>;

const GenerateQuizFromTopicOutputSchema = z.object({
  quiz: z.string().describe('The generated quiz questions and answers.'),
});
export type GenerateQuizFromTopicOutput = z.infer<typeof GenerateQuizFromTopicOutputSchema>;

export async function generateQuizFromTopic(input: GenerateQuizFromTopicInput): Promise<GenerateQuizFromTopicOutput> {
  return generateQuizFromTopicFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizFromTopicPrompt',
  input: {schema: GenerateQuizFromTopicInputSchema},
  output: {schema: GenerateQuizFromTopicOutputSchema},
  prompt: `You are a quiz generator that generates quizzes on a specific topic.

    Generate a quiz on the topic of {{{topic}}} with {{{numQuestions}}} questions. The question type is {{{questionType}}}.
    Provide the questions and the answers in markdown format.
    `, 
});

const generateQuizFromTopicFlow = ai.defineFlow(
  {
    name: 'generateQuizFromTopicFlow',
    inputSchema: GenerateQuizFromTopicInputSchema,
    outputSchema: GenerateQuizFromTopicOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
