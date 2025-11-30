
import { z } from "zod";

// Schema for a single flashcard
const FlashcardSchema = z.object({
  question: z.string().describe("The question or term for the front of the flashcard."),
  answer: z.string().describe("The answer or definition for the back of the flashcard."),
});

// Input schema for the flow
export const FlashcardInputSchema = z.object({
  text: z.string().describe("The source text to generate flashcards from."),
});
export type FlashcardInput = z.infer<typeof FlashcardInputSchema>;

// Output schema for the flow
export const FlashcardOutputSchema = z.object({
  cards: z.array(FlashcardSchema),
});
export type FlashcardOutput = z.infer<typeof FlashcardOutputSchema>;
