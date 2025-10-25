'use server';
/**
 * @fileOverview This flow provides AI-powered feedback on quiz answers.
 *
 * It takes the quiz questions, user answers, and correct answers as input, and returns AI-generated feedback and explanations.
 *
 * - receiveAiPoweredFeedbackOnQuiz - The main function to receive AI feedback on a quiz.
 * - ReceiveAiPoweredFeedbackOnQuizInput - The input type for the receiveAiPoweredFeedbackOnQuiz function.
 * - ReceiveAiPoweredFeedbackOnQuizOutput - The output type for the receiveAiPoweredFeedbackOnQuiz function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReceiveAiPoweredFeedbackOnQuizInputSchema = z.object({
  quizQuestions: z.array(z.string()).describe('The questions in the quiz.'),
  userAnswers: z.array(z.string()).describe('The user\u2019s answers to the quiz questions.'),
  correctAnswers: z.array(z.string()).describe('The correct answers to the quiz questions.'),
});
export type ReceiveAiPoweredFeedbackOnQuizInput = z.infer<typeof ReceiveAiPoweredFeedbackOnQuizInputSchema>;

const ReceiveAiPoweredFeedbackOnQuizOutputSchema = z.object({
  feedback: z.array(z.string()).describe('AI-generated feedback and explanations for each question.'),
});
export type ReceiveAiPoweredFeedbackOnQuizOutput = z.infer<typeof ReceiveAiPoweredFeedbackOnQuizOutputSchema>;

export async function receiveAiPoweredFeedbackOnQuiz(
  input: ReceiveAiPoweredFeedbackOnQuizInput
): Promise<ReceiveAiPoweredFeedbackOnQuizOutput> {
  return receiveAiPoweredFeedbackOnQuizFlow(input);
}

const feedbackPrompt = ai.definePrompt({
  name: 'feedbackPrompt',
  input: {schema: ReceiveAiPoweredFeedbackOnQuizInputSchema},
  output: {schema: ReceiveAiPoweredFeedbackOnQuizOutputSchema},
  prompt: `You are an AI tutor providing feedback on a quiz.

  Provide clear, concise, and helpful explanations for each answer, focusing on areas where the student can improve.
  Address each question individually, and provide reasoning as to why the given correct answer is accurate.

  Quiz Questions: {{quizQuestions}}
  User Answers: {{userAnswers}}
  Correct Answers: {{correctAnswers}}

  \nGenerate feedback for each question and answer:
  `,
});

const receiveAiPoweredFeedbackOnQuizFlow = ai.defineFlow(
  {
    name: 'receiveAiPoweredFeedbackOnQuizFlow',
    inputSchema: ReceiveAiPoweredFeedbackOnQuizInputSchema,
    outputSchema: ReceiveAiPoweredFeedbackOnQuizOutputSchema,
  },
  async input => {
    const {output} = await feedbackPrompt(input);
    return output!;
  }
);
