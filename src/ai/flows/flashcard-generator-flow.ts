
"use server";
/**
 * @fileOverview An AI flow for generating flashcards from text.
 */

import { ai } from "@/ai/genkit";
import { FlashcardInputSchema, FlashcardOutputSchema, type FlashcardInput, type FlashcardOutput } from "@/ai/schemas/flashcard-schemas";
import * as pdfParse from "pdf-parse";


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
