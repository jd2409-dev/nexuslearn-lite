'use server';

/**
 * @fileOverview The main flow for the AI Tutor.
 */
import {ai} from '@/ai/genkit';
import {z} from 'zod';

export const askTutor = ai.defineFlow(
  {
    name: 'askTutor',
    inputSchema: z.object({
      history: z.array(z.any()),
      question: z.string(),
      topic: z.string(),
    }),
    outputSchema: z.string(),
    stream: true,
  },
  async (input) => {
    const {history, question, topic} = input;
    const {stream, response} = await ai.generate({
      prompt: [
        {
          role: 'system',
          content: `You are an expert tutor for a student in India. The student is studying ${topic}.

You will receive the chat history as a series of messages. And then you will receive the user's question.

Answer the user's question in a way that is helpful and encouraging.
          `,
        },
        ...history.map((m: any) => ({role: m.role, content: m.content})),
        {role: 'user', content: question},
      ],
      stream: true,
    });
    return stream;
  }
);
