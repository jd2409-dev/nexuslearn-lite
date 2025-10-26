/**
 * @fileOverview Schemas and types for AI recommendations.
 */
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
