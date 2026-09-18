import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60; // Max duration for Vercel execution

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
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

    // Direct Inference call to Hugging Face MusicGen
    const response = await fetch(
      "https://api-inference.huggingface.co/models/facebook/musicgen-small",
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "x-wait-for-model": "true",
          "use_cache": "false"
        },
        method: "POST",
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 256 // Generation duration control for faster response
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      // Handle model loading state explicitly
      if (response.status === 503) {
        return NextResponse.json(
          { error: "Model load ho raha hai, 15 sec baad 'Generate' dabaein." },
          { status: 503 }
        );
      }
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
      { error: error.message || "Generation timeout" },
      { status: 500 }
    );
  }
}
