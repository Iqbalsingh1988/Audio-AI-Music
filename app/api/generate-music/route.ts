import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60; // Max timeout extend karta hai Vercel par

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt likhna zaroori hai" },
        { status: 400 }
      );
    }

    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "HUGGINGFACE_API_KEY Missing in Vercel" },
        { status: 500 }
      );
    }

    // Direct call with retry parameter
    const response = await fetch(
      "https://api-inference.huggingface.co/models/facebook/musicgen-small",
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "x-wait-for-model": "true"
        },
        method: "POST",
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 256 // Fast audio generation ke liye
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `API Error: ${errorText}` },
        { status: response.status }
      );
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString("base64");
    const audioUrl = `data:audio/wav;base64,${base64Audio}`;

    return NextResponse.json({ audioUrl });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Network timeout. Kripya 10 second baad dubara 'Generate' dabayein." },
      { status: 500 }
    );
  }
}
