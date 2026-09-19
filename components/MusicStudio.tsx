"use client";
import React, { useState, useRef } from 'react';

export default function MusicStudio() {
  const [prompt, setPrompt] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [genre, setGenre] = useState('Punjabi Bhangra Pop');
  const [duration, setDuration] = useState(210);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleGenerate = async () => {
    if (!prompt) {
      alert("Kripya koi Prompt darj karein!");
      return;
    }

    setIsGenerating(true);
    setAudioUrl(null);

    try {
      const apiKey = process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY;

      if (!apiKey) {
        alert("NEXT_PUBLIC_HUGGINGFACE_API_KEY missing hai Vercel environment variables mein!");
        setIsGenerating(false);
        return;
      }

      // Combining prompt and genre for best AI audio output
      const fullPrompt = `${genre} style: ${prompt}`;

      // Direct Hugging Face Client-side API Call to bypass Vercel 10s Timeout
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
        alert("Audio generate karne mein dikkat aayi: " + errorText);
        return;
      }

      const audioBuffer = await response.arrayBuffer();
      const base64Audio = Buffer.from(audioBuffer).toString("base64");
      const generatedAudioUrl = `data:audio/flac;base64,${base64Audio}`;

      setAudioUrl(generatedAudioUrl);
    } catch (err: any) {
      console.error(err);
      alert("Network Error! Please try again: " + (err.message || err));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12 flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-4xl bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-xl font-bold">
              🎵
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">SonicStudio AI</h1>
              <p className="text-xs text-slate-400">Pro 3-4 Min Music Engine</p>
            </div>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">Music Style / Prompt</label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Energetic Punjabi Drill beat with heavy bass, synth melodies..."
                className="w-full h-32 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">Genre</label>
              <select 
                value={genre} 
                onChange={(e) => setGenre(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="Punjabi Bhangra Pop">Punjabi Bhangra Pop</option>
                <option value="Punjabi Drill">Punjabi Drill</option>
                <option value="Sad Trap Soul">Sad Trap Soul</option>
                <option value="Romantic Pop">Romantic Pop</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">Custom Lyrics (Optional)</label>
              <textarea 
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                placeholder="Paste your song lyrics here..."
                className="w-full h-48 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 resize-none font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Duration Slider */}
        <div className="mb-8 bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-300">⚙️ Song Duration</span>
            <span className="text-sm font-bold text-indigo-400">{Math.floor(duration / 60)}m {duration % 60}s</span>
          </div>
          <input 
            type="range" 
            min="60" 
            max="300" 
            step="15" 
            value={duration} 
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
        </div>

        {/* Generate Button */}
        <button 
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isGenerating ? "✨ Generating Track (1-2 Mins)..." : "⚡ Generate High-Quality Song"}
        </button>

        {/* Output Player */}
        {audioUrl && (
          <div className="mt-8 bg-slate-950 p-6 rounded-2xl border border-indigo-500/40">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">🎶 Generated Track Preview</h3>
            <audio ref={audioRef} controls src={audioUrl} autoPlay className="w-full mb-4" />
            <a 
              href={audioUrl} 
              download="ai-song.flac" 
              className="inline-block text-xs font-semibold px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-200"
            >
              ⬇️ Download Track
            </a>
          </div>
        )}

      </div>
    </div>
  );
}
