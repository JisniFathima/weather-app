"use client";

import { useState } from "react";

type WeatherResult = {
  location: { name: string; country?: string; country_code?: string };
  temperature: number;
  unit: string;
  humidity?: number;
  weather_code?: number;
  wind_speed_kmh?: number;
};

export default function WeatherContent() {
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [weather, setWeather] = useState<WeatherResult | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const query = location.trim();
    if (!query) return;
    setError(null);
    setWeather(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/weather?location=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      setWeather(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-sky-200 dark:from-sky-950 dark:to-sky-900 text-zinc-900 dark:text-zinc-100 font-sans">
      <main className="max-w-lg mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-center mb-2 tracking-tight">
          Weather by Country or City
        </h1>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-10">
          Enter a country or city name to see the current temperature.
        </p>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-8">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. France, Tokyo, London"
            className="flex-1 rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-3 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !location.trim()}
            className="rounded-xl bg-sky-600 hover:bg-sky-700 disabled:bg-zinc-400 dark:disabled:bg-zinc-600 text-white font-medium px-6 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
          >
            {loading ? "Searching…" : "Get temperature"}
          </button>
        </form>

        {error && (
          <div className="rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {weather && (
          <div className="rounded-2xl bg-white/80 dark:bg-zinc-800/80 backdrop-blur border border-zinc-200 dark:border-zinc-700 shadow-xl overflow-hidden">
            <div className="bg-sky-500/20 dark:bg-sky-600/20 px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">
                {weather.location.country ?? weather.location.name}
              </p>
              <h2 className="text-2xl font-bold">
                {weather.location.name}
                {weather.location.country && weather.location.name !== weather.location.country && (
                  <span className="font-normal text-zinc-600 dark:text-zinc-400">, {weather.location.country}</span>
                )}
              </h2>
            </div>
            <div className="px-6 py-8 text-center">
              <p className="text-6xl font-bold text-sky-600 dark:text-sky-400 tabular-nums">
                {Math.round(weather.temperature)}{weather.unit}
              </p>
              <p className="mt-2 text-zinc-600 dark:text-zinc-400">Current temperature</p>
              <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm">
                {weather.humidity != null && (
                  <span>Humidity: {weather.humidity}%</span>
                )}
                {weather.wind_speed_kmh != null && (
                  <span>Wind: {weather.wind_speed_kmh} km/h</span>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
