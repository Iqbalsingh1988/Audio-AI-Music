import { NextRequest, NextResponse } from "next/server";

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
        { error: "HUGGINGFACE_API_KEY missing hai" },
        { status: 500 }
      );
    }

    const fullPrompt = `${genre || ''} ${prompt}`;

    // Standard Hugging Face Inference API call with retry flag
    const response = await fetch(
      "https://api-inference.huggingface.co/models/facebook/musicgen-small",
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: fullPrompt,
          options: {
            wait_for_model: true,
            use_cache: false
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      // Handle model loading error gracefully
      if (response.status === 503) {
        return NextResponse.json(
          { error: "Model load hone mein time lag raha hai. 15 second baad firse Generate dabayein." },
          { status: 503 }
        );
      }
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
      { error: "Connection break ho gaya, kripya dobara try karein." },
      { status: 500 }
    );
  }
}
