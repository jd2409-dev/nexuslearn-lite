"use server";
/**
 * @fileOverview An AI flow for analyzing a student's quiz history to identify patterns in mistakes.
 *
 * This file defines a Genkit flow that takes a user's quiz history and provides
 * an analysis of their common mistakes, concepts to revisit, and actionable study suggestions.
 *
 * - analyzeMistakes - The main function to call the analysis flow.
 * - MistakeAnalysisInput - The input type for the flow (quiz history).
 * - MistakeAnalysis - The structured output of the analysis.
 */

import { ai } from "@/ai/genkit";
import { z } from "zod";
import Handlebars from 'handlebars';

// Schema for a single question within a quiz attempt
const QuizQuestionSchema = z.object({
  question: z.string().describe("The text of the quiz question."),
  userAnswer: z.string().describe("The answer the user provided."),
  correctAnswer: z.string().describe("The correct answer to the question."),
});

// Schema for a single quiz attempt
const QuizAttemptSchema = z.object({
  id: z.string().describe("Unique identifier for the quiz attempt."),
  topic: z.string().describe("The topic of the quiz."),
  score: z.number().describe("The user's score on the quiz."),
  totalQuestions: z.number().describe("The total number of questions in the quiz."),
  questions: z.array(QuizQuestionSchema).describe("The list of questions from the quiz."),
});

// Input schema for the mistake analysis flow
const MistakeAnalysisInputSchema = z.object({
  quizHistory: z.array(QuizAttemptSchema).describe("An array of the user's past quiz attempts."),
});
export type MistakeAnalysisInput = z.infer<typeof MistakeAnalysisInputSchema>;

// Output schema for the mistake analysis flow
const MistakeAnalysisSchema = z.object({
  commonThemes: z.array(z.string()).describe("A list of common themes or types of mistakes identified across all quizzes."),
  conceptsToRevisit: z.array(z.string()).describe("A list of specific concepts or topics the student should review based on their mistakes."),
  studySuggestions: z
    .array(
      z.object({
        suggestion: z.string().describe("A concise, actionable study suggestion."),
        implementation: z.string().describe("A brief explanation of how to implement the suggestion."),
      })
    )
    .describe("A list of personalized study suggestions to help the student improve."),
});
export type MistakeAnalysis = z.infer<typeof MistakeAnalysisSchema>;

/**
 * Analyzes a user's quiz history to provide AI-powered feedback.
 * @param input - The user's quiz history.
 * @returns A promise that resolves to the mistake analysis.
 */
export async function analyzeMistakes(input: MistakeAnalysisInput): Promise<MistakeAnalysis> {
  return mistakeAnalyzerFlow(input);
}

// Handlebars 'ne' (not equal) helper
Handlebars.registerHelper('ne', function (a, b) {
  return a !== b;
});

// Define the Genkit prompt for the AI model
const mistakeAnalyzerPrompt = ai.definePrompt({
  name: "mistakeAnalyzerPrompt",
  input: { schema: MistakeAnalysisInputSchema },
  output: { schema: MistakeAnalysisSchema },
  prompt: `
    You are an expert academic advisor AI. Your goal is to analyze a student's quiz history to find patterns in their mistakes and provide actionable advice.
    Focus only on the questions the user answered incorrectly.

    Based on the provided quiz history, please generate the following:
    1.  **Common Themes**: Identify 2-3 high-level themes in the student's mistakes (e.g., "Misunderstanding of core definitions," "Difficulty with multi-step problems," "Confusion between similar concepts").
    2.  **Concepts to Revisit**: List the specific concepts or topics that the student is struggling with, based on their incorrect answers.
    3.  **Actionable Study Suggestions**: Provide a list of concrete, personalized study suggestions. For each suggestion, provide a brief implementation detail. For example: Suggestion: "Use flashcards for key terms.", Implementation: "Create a new flashcard for each bolded term in your textbook's chapter on Cellular Biology.".

    Here is the student's quiz history:
    {{#each quizHistory}}
    ---
    Quiz Topic: {{topic}}
    Score: {{score}}/{{totalQuestions}}

    Incorrect Answers:
    {{#each questions}}
    {{#if (ne userAnswer correctAnswer)}}
    - Question: "{{question}}"
      - Your Answer: "{{userAnswer}}"
      - Correct Answer: "{{correctAnswer}}"
    {{/if}}
    {{/each}}
    ---
    {{/each}}
  `,
});

// Define the Genkit flow
const mistakeAnalyzerFlow = ai.defineFlow(
  {
    name: "mistakeAnalyzerFlow",
    inputSchema: MistakeAnalysisInputSchema,
    outputSchema: MistakeAnalysisSchema,
  },
  async (input) => {
    // Filter out questions that were answered correctly to reduce prompt size
    const filteredHistory = input.quizHistory.map(quiz => ({
      ...quiz,
      questions: quiz.questions.filter(q => q.userAnswer !== q.correctAnswer),
    })).filter(quiz => quiz.questions.length > 0);
    
    if (filteredHistory.length === 0) {
        return {
            commonThemes: [],
            conceptsToRevisit: [],
            studySuggestions: []
        }
    }

    const { output } = await mistakeAnalyzerPrompt({ quizHistory: filteredHistory });
    return output!;
  }
);
