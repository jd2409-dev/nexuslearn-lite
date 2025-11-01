
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
    console.error("Gemini API key not found or not configured.");
    return NextResponse.json({ error: { message: "API key not found or not configured. Please set GEMINI_API_KEY in your .env file." } }, {
      status: 500,
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    return NextResponse.json({ text });

  } catch (error) {
    console.error("Failed to generate content:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: { message: "Failed to generate content from the AI model.", details: errorMessage } }, { 
        status: 500,
    });
  }
}
