import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Call Hugging Face MusicGen Free Inference API
    const response = await fetch(
      "https://api-inference.huggingface.co/models/facebook/musicgen-small",
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ inputs: prompt }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Hugging Face API Error: ${errorText}` },
        { status: response.status }
      );
    }

    // Convert audio binary buffer to Base64 data URL
    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString("base64");
    const audioUrl = `data:audio/flac;base64,${base64Audio}`;

    return NextResponse.json({ audioUrl });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to generate music" },
      { status: 500 }
    );
  }
}
