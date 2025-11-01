'use server';
/**
 * @fileOverview An AI flow for generating quizzes.
 * This file defines a Genkit flow for quiz generation.
 */

import { ai } from '@/ai/genkit';
import {
  QuizInputSchema,
  QuizQuestion,
  QuizOutputSchema,
  type QuizInput,
} from '@/ai/schemas/quiz-schemas';

export async function generateQuiz(input: QuizInput): Promise<QuizQuestion[]> {
  // Directly call the flow with the provided input.
  const quiz = await quizFlow(input);
  return quiz;
}

// Genkit prompt for the Gemini model
const quizPrompt = ai.definePrompt({
  name: 'quizPrompt',
  // Specify the model directly as a string.
  model: 'googleai/gemini-2.5-flash',
  input: { schema: QuizInputSchema },
  output: { schema: QuizOutputSchema },
  prompt: `
    You are an AI assistant designed to create educational quizzes.
    Generate a quiz based on the following criteria:
    Topic: {{{topic}}}
    Number of Questions: {{{numQuestions}}}
    Question Type: {{{questionType}}}

    - For 'mcq' (multiple choice), provide exactly 4 options.
    - For 'true-false', provide two options: 'True' and 'False'.
    - For 'short-answer', do not provide any options.
    - Crucially, ensure the 'correctAnswer' field in your response perfectly matches one of the provided 'options' for MCQ and true/false questions.
  `,
});

// Genkit flow that orchestrates the quiz generation.
const quizFlow = ai.defineFlow(
  {
    name: 'quizFlow',
    inputSchema: QuizInputSchema,
    outputSchema: QuizOutputSchema,
  },
  async (input) => {
    // Execute the prompt and get the structured output.
    const { output } = await quizPrompt(input);
    // The 'output' is guaranteed to be in the format of QuizOutputSchema (an array of questions).
    return output!;
  }
);
