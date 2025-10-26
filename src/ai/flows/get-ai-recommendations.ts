'use server';

/**
 * @fileOverview Provides personalized AI recommendations for learning.
 *
 * - getAiRecommendations - A function that generates personalized learning recommendations.
 * - GetAiRecommendationsInput - The input type for the getAiRecommendations function.
 * - GetAiRecommendationsOutput - The return type for the getAiRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const GetAiRecommendationsInputSchema = z.object({
  studentGrade: z.string().describe('The grade of the student.'),
  studentBoard: z.string().describe('The educational board of the student (e.g., CBSE, ICSE).'),
  recentPerformance: z.string().describe('A summary of the student\'s recent performance (e.g., "strong in Algebra, weak in Geometry").'),
});
export type GetAiRecommendationsInput = z.infer<typeof GetAiRecommendationsInputSchema>;

const RecommendationSchema = z.object({
  type: z.enum(['review', 'practice', 'focus']).describe('The type of recommendation.'),
  title: z.string().describe('A short, actionable title for the recommendation.'),
  reason: z.string().describe('A brief explanation of why this is being recommended.'),
});

export const GetAiRecommendationsOutputSchema = z.object({
  recommendations: z.array(RecommendationSchema).describe('A list of 3 personalized learning recommendations.'),
});
export type GetAiRecommendationsOutput = z.infer<typeof GetAiRecommendationsOutputSchema>;


export async function getAiRecommendations(
  input: GetAiRecommendationsInput
): Promise<GetAiRecommendationsOutput> {
  return getAiRecommendationsFlow(input);
}

const recommendationsPrompt = ai.definePrompt({
  name: 'getAiRecommendationsPrompt',
  input: {schema: GetAiRecommendationsInputSchema},
  output: {schema: GetAiRecommendationsOutputSchema},
  prompt: `You are an AI learning assistant. Your goal is to provide 3 concise, actionable, and personalized learning recommendations for a student.

Student Profile:
- Grade: {{{studentGrade}}}
- Board: {{{studentBoard}}}
- Recent Performance: {{{recentPerformance}}}

Based on this profile, generate exactly 3 recommendations. Each recommendation must have a 'type' ('review', 'practice', or 'focus'), a short 'title', and a brief 'reason'.
- 'review': Suggest reviewing a specific topic where they seem weak.
- 'practice': Suggest taking a practice quiz or solving problems on a certain subject.
- 'focus': Suggest using a study technique, like a Pomodoro session, for a particular area.

Example Output:
[
  { "type": "review", "title": "Review 'Cellular Respiration'", "reason": "Your quiz scores indicate a weak area here." },
  { "type": "focus", "title": "Try a 45-min Pomodoro session", "reason": "To improve focus on Physics numericals." },
  { "type": "practice", "title": "Take a 5-mark question quiz", "reason": "To practice long-form answers in History." }
]

Generate the recommendations now.`,
});

const getAiRecommendationsFlow = ai.defineFlow(
  {
    name: 'getAiRecommendationsFlow',
    inputSchema: GetAiRecommendationsInputSchema,
    outputSchema: GetAiRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await recommendationsPrompt(input);
    return output!;
  }
);
