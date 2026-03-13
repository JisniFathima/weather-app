"use client";

import { useState, useEffect } from "react";

type ColorMode = "light" | "dark";

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

const defaultThemeLight: TemperatureTheme = {
  gradient: "linear-gradient(165deg, #eef2ff 0%, #e0e7ff 40%, #c7d2fe 100%)",
  cardBg: "transparent",
  accent: "#4f46e5",
  accentMuted: "rgba(79, 70, 229, 0.15)",
  label: "#6366f1",
  labelName: "",
  cardText: "#1e293b",
  cardTemp: "#4338ca",
  headerText: "#3730a3",
  headerSubtext: "#4f46e5",
};

const defaultThemeDark: TemperatureTheme = {
  gradient: "linear-gradient(165deg, #4c1d95 0%, #5b21b6 45%, #6d28d9 100%)",
  cardBg: "transparent",
  accent: "#a78bfa",
  accentMuted: "rgba(167, 139, 250, 0.2)",
  label: "#c4b5fd",
  labelName: "",
  cardText: "#e9d5ff",
  cardTemp: "#a78bfa",
  headerText: "#e9d5ff",
  headerSubtext: "#c4b5fd",
};

type ApiResponse = WeatherResult | { emirates: WeatherResult[] };

function getStoredColorMode(): ColorMode {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem("weather-app-color-mode") as ColorMode | null;
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function WeatherContent() {
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [weather, setWeather] = useState<WeatherResult | null>(null);
  const [emirates, setEmirates] = useState<WeatherResult[] | null>(null);
  const [colorMode, setColorMode] = useState<ColorMode>("light");

  // Sync with script in layout: read saved theme as soon as we're on client
  useEffect(() => {
    setColorMode(getStoredColorMode());
  }, []);

  // Persist choice and keep html class in sync for next load
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("weather-app-color-mode", colorMode);
    if (colorMode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [colorMode]);

  const defaultTheme = colorMode === "dark" ? defaultThemeDark : defaultThemeLight;
  const theme = weather
    ? getThemeForTemperature(weather.temperature)
    : emirates?.length
      ? getThemeForTemperature(
          emirates.reduce((a, b) => a + b.temperature, 0) / emirates.length
        )
      : defaultTheme;
  const isDefaultState = !weather && !emirates?.length;
  // When dark mode and no result, always use dark gradient so toggle works reliably
  const backgroundGradient = isDefaultState && colorMode === "dark" ? defaultThemeDark.gradient : theme.gradient;

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const query = location.trim();
    if (!query) return;
    setError(null);
    setWeather(null);
    setEmirates(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/weather?location=${encodeURIComponent(query)}`);
      const data: ApiResponse = await res.json();
      if (!res.ok) {
        setError((data as { error?: string }).error ?? "Something went wrong");
        return;
      }
      if ("emirates" in data && Array.isArray(data.emirates)) {
        setEmirates(data.emirates);
      } else {
        setWeather(data as WeatherResult);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const toggleColorMode = () => {
    setColorMode((m) => (m === "light" ? "dark" : "light"));
  };

  return (
    <div
      className="min-h-screen transition-[background] duration-700 ease-out flex flex-col"
      style={{ background: backgroundGradient }}
      data-color-mode={colorMode}
    >
      {/* Light/Dark mode toggle - top right */}
      <div className="relative z-10 flex justify-end px-4 pt-4 sm:px-6 sm:pt-6">
        <button
          type="button"
          onClick={toggleColorMode}
          className="rounded-xl p-2.5 border shadow-sm transition-all hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent"
          style={{
            color: theme.headerText,
            borderColor: colorMode === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)",
            backgroundColor: colorMode === "dark" ? "rgba(30, 27, 75, 0.8)" : "rgba(255,255,255,0.9)",
          }}
          aria-label={colorMode === "light" ? "Switch to dark mode" : "Switch to light mode"}
        >
          {colorMode === "light" ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )}
        </button>
      </div>

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

      <main
        className={`relative mx-auto px-4 sm:px-6 py-8 sm:py-10 ${emirates?.length ? "max-w-6xl" : "max-w-md"}`}
      >
        <div className="text-center mb-6 sm:mb-8">
          <h1
            className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight"
            style={{ color: theme.headerText }}
          >
            {emirates?.length ? "UAE – City wise weather update" : "Weather by place"}
          </h1>
          <p
            className="mt-1 sm:mt-1.5 text-sm sm:text-base"
            style={{ color: theme.headerSubtext }}
          >
            {emirates?.length
              ? "Current weather across the 7 emirates"
              : "Enter a country or city to see the temperature"}
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row gap-3 mb-6 sm:mb-8 max-w-2xl mx-auto"
        >
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. UAE, France, Tokyo, London"
            className={`flex-1 rounded-2xl border backdrop-blur-md px-4 py-3.5 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent placeholder-slate-500 ${
              colorMode === "dark" && isDefaultState ? "placeholder-violet-300" : ""
            }`}
            style={
              colorMode === "dark" && isDefaultState
                ? {
                    borderColor: "rgba(255,255,255,0.2)",
                    backgroundColor: "rgba(30, 27, 75, 0.9)",
                    color: "#e9d5ff",
                  }
                : {
                    borderColor: "var(--tw-border-color, #e2e8f0)",
                    backgroundColor: "rgba(255,255,255,0.95)",
                    color: "#1e293b",
                  }
            }
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !location.trim()}
            className="rounded-2xl px-6 py-3.5 font-medium border shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent"
            style={
              colorMode === "dark" && isDefaultState
                ? {
                    borderColor: "rgba(255,255,255,0.2)",
                    backgroundColor: "rgba(30, 27, 75, 0.9)",
                    color: "#e9d5ff",
                }
                : {
                    borderColor: "#e2e8f0",
                    backgroundColor: "rgba(255,255,255,0.95)",
                    color: "#1e293b",
                }
            }
          >
            {loading ? "Searching…" : "Search"}
          </button>
        </form>

        {error && (
          <div className="rounded-2xl border border-red-400/50 bg-red-950/40 backdrop-blur-md text-red-200 px-4 py-3 mb-6 max-w-2xl mx-auto">
            {error}
          </div>
        )}

        {isDefaultState && !error && (
          <p
            className="text-center text-sm max-w-md mx-auto mb-6 opacity-80"
            style={{ color: theme.headerSubtext }}
          >
            Try &quot;UAE&quot; for all 7 emirates, or any city like Paris, Tokyo, London.
          </p>
        )}

        {emirates && emirates.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 pb-6">
            {emirates.map((item) => {
              const cardTheme = getThemeForTemperature(item.temperature);
              return (
                <div
                  key={item.location.name}
                  className="rounded-2xl border border-black/10 backdrop-blur-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl"
                  style={{
                    backgroundColor: cardTheme.cardBg,
                    boxShadow: `0 10px 30px -10px rgba(0,0,0,0.1), 0 0 0 1px ${cardTheme.accentMuted}`,
                  }}
                >
                  <div className="px-4 pt-4 pb-2">
                    <h3
                      className="text-base sm:text-lg font-bold truncate"
                      style={{ color: cardTheme.cardText }}
                    >
                      {item.location.name}
                    </h3>
                  </div>
                  <div className="px-4 pb-4 text-center">
                    <p
                      className="text-3xl sm:text-4xl font-bold tabular-nums"
                      style={{ color: cardTheme.cardTemp }}
                    >
                      {Math.round(item.temperature)}
                      <span className="text-lg sm:text-xl font-normal opacity-90">
                        {item.unit}
                      </span>
                    </p>
                    <div
                      className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs sm:text-sm border-t border-black/10 pt-3"
                      style={{ color: cardTheme.cardText }}
                    >
                      {item.humidity != null && (
                        <span>
                          Humidity <span className="font-semibold">{item.humidity}%</span>
                        </span>
                      )}
                      {item.wind_speed_kmh != null && (
                        <span>
                          Wind <span className="font-semibold">{item.wind_speed_kmh} km/h</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {weather && !emirates?.length && (
          <div
            className="rounded-3xl border border-black/10 backdrop-blur-xl overflow-hidden transition-all duration-500 shadow-2xl max-w-md mx-auto"
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

      {/* Weather-based images strip at bottom - fills empty space, adapts to light/dark */}
      <footer className="relative mt-auto pt-8 pb-6 px-4">
        <div
          className="max-w-4xl mx-auto flex flex-wrap justify-center items-end gap-8 sm:gap-12 opacity-90"
          style={{ color: isDefaultState ? theme.headerText : theme.cardTemp }}
        >
          <div className="flex flex-col items-center gap-1" title="Temperature">
            <svg className="w-10 h-10 sm:w-12 sm:h-12 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
            </svg>
            <span className="text-xs font-medium opacity-70">Temp</span>
          </div>
          <div className="flex flex-col items-center gap-1" title="Sun">
            <svg className="w-10 h-10 sm:w-12 sm:h-12 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
            <span className="text-xs font-medium opacity-70">Sun</span>
          </div>
          <div className="flex flex-col items-center gap-1" title="Cloud">
            <svg className="w-10 h-10 sm:w-12 sm:h-12 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
            </svg>
            <span className="text-xs font-medium opacity-70">Cloud</span>
          </div>
          <div className="flex flex-col items-center gap-1" title="Wind">
            <svg className="w-10 h-10 sm:w-12 sm:h-12 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2 2 0 1 1 19 4H2.5m0 15.5H2" />
            </svg>
            <span className="text-xs font-medium opacity-70">Wind</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
