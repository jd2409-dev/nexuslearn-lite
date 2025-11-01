
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Function to handle the Gemini API call with robust error handling
async function getGeminiResponse(prompt: string, apiKey: string) {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Re-throw a more specific error to be caught by the POST handler
    if (error instanceof Error) {
        throw new Error(`Failed to generate content from the AI model: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the AI model.");
  }
}

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;

  // 1. Explicitly check for the API key first.
  if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
    console.error("Gemini API key not found or not configured.");
    return NextResponse.json(
        { error: "API key not found or not configured. Please set GEMINI_API_KEY in your .env file." },
        { status: 500 }
    );
  }

  try {
    const { prompt } = await req.json();

    if (!prompt) {
        return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
    }
    
    // 2. Call the isolated function and await its result.
    const text = await getGeminiResponse(prompt, apiKey);
    
    // 3. Return the successful response.
    return NextResponse.json({ text });

  } catch (error) {
    // 4. Catch any error from getGeminiResponse or req.json() and return a detailed message.
    console.error("API Route Error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
    );
  }
}
