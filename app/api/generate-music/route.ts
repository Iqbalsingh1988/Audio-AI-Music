import { NextRequest, NextResponse } from "next/server";

// Vercel Serverless Function Timeout Ko 60 Second Tak Badhane Ke Liye
export const maxDuration = 60; 

export async function POST(req: NextRequest) {
  try {
    const { prompt, genre } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt likhna zaroori hai" },
        { status: 400 }
      );
    }

    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "HUGGINGFACE_API_KEY missing hai Vercel environment variables mein" },
        { status: 500 }
      );
    }

    const fullPrompt = `${genre || ''} ${prompt}`;

    const response = await fetch(
      "https://api-inference.huggingface.co/models/facebook/musicgen-small",
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "x-wait-for-model": "true",
        },
        method: "POST",
        body: JSON.stringify({ inputs: fullPrompt }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Hugging Face Error: ${errorText}` },
        { status: response.status }
      );
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString("base64");
    const audioUrl = `data:audio/flac;base64,${base64Audio}`;

    return NextResponse.json({ audioUrl });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Model boot ho raha hai, 10 sec baad dobara try karein." },
      { status: 500 }
    );
  }
}
