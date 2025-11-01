'use server';
/**
 * @fileOverview An AI flow for generating quizzes.
 *
 * This file defines a Genkit flow that takes a topic, number of questions, and
 * question type to generate a structured quiz.
 *
 * - generateQuiz - The main function to call the quiz generation flow.
 * - QuizInput - The input type for the flow.
 * - QuizQuestion - The schema for a single question in the output.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Input schema for the quiz generation flow
export const QuizInputSchema = z.object({
  topic: z.string().describe('The topic for the quiz.'),
  numQuestions: z.number().int().min(1).max(10).describe('The number of questions to generate.'),
  questionType: z.enum(['mcq', 'true-false', 'short-answer']).describe('The type of questions to generate.'),
});
export type QuizInput = z.infer<typeof QuizInputSchema>;

// Schema for a single quiz question in the output
export const QuizQuestionSchema = z.object({
  question: z.string().describe('The text of the question.'),
  options: z.array(z.string()).optional().describe('A list of possible answers for MCQ or True/False.'),
  correctAnswer: z.string().describe('The correct answer to the question.'),
});
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

// Output schema for the quiz generation flow
const QuizOutputSchema = z.array(QuizQuestionSchema);

/**
 * Generates a quiz based on the provided input.
 * @param input - The parameters for quiz generation.
 * @returns A promise that resolves to an array of quiz questions.
 */
export async function generateQuiz(input: QuizInput): Promise<QuizQuestion[]> {
  return quizFlow(input);
}

// Define the Genkit prompt for the AI model
const quizPrompt = ai.definePrompt({
  name: 'quizPrompt',
  input: { schema: QuizInputSchema },
  output: { schema: QuizOutputSchema },
  prompt: `
    You are an AI assistant designed to create educational quizzes.
    Generate a quiz based on the following criteria:

    Topic: {{{topic}}}
    Number of Questions: {{{numQuestions}}}
    Question Type: {{{questionType}}}

    - For 'mcq' (Multiple Choice), provide 4 options.
    - For 'true-false', provide 'True' and 'False' as options.
    - For 'short-answer', do not provide any options.
    - Ensure the 'correctAnswer' field matches one of the 'options' for MCQ and true/false questions.
  `,
});

// Define the Genkit flow
const quizFlow = ai.defineFlow(
  {
    name: 'quizFlow',
    inputSchema: QuizInputSchema,
    outputSchema: QuizOutputSchema,
  },
  async (input) => {
    const { output } = await quizPrompt(input);
    return output!;
  }
);
