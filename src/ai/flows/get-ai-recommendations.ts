'use server';

/**
 * @fileOverview Provides personalized AI recommendations for learning.
 *
 * - getAiRecommendations - A function that generates personalized learning recommendations.
 */

import {ai} from '@/ai/genkit';
import {
  GetAiRecommendationsInputSchema,
  GetAiRecommendationsOutputSchema,
  type GetAiRecommendationsInput,
  type GetAiRecommendationsOutput,
} from '@/ai/schemas/recommendations';

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