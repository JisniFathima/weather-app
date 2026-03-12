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

type TemperatureTheme = {
  gradient: string;
  cardBg: string;
  accent: string;
  accentMuted: string;
  label: string;
  labelName: string;
  /** Dark color for temperature number and card text - always readable on light card */
  cardText: string;
  cardTemp: string;
  /** Header text color - dark on light bg, light on dark bg */
  headerText: string;
  headerSubtext: string;
};

function getThemeForTemperature(temp: number): TemperatureTheme {
  if (temp < -5)
    return {
      gradient: "linear-gradient(165deg, #7dd3fc 0%, #38bdf8 40%, #0ea5e9 100%)",
      cardBg: "rgba(255, 255, 255, 0.94)",
      accent: "#0c4a6e",
      accentMuted: "rgba(14, 116, 144, 0.15)",
      label: "#0e7490",
      labelName: "Frigid",
      cardText: "#1e293b",
      cardTemp: "#0c4a6e",
      headerText: "#0c4a6e",
      headerSubtext: "#075985",
    };
  if (temp < 5)
    return {
      gradient: "linear-gradient(165deg, #67e8f9 0%, #22d3ee 45%, #06b6d4 100%)",
      cardBg: "rgba(255, 255, 255, 0.94)",
      accent: "#155e75",
      accentMuted: "rgba(21, 94, 117, 0.15)",
      label: "#0e7490",
      labelName: "Cold",
      cardText: "#1e293b",
      cardTemp: "#155e75",
      headerText: "#155e75",
      headerSubtext: "#0e7490",
    };
  if (temp < 15)
    return {
      gradient: "linear-gradient(165deg, #5eead4 0%, #2dd4bf 50%, #14b8a6 100%)",
      cardBg: "rgba(255, 255, 255, 0.94)",
      accent: "#0f766e",
      accentMuted: "rgba(15, 118, 110, 0.15)",
      label: "#115e59",
      labelName: "Cool",
      cardText: "#1e293b",
      cardTemp: "#0f766e",
      headerText: "#0f766e",
      headerSubtext: "#115e59",
    };
  if (temp < 22)
    return {
      gradient: "linear-gradient(165deg, #86efac 0%, #4ade80 45%, #22c55e 100%)",
      cardBg: "rgba(255, 255, 255, 0.94)",
      accent: "#166534",
      accentMuted: "rgba(22, 101, 52, 0.15)",
      label: "#15803d",
      labelName: "Mild",
      cardText: "#1e293b",
      cardTemp: "#166534",
      headerText: "#166534",
      headerSubtext: "#15803d",
    };
  if (temp < 28)
    return {
      gradient: "linear-gradient(165deg, #fde047 0%, #facc15 45%, #eab308 100%)",
      cardBg: "rgba(255, 255, 255, 0.94)",
      accent: "#a16207",
      accentMuted: "rgba(161, 98, 7, 0.15)",
      label: "#ca8a04",
      labelName: "Warm",
      cardText: "#1e293b",
      cardTemp: "#a16207",
      headerText: "#713f12",
      headerSubtext: "#a16207",
    };
  if (temp < 35)
    return {
      gradient: "linear-gradient(165deg, #fed7aa 0%, #fdba74 40%, #fb923c 100%)",
      cardBg: "rgba(255, 255, 255, 0.94)",
      accent: "#c2410c",
      accentMuted: "rgba(194, 65, 12, 0.15)",
      label: "#ea580c",
      labelName: "Hot",
      cardText: "#1e293b",
      cardTemp: "#c2410c",
      headerText: "#9a3412",
      headerSubtext: "#c2410c",
    };
  return {
    gradient: "linear-gradient(165deg, #fecaca 0%, #fca5a5 40%, #f87171 100%)",
    cardBg: "rgba(255, 255, 255, 0.94)",
    accent: "#b91c1c",
    accentMuted: "rgba(185, 28, 28, 0.15)",
    label: "#dc2626",
    labelName: "Very hot",
    cardText: "#1e293b",
    cardTemp: "#b91c1c",
    headerText: "#991b1b",
    headerSubtext: "#b91c1c",
  };
}

const defaultTheme: TemperatureTheme = {
  gradient: "linear-gradient(165deg, #a5b4fc 0%, #818cf8 45%, #6366f1 100%)",
  cardBg: "transparent",
  accent: "#4338ca",
  accentMuted: "rgba(67, 56, 202, 0.2)",
  label: "#6366f1",
  labelName: "",
  cardText: "#1e293b",
  cardTemp: "#4338ca",
  headerText: "#312e81",
  headerSubtext: "#4f46e5",
};

export default function WeatherContent() {
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [weather, setWeather] = useState<WeatherResult | null>(null);

  const theme = weather ? getThemeForTemperature(weather.temperature) : defaultTheme;

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
    <div
      className="min-h-screen transition-[background] duration-700 ease-out"
      style={{ background: theme.gradient }}
    >
      {/* Cloud design - soft cloud shapes in the background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Cloud 1 - top right */}
        <div className="absolute top-12 right-8 flex gap-0 opacity-40">
          <div className="w-16 h-12 rounded-full bg-white/95" />
          <div className="w-20 h-14 rounded-full bg-white/95 -ml-8 -mt-2" />
          <div className="w-14 h-10 rounded-full bg-white/95 -ml-6 mt-1" />
        </div>
        {/* Cloud 2 - middle left */}
        <div className="absolute top-1/3 left-4 flex gap-0 opacity-35">
          <div className="w-20 h-14 rounded-full bg-white/95" />
          <div className="w-24 h-16 rounded-full bg-white/95 -ml-10 -mt-2" />
          <div className="w-16 h-12 rounded-full bg-white/95 -ml-6 mt-1" />
        </div>
        {/* Cloud 3 - bottom right */}
        <div className="absolute bottom-24 right-12 flex gap-0 opacity-35">
          <div className="w-14 h-10 rounded-full bg-white/95" />
          <div className="w-[4.5rem] h-12 rounded-full bg-white/95 -ml-6 -mt-1" />
          <div className="w-12 h-8 rounded-full bg-white/95 -ml-4 mt-1" />
        </div>
        {/* Cloud 4 - top left */}
        <div className="absolute top-32 left-12 flex gap-0 opacity-30">
          <div className="w-12 h-8 rounded-full bg-white/95" />
          <div className="w-16 h-10 rounded-full bg-white/95 -ml-6 -mt-1" />
        </div>
        {/* Soft glow blobs (keep depth) */}
        <div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-25 blur-3xl"
          style={{ background: theme.accent }}
        />
        <div
          className="absolute top-1/2 -left-32 w-64 h-64 rounded-full opacity-20 blur-3xl"
          style={{ background: theme.accent }}
        />
      </div>

      <main className="relative max-w-md mx-auto px-5 py-14 sm:py-20">
        <div className="text-center mb-10">
          <h1
            className="text-2xl sm:text-3xl font-bold tracking-tight"
            style={{ color: theme.headerText }}
          >
            Weather by place
          </h1>
          <p
            className="mt-1.5 text-sm sm:text-base"
            style={{ color: theme.headerSubtext }}
          >
            Enter a country or city to see the temperature
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row gap-3 mb-8"
        >
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. France, Tokyo, London"
            className="flex-1 rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-md px-4 py-3.5 text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400 transition-all shadow-sm"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !location.trim()}
            className="rounded-2xl px-6 py-3.5 font-medium text-slate-800 bg-white/95 hover:bg-white border border-slate-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 focus:ring-offset-transparent"
          >
            {loading ? "Searching…" : "Search"}
          </button>
        </form>

        {error && (
          <div
            className="rounded-2xl border border-red-400/50 bg-red-950/40 backdrop-blur-md text-red-200 px-4 py-3 mb-6"
          >
            {error}
          </div>
        )}

        {weather && (
          <div
            className="rounded-3xl border border-black/10 backdrop-blur-xl overflow-hidden transition-all duration-500 shadow-2xl"
            style={{
              backgroundColor: theme.cardBg,
              boxShadow: `0 25px 50px -12px rgba(0,0,0,0.12), 0 0 0 1px ${theme.accentMuted}`,
            }}
          >
            <div className="px-6 pt-6 pb-2">
              <p
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: theme.cardTemp }}
              >
                {theme.labelName}
              </p>
              <h2 className="text-xl font-bold mt-0.5" style={{ color: theme.cardText }}>
                {weather.location.name}
                {weather.location.country &&
                  weather.location.name !== weather.location.country && (
                    <span className="font-normal opacity-80">
                      , {weather.location.country}
                    </span>
                  )}
              </h2>
            </div>
            <div className="px-6 py-8 text-center">
              <p
                className="text-7xl sm:text-8xl font-bold tabular-nums tracking-tighter"
                style={{ color: theme.cardTemp }}
              >
                {Math.round(weather.temperature)}
                <span className="text-4xl sm:text-5xl font-normal opacity-90">
                  {weather.unit}
                </span>
              </p>
              <p className="mt-2 text-sm font-medium" style={{ color: theme.cardText }}>
                Current temperature
              </p>
              <div
                className="mt-8 flex flex-wrap justify-center gap-8 text-sm border-t border-black/10 pt-6"
                style={{ color: theme.cardText }}
              >
                {weather.humidity != null && (
                  <span className="font-medium">
                    Humidity <span className="font-semibold opacity-90">{weather.humidity}%</span>
                  </span>
                )}
                {weather.wind_speed_kmh != null && (
                  <span className="font-medium">
                    Wind <span className="font-semibold opacity-90">{weather.wind_speed_kmh} km/h</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
