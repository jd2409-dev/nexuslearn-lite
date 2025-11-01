'use server';
/**
 * @fileOverview An AI flow for generating quizzes.
 *
 * This file defines a Genkit flow that takes a topic, number of questions, and
 * question type to generate a structured quiz.
 *
 * - generateQuiz - The main function to call the quiz generation flow.
 */

import { ai } from '@/ai/genkit';
import {
  QuizInputSchema,
  QuizQuestion,
  QuizOutputSchema,
  type QuizInput,
} from '@/ai/schemas/quiz-schemas';

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
