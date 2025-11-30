
import { z } from "zod";

// Input schema for the flow
export const MindMapInputSchema = z.object({
  text: z.string().describe("The source text to generate the mind map from."),
  topic: z.string().describe("The central topic of the mind map."),
});
export type MindMapInput = z.infer<typeof MindMapInputSchema>;

// Output schema for the flow
export const MindMapOutputSchema = z.object({
  mapData: z.string().describe("A mind map visualization in Mermaid JS graph syntax."),
});
export type MindMapOutput = z.infer<typeof MindMapOutputSchema>;
