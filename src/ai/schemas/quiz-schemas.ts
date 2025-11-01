/**
 * @fileOverview Zod schemas and TypeScript types for the quiz generation AI flow.
 */
import { z } from 'zod';

// Input schema for the quiz generation flow
export const QuizInputSchema = z.object({
  topic: z.string().describe('The topic for the quiz.'),
  numQuestions: z
    .number()
    .int()
    .min(1)
    .max(10)
    .describe('The number of questions to generate.'),
  questionType: z
    .enum(['mcq', 'true-false', 'short-answer'])
    .describe('The type of questions to generate.'),
});
export type QuizInput = z.infer<typeof QuizInputSchema>;

// Schema for a single quiz question in the output
export const QuizQuestionSchema = z.object({
  question: z.string().describe('The text of the question.'),
  options: z
    .array(z.string())
    .optional()
    .describe('A list of possible answers for MCQ or True/False.'),
  correctAnswer: z.string().describe('The correct answer to the question.'),
});
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

// Output schema for the quiz generation flow
export const QuizOutputSchema = z.array(QuizQuestionSchema);
