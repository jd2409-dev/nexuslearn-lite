"use server";
/**
 * @fileOverview An AI flow for grading student essays.
 *
 * This file defines a Genkit flow that takes a student's essay as input and
 * returns a comprehensive evaluation, including a grade, strengths, areas for
 * improvement, detailed feedback, and a revised version of the essay.
 *
 * - gradeEssay - A function that orchestrates the essay grading process.
 * - GradeEssayInput - The input type for the gradeEssay function.
 * - GradeEssayOutput - The return type for the gradeEssay function.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";

// Input schema for the essay grading flow
const GradeEssayInputSchema = z.object({
  essay: z.string().describe("The full text of the student's essay to be graded."),
});
export type GradeEssayInput = z.infer<typeof GradeEssayInputSchema>;

// Output schema for the essay grading flow
const GradeEssayOutputSchema = z.object({
  grade: z.string().describe("The overall letter grade for the essay (e.g., A-, B+, C)."),
  strengths: z.array(z.string()).describe("A list of specific strengths of the essay."),
  areasForImprovement: z.array(z.string()).describe("A list of specific areas where the essay could be improved."),
  detailedFeedback: z.string().describe("A paragraph providing overall constructive feedback on the essay."),
  revisedEssay: z.string().describe("A revised version of the essay incorporating the suggested improvements."),
});
export type GradeEssayOutput = z.infer<typeof GradeEssayOutputSchema>;

/**
 * The main exported function that clients will call to grade an essay.
 * @param input - The essay text to be graded.
 * @returns A promise that resolves to the structured essay grade and feedback.
 */
export async function gradeEssay(input: GradeEssayInput): Promise<GradeEssayOutput> {
  return gradeEssayFlow(input);
}

// Define the Genkit prompt for the AI model
const essayGraderPrompt = ai.definePrompt({
  name: "essayGraderPrompt",
  input: { schema: GradeEssayInputSchema },
  output: { schema: GradeEssayOutputSchema },
  prompt: `
    You are an expert English teacher with a knack for providing clear, constructive feedback.
    Your task is to grade the following essay. Provide a fair letter grade and detailed feedback.

    Your feedback should be broken down into:
    1.  **Strengths**: What did the student do well? (e.g., "Clear thesis statement," "Strong use of evidence").
    2.  **Areas for Improvement**: What specific things could the student work on? (e.g., "Needs more textual evidence to support claims," "Transitions between paragraphs are abrupt").
    3.  **Detailed Feedback**: A comprehensive paragraph summarizing the essay's quality and offering actionable advice.
    4.  **Revised Essay**: A rewritten version of the essay that models the suggested improvements.

    Please grade the following essay:

    {{{essay}}}
  `,
});

// Define the Genkit flow that orchestrates the grading process
const gradeEssayFlow = ai.defineFlow(
  {
    name: "gradeEssayFlow",
    inputSchema: GradeEssayInputSchema,
    outputSchema: GradeEssayOutputSchema,
  },
  async (input) => {
    const { output } = await essayGraderPrompt(input);
    return output!;
  }
);
