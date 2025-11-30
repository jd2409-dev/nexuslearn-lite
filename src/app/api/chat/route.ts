
import { ai } from "@/ai/genkit";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
    }

    // Use Genkit to generate the content, ensuring consistency with other AI flows.
    const { text } = await ai.generate({
      model: 'googleai/gemini-2.5-flash', // Explicitly define the model
      prompt: prompt,
    });

    return NextResponse.json({ text });

  } catch (error) {
    console.error("API Route Error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json(
      { error: `Failed to get AI response: ${errorMessage}` },
      { status: 500 }
    );
  }
}
