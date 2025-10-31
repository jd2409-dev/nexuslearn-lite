/**
 * @fileOverview Provides personalized AI recommendations for learning.
 *
 * - getAiRecommendations - A function that generates personalized learning recommendations.
 */

import {ai} from '@/ai/client-genkit';
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
    let retries = 3;
    while (retries > 0) {
      try {
        const {output} = await recommendationsPrompt(input);
        return output!;
      } catch (e: any) {
        if (e.message.includes('503 Service Unavailable') && retries > 1) {
          retries--;
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retrying
        } else {
          throw e;
        }
      }
    }
    // This part should not be reachable if retries are configured
    // but it's here to satisfy TypeScript's need for a return path.
    throw new Error('Failed to get recommendations after multiple retries.');
  }
);
