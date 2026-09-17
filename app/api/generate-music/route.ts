import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt, lyrics, genre, duration } = await req.json();

    const response = await fetch("https://fal.run/fal-ai/minimax-music", {
      method: "POST",
      headers: {
        "Authorization": `Key ${process.env.FAL_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: `${genre}: ${prompt}`,
        lyrics: lyrics || undefined,
        audio_duration: duration,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.detail || "API Connection Error" }, { status: 500 });
    }

    return NextResponse.json({ audioUrl: data.audio.url });

  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
