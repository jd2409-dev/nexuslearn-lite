import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

async function getAiResponse(
  prompt: string
): Promise<string | { error: string; status: number }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
    console.error("Gemini API key is missing or not configured.");
    return {
      error:
        "The AI model is not configured. Please add the GEMINI_API_KEY to the .env file.",
      status: 500,
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = result.response;
    // This is the correct way to get the text response
    const text = response.text();
    return text;
  } catch (error: any) {
    console.error("Error generating content from Gemini:", error);
    let errorMessage = "Failed to generate content from the AI model.";
    if (error.message) {
      errorMessage += ` ${error.message}`;
    }
    return { error: errorMessage, status: 500 };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const aiResult = await getAiResponse(message);

    if (typeof aiResult === "object" && aiResult.error) {
      return NextResponse.json(
        { error: aiResult.error },
        { status: aiResult.status }
      );
    }

    return NextResponse.json({ reply: aiResult });
  } catch (error) {
    console.error("Error in POST /api/chat:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
