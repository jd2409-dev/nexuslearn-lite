"use server";
/**
 * @fileOverview An AI flow for generating a personalized study plan.
 *
 * This file defines a Genkit flow that takes a student's goal, subjects,
 * and timeframe to create a day-by-day study schedule.
 *
 * - generateStudyPlan - The main function to call the study plan generation flow.
 * - StudyPlanInput - The input type for the flow.
 * - StudyPlan - The structured output of the study plan.
 */

import { ai } from "@/ai/genkit";
import { z } from "zod";

// Input schema for the study plan generation flow
const StudyPlanInputSchema = z.object({
  goal: z.string().describe("The student's primary academic goal."),
  subjects: z.string().describe("A comma-separated list of subjects or topics to study."),
  timeframe: z.number().int().min(1).describe("The number of days the study plan should cover."),
});
export type StudyPlanInput = z.infer<typeof StudyPlanInputSchema>;

// Schema for a single day in the study plan
const DailyPlanSchema = z.object({
  day: z.number().int().describe("The day number of the plan (e.g., 1, 2, 3)."),
  topic: z.string().describe("The main topic or theme for the day."),
  focus: z.string().describe("A brief description of the key focus for the day's study session."),
  tasks: z.array(z.string()).describe("A list of specific, actionable tasks for the day."),
  estimatedTime: z.string().describe("An estimated time commitment for the day's tasks (e.g., '2-3 hours')."),
});

// Output schema for the study plan flow
const StudyPlanSchema = z.object({
  title: z.string().describe("A suitable title for the study plan."),
  goal: z.string().describe("The primary goal this plan is designed to achieve."),
  timeframe: z.number().int().describe("The total number of days in the plan."),
  dailyBreakdown: z.array(DailyPlanSchema).describe("A day-by-day breakdown of the study plan."),
});
export type StudyPlan = z.infer<typeof StudyPlanSchema>;

/**
 * Generates a personalized study plan based on user input.
 * @param input - The user's goals, subjects, and timeframe.
 * @returns A promise that resolves to a structured study plan.
 */
export async function generateStudyPlan(input: StudyPlanInput): Promise<StudyPlan> {
  return studyPlannerFlow(input);
}

// Define the Genkit prompt for the AI model
const studyPlannerPrompt = ai.definePrompt({
  name: "studyPlannerPrompt",
  input: { schema: StudyPlanInputSchema },
  output: { schema: StudyPlanSchema },
  prompt: `
    You are an expert academic planner AI. Your task is to create a detailed, day-by-day study plan for a student.
    The plan should be realistic, well-structured, and help the student achieve their goal within the given timeframe.

    Student's Goal: {{{goal}}}
    Subjects/Topics to Cover: {{{subjects}}}
    Total Timeframe: {{{timeframe}}} days

    Break down the subjects into manageable daily tasks. For each day, provide a clear topic, a focus, a list of tasks, and an estimated time commitment.
  `,
});

// Define the Genkit flow
const studyPlannerFlow = ai.defineFlow(
  {
    name: "studyPlannerFlow",
    inputSchema: StudyPlanInputSchema,
    outputSchema: StudyPlanSchema,
  },
  async (input) => {
    const { output } = await studyPlannerPrompt(input);
    // The flow should also return the original goal and timeframe
    return {
        ...output!,
        goal: input.goal,
        timeframe: input.timeframe,
    };
  }
);
