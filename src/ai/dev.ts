'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-quiz-from-topic.ts';
import '@/ai/flows/receive-personalized-study-suggestions.ts';
import '@/ai/flows/get-ai-assistance-with-homework.ts';
import '@/ai/flows/receive-ai-powered-feedback-on-quiz.ts';
import '@/ai/flows/get-ai-recommendations.ts';
import '@/ai/flows/grade-essay.ts';
