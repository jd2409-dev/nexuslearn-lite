import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
    console.error("Gemini API key not found or not configured.");
    return new Response(JSON.stringify({ error: { message: "API key not found or not configured. Please set GEMINI_API_KEY in your .env file." } }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    return new Response(JSON.stringify({ text }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error("Failed to generate content:", error);
    return new Response(JSON.stringify({ error: { message: "Failed to generate content from the AI model." } }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' },
    });
  }
}
