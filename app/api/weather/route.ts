import { NextRequest, NextResponse } from "next/server";

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get("location")?.trim();

  if (!location || location.length < 2) {
    return NextResponse.json(
      { error: "Please provide a location (country or city name, at least 2 characters)." },
      { status: 400 }
    );
  }

  try {
    // 1. Geocode: get coordinates for the country/city
    const geoRes = await fetch(
      `${GEOCODING_URL}?name=${encodeURIComponent(location)}&count=1&language=en`
    );
    if (!geoRes.ok) {
      throw new Error("Geocoding request failed");
    }
    const geoData = (await geoRes.json()) as { results?: Array<{ latitude: number; longitude: number; name: string; country?: string; country_code?: string }> };
    const results = geoData.results;
    if (!results?.length) {
      return NextResponse.json(
        { error: `No location found for "${location}". Try a different country or city name.` },
        { status: 404 }
      );
    }

    const { latitude, longitude, name, country, country_code } = results[0];

    // 2. Fetch current weather for those coordinates
    const weatherRes = await fetch(
      `${WEATHER_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`
    );
    if (!weatherRes.ok) {
      throw new Error("Weather request failed");
    }
    const weatherData = (await weatherRes.json()) as {
      current?: {
        temperature_2m: number;
        relative_humidity_2m?: number;
        weather_code?: number;
        wind_speed_10m?: number;
      };
    };

    const current = weatherData.current;
    if (!current) {
      throw new Error("No current weather data");
    }

    return NextResponse.json({
      location: { name, country: country ?? undefined, country_code: country_code ?? undefined },
      temperature: current.temperature_2m,
      unit: "°C",
      humidity: current.relative_humidity_2m,
      weather_code: current.weather_code,
      wind_speed_kmh: current.wind_speed_10m,
    });
  } catch (err) {
    console.error("Weather API error:", err);
    return NextResponse.json(
      { error: "Unable to fetch weather. Please try again later." },
      { status: 500 }
    );
  }
}
