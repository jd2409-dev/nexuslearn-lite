
/**
 * @fileOverview Generates a personalized study plan for a student.
 *
 * - generateStudyPlan - A function that creates a study plan based on user inputs.
 * - GenerateStudyPlanInput - The input type for the generateStudyPlan function.
 * - GenerateStudyPlanOutput - The return type for the generateStudyPlan function.
 */

import {ai} from '@/ai/client-genkit';
import {z} from 'genkit';

const GenerateStudyPlanInputSchema = z.object({
  grade: z.string().describe("The student's grade level (e.g., '10th Grade')."),
  examDate: z.string().describe('The date of the exam (e.g., YYYY-MM-DD).'),
  currentDate: z.string().describe('The current date (e.g., YYYY-MM-DD).'),
  topic: z.string().describe('The topic, subject, or syllabus to be covered.'),
  studyHoursPerDay: z.number().describe('The number of hours the student can study per day.'),
});
export type GenerateStudyPlanInput = z.infer<typeof GenerateStudyPlanInputSchema>;

const GenerateStudyPlanOutputSchema = z.object({
  studyPlan: z.string().describe('The detailed, day-by-day study plan in Markdown format.'),
});
export type GenerateStudyPlanOutput = z.infer<typeof GenerateStudyPlanOutputSchema>;

export async function generateStudyPlan(input: GenerateStudyPlanInput): Promise<GenerateStudyPlanOutput> {
  return generateStudyPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStudyPlanPrompt',
  input: {schema: GenerateStudyPlanInputSchema},
  output: {schema: GenerateStudyPlanOutputSchema},
  prompt: `You are an expert academic planner. Create a detailed, actionable, day-by-day study plan for a student.

Student Profile:
- Grade: {{{grade}}}
- Topic/Syllabus: {{{topic}}}
- Daily Study Commitment: {{{studyHoursPerDay}}} hours
- Timeframe: From {{{currentDate}}} to {{{examDate}}}

Your task is to generate a realistic and well-structured study plan.
- Break down the topic into smaller, manageable sub-topics.
- Allocate time for each sub-topic, including revision sessions and practice tests.
- Structure the output in Markdown format. Use headings for weeks or days, and bullet points for specific tasks.
- Make the plan encouraging and motivating.

Generate the study plan now.`,
});

const generateStudyPlanFlow = ai.defineFlow(
  {
    name: 'generateStudyPlanFlow',
    inputSchema: GenerateStudyPlanInputSchema,
    outputSchema: GenerateStudyPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
