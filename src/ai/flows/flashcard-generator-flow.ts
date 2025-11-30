
"use server";
/**
 * @fileOverview An AI flow for generating flashcards from text.
 */

import { ai } from "@/ai/genkit";
import { z } from "zod";
import * as pdfParse from "pdf-parse";

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

/**
 * Converts PDF data URI to text.
 * @param pdfDataUri - The PDF file encoded as a data URI.
 * @returns The extracted text from the PDF.
 */
export async function getPdfText(pdfDataUri: string): Promise<string> {
    const pdfBuffer = Buffer.from(pdfDataUri.split(",")[1], "base64");
    const data = await pdfParse(pdfBuffer);
    return data.text;
}

/**
 * Main exported function to generate flashcards.
 * @param input - The source text.
 * @returns A promise that resolves to a set of flashcards.
 */
export async function generateFlashcards(input: FlashcardInput): Promise<FlashcardOutput> {
  return flashcardGeneratorFlow(input);
}

// Define the Genkit prompt
const flashcardPrompt = ai.definePrompt({
  name: "flashcardPrompt",
  model: 'googleai/gemini-2.5-flash',
  input: { schema: FlashcardInputSchema },
  output: { schema: FlashcardOutputSchema },
  prompt: `
    You are an expert at creating concise and effective study materials.
    Based on the following text, generate a set of flashcards. Each flashcard should have a clear question and a corresponding answer.
    Focus on key concepts, definitions, and important facts.

    Source Text:
    {{{text}}}
  `,
});

// Define the Genkit flow
const flashcardGeneratorFlow = ai.defineFlow(
  {
    name: "flashcardGeneratorFlow",
    inputSchema: FlashcardInputSchema,
    outputSchema: FlashcardOutputSchema,
  },
  async (input) => {
    const { output } = await flashcardPrompt(input);
    return output!;
  }
);

    