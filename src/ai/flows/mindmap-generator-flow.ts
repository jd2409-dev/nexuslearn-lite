
"use server";
/**
 * @fileOverview An AI flow for generating mind maps from text.
 */

import { ai } from "@/ai/genkit";
import { MindMapInputSchema, MindMapOutputSchema, type MindMapInput, type MindMapOutput } from "@/ai/schemas/mindmap-schemas";
import { getPdfText } from "@/lib/pdf-utils";


/**
 * Main exported function to generate a mind map.
 * @param input - The source text and topic.
 * @returns A promise that resolves to the mind map data.
 */
export async function generateMindMap(input: MindMapInput): Promise<MindMapOutput> {
  return mindMapGeneratorFlow(input);
}

// Define the Genkit prompt
const mindMapPrompt = ai.definePrompt({
  name: "mindMapPrompt",
  model: 'googleai/gemini-2.5-flash',
  input: { schema: MindMapInputSchema },
  output: { schema: MindMapOutputSchema },
  prompt: `
    You are an expert at structuring information visually. Your task is to create a mind map from the provided text.
    The mind map should be in Mermaid JS 'graph' or 'mindmap' syntax.
    The central topic is "{{{topic}}}". Identify the main ideas and connect them to the central topic.
    Then, add supporting details and sub-topics branching out from the main ideas.
    Keep the nodes concise.

    Example of Mermaid 'graph' syntax:
    graph TD
        A[Central Topic] --> B(Main Idea 1);
        A --> C(Main Idea 2);
        B --> B1(Detail 1.1);
        B --> B2(Detail 1.2);

    Example of Mermaid 'mindmap' syntax:
    mindmap
      root((Central Topic))
        Main Idea 1
          Detail 1.1
          Detail 1.2
        Main Idea 2

    Now, generate a mind map for the following text:
    Source Text:
    {{{text}}}
  `,
});

// Define the Genkit flow
const mindMapGeneratorFlow = ai.defineFlow(
  {
    name: "mindMapGeneratorFlow",
    inputSchema: MindMapInputSchema,
    outputSchema: MindMapOutputSchema,
  },
  async (input) => {
    const { output } = await mindMapPrompt(input);
    return output!;
  }
);
