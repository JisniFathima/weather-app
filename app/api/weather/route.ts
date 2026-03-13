import { NextRequest, NextResponse } from "next/server";

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";

const UAE_EMIRATES = [
  "Abu Dhabi",
  "Dubai",
  "Sharjah",
  "Ajman",
  "Umm Al Quwain",
  "Ras Al Khaimah",
  "Fujairah",
];

type GeoResult = {
  latitude: number;
  longitude: number;
  name: string;
  country?: string;
  country_code?: string;
  feature_code?: string;
};

// For country search: use multiple cities and average for representative temperature (matches Google-style)
const COUNTRY_CITIES: Record<string, string[]> = {
  IN: ["New Delhi", "Mumbai", "Kolkata", "Chennai", "Bengaluru"],
  US: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"],
  CN: ["Beijing", "Shanghai", "Guangzhou", "Shenzhen", "Chengdu"],
  BR: ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Fortaleza"],
  AU: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide"],
  RU: ["Moscow", "Saint Petersburg", "Novosibirsk", "Yekaterinburg", "Kazan"],
  JP: ["Tokyo", "Osaka", "Nagoya", "Sapporo", "Fukuoka"],
  DE: ["Berlin", "Munich", "Hamburg", "Cologne", "Frankfurt"],
  GB: ["London", "Birmingham", "Manchester", "Leeds", "Glasgow"],
  FR: ["Paris", "Marseille", "Lyon", "Toulouse", "Nice"],
  CA: ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa"],
  IT: ["Rome", "Milan", "Naples", "Turin", "Florence"],
  ES: ["Madrid", "Barcelona", "Valencia", "Seville", "Bilbao"],
  MX: ["Mexico City", "Guadalajara", "Monterrey", "Puebla", "Tijuana"],
  ID: ["Jakarta", "Surabaya", "Bandung", "Medan", "Semarang"],
  PK: ["Karachi", "Lahore", "Islamabad", "Faisalabad", "Rawalpindi"],
  BD: ["Dhaka", "Chittagong", "Khulna", "Rajshahi", "Sylhet"],
  NG: ["Lagos", "Abuja", "Kano", "Ibadan", "Port Harcourt"],
  EG: ["Cairo", "Alexandria", "Giza", "Sharm El Sheikh", "Luxor"],
  ZA: ["Johannesburg", "Cape Town", "Durban", "Pretoria", "Port Elizabeth"],
  TR: ["Istanbul", "Ankara", "Izmir", "Bursa", "Antalya"],
  TH: ["Bangkok", "Chiang Mai", "Phuket", "Khon Kaen", "Udon Thani"],
  VN: ["Ho Chi Minh City", "Hanoi", "Da Nang", "Can Tho", "Haiphong"],
  PL: ["Warsaw", "Kraków", "Łódź", "Wrocław", "Poznań"],
  SA: ["Riyadh", "Jeddah", "Mecca", "Medina", "Dammam"],
  AR: ["Buenos Aires", "Córdoba", "Rosario", "Mendoza", "La Plata"],
  CO: ["Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena"],
  MY: ["Kuala Lumpur", "George Town", "Johor Bahru", "Ipoh", "Kuching"],
  RO: ["Bucharest", "Cluj-Napoca", "Timișoara", "Iași", "Constanța"],
  NL: ["Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven"],
  BE: ["Brussels", "Antwerp", "Ghent", "Charleroi", "Liège"],
  GR: ["Athens", "Thessaloniki", "Patras", "Heraklion", "Larissa"],
  PT: ["Lisbon", "Porto", "Amadora", "Braga", "Coimbra"],
  CZ: ["Prague", "Brno", "Ostrava", "Pilsen", "Liberec"],
  HU: ["Budapest", "Debrecen", "Szeged", "Miskolc", "Pécs"],
  SE: ["Stockholm", "Gothenburg", "Malmö", "Uppsala", "Västerås"],
  NO: ["Oslo", "Bergen", "Trondheim", "Stavanger", "Drammen"],
  DK: ["Copenhagen", "Aarhus", "Odense", "Aalborg", "Frederiksberg"],
  FI: ["Helsinki", "Espoo", "Tampere", "Vantaa", "Oulu"],
};

// Fallback: capital only (for countries not in COUNTRY_CITIES)
const COUNTRY_CAPITALS: Record<string, string> = {
  IN: "New Delhi", AF: "Kabul", AL: "Tirana", DZ: "Algiers", AD: "Andorra la Vella",
  AO: "Luanda", AG: "Saint John's", AR: "Buenos Aires", AM: "Yerevan", AU: "Canberra",
  AT: "Vienna", AZ: "Baku", BH: "Manama", BD: "Dhaka", BB: "Bridgetown", BY: "Minsk",
  BE: "Brussels", BZ: "Belmopan", BJ: "Porto-Novo", BT: "Thimphu", BO: "Sucre",
  BA: "Sarajevo", BW: "Gaborone", BR: "Brasília", BN: "Bandar Seri Begawan", BG: "Sofia",
  BF: "Ouagadougou", BI: "Gitega", KH: "Phnom Penh", CM: "Yaoundé", CA: "Ottawa",
  CV: "Praia", CF: "Bangui", TD: "N'Djamena", CL: "Santiago", CN: "Beijing", CO: "Bogotá",
  KM: "Moroni", CG: "Brazzaville", CD: "Kinshasa", CR: "San José", CI: "Yamoussoukro",
  HR: "Zagreb", CU: "Havana", CY: "Nicosia", CZ: "Prague", DK: "Copenhagen",
  DJ: "Djibouti", DO: "Santo Domingo", EC: "Quito", EG: "Cairo", SV: "San Salvador",
  GQ: "Malabo", ER: "Asmara", EE: "Tallinn", SZ: "Mbabane", ET: "Addis Ababa",
  FJ: "Suva", FI: "Helsinki", FR: "Paris", GA: "Libreville", GM: "Banjul", GE: "Tbilisi",
  DE: "Berlin", GH: "Accra", GR: "Athens", GT: "Guatemala City", GN: "Conakry",
  GW: "Bissau", GY: "Georgetown", HT: "Port-au-Prince", HN: "Tegucigalpa", HU: "Budapest",
  IS: "Reykjavik", ID: "Jakarta", IR: "Tehran", IQ: "Baghdad", IE: "Dublin", IL: "Jerusalem",
  IT: "Rome", JM: "Kingston", JP: "Tokyo", JO: "Amman", KZ: "Astana", KE: "Nairobi",
  KI: "Tarawa", KP: "Pyongyang", KR: "Seoul", KW: "Kuwait City", KG: "Bishkek",
  LA: "Vientiane", LV: "Riga", LB: "Beirut", LS: "Maseru", LR: "Monrovia", LY: "Tripoli",
  LI: "Vaduz", LT: "Vilnius", LU: "Luxembourg", MG: "Antananarivo", MW: "Lilongwe",
  MY: "Kuala Lumpur", MV: "Malé", ML: "Bamako", MT: "Valletta", MH: "Majuro", MR: "Nouakchott",
  MU: "Port Louis", MX: "Mexico City", FM: "Palikir", MD: "Chișinău", MC: "Monaco",
  MN: "Ulaanbaatar", ME: "Podgorica", MA: "Rabat", MZ: "Maputo", MM: "Naypyidaw",
  NA: "Windhoek", NR: "Yaren", NP: "Kathmandu", NL: "Amsterdam", NZ: "Wellington",
  NI: "Managua", NE: "Niamey", NG: "Abuja", MK: "Skopje", NO: "Oslo", OM: "Muscat",
  PK: "Islamabad", PW: "Ngerulmud", PA: "Panama City", PG: "Port Moresby", PY: "Asunción",
  PE: "Lima", PH: "Manila", PL: "Warsaw", PT: "Lisbon", QA: "Doha", RO: "Bucharest",
  RU: "Moscow", RW: "Kigali", KN: "Basseterre", LC: "Castries", VC: "Kingstown",
  WS: "Apia", SM: "San Marino", ST: "São Tomé", SA: "Riyadh", SN: "Dakar", RS: "Belgrade",
  SC: "Victoria", SL: "Freetown", SG: "Singapore", SK: "Bratislava", SI: "Ljubljana",
  SB: "Honiara", SO: "Mogadishu", ZA: "Pretoria", SS: "Juba", ES: "Madrid", LK: "Sri Jayewardenepura Kotte",
  SD: "Khartoum", SR: "Paramaribo", SE: "Stockholm", CH: "Bern", SY: "Damascus", TW: "Taipei",
  TJ: "Dushanbe", TZ: "Dodoma", TH: "Bangkok", TL: "Dili", TG: "Lomé", TO: "Nukuʻalofa",
  TT: "Port of Spain", TN: "Tunis", TR: "Ankara", TM: "Ashgabat", TV: "Funafuti",
  UG: "Kampala", UA: "Kyiv", AE: "Abu Dhabi", GB: "London", UK: "London", US: "Washington",
  UY: "Montevideo", UZ: "Tashkent", VU: "Port Vila", VA: "Vatican City", VE: "Caracas",
  VN: "Hanoi", YE: "Sana'a", ZM: "Lusaka", ZW: "Harare",
};

type WeatherItem = {
  location: { name: string; country?: string; country_code?: string };
  temperature: number;
  unit: string;
  humidity?: number;
  weather_code?: number;
  wind_speed_kmh?: number;
};

async function fetchWeatherForPlace(
  name: string,
  latitude: number,
  longitude: number,
  country?: string,
  countryCode?: string
): Promise<WeatherItem> {
  const weatherRes = await fetch(
    `${WEATHER_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`
  );
  if (!weatherRes.ok) throw new Error("Weather request failed");
  const weatherData = (await weatherRes.json()) as {
    current?: {
      temperature_2m: number;
      relative_humidity_2m?: number;
      weather_code?: number;
      wind_speed_10m?: number;
    };
  };
  const current = weatherData.current;
  if (!current) throw new Error("No current weather data");
  return {
    location: { name, country, country_code: countryCode },
    temperature: current.temperature_2m,
    unit: "°C",
    humidity: current.relative_humidity_2m,
    weather_code: current.weather_code,
    wind_speed_kmh: current.wind_speed_10m,
  };
}

async function geocodeCity(cityName: string, countryCode: string): Promise<GeoResult | null> {
  const res = await fetch(
    `${GEOCODING_URL}?name=${encodeURIComponent(cityName)}&count=1&language=en&countryCode=${countryCode}`
  );
  if (!res.ok) return null;
  const data = (await res.json()) as { results?: GeoResult[] };
  const results = data.results;
  return results?.length ? results[0] : null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get("location")?.trim();

  if (!location || location.length < 2) {
    return NextResponse.json(
      { error: "Please provide a location (country or city name, at least 2 characters)." },
      { status: 400 }
    );
  }

  const isUAE =
    /^(uae|u\.a\.e\.|united arab emirates|emirates)$/i.test(location) ||
    location.toLowerCase() === "u.a.e";

  if (isUAE) {
    try {
      const emiratesData: WeatherItem[] = [];
      for (const cityName of UAE_EMIRATES) {
        const geoRes = await fetch(
          `${GEOCODING_URL}?name=${encodeURIComponent(cityName)}&count=1&language=en`
        );
        if (!geoRes.ok) continue;
        const geoData = (await geoRes.json()) as { results?: GeoResult[] };
        const results = geoData.results;
        if (!results?.length) continue;
        const { latitude, longitude, name, country, country_code } = results[0];
        const weather = await fetchWeatherForPlace(
          name,
          latitude,
          longitude,
          country,
          country_code
        );
        emiratesData.push(weather);
      }
      if (emiratesData.length === 0) {
        return NextResponse.json(
          { error: "Could not load weather for UAE emirates." },
          { status: 502 }
        );
      }
      return NextResponse.json({ emirates: emiratesData });
    } catch (err) {
      console.error("UAE weather API error:", err);
      return NextResponse.json(
        { error: "Unable to fetch weather for UAE. Please try again later." },
        { status: 500 }
      );
    }
  }

  try {
    const geoRes = await fetch(
      `${GEOCODING_URL}?name=${encodeURIComponent(location)}&count=5&language=en`
    );
    if (!geoRes.ok) {
      throw new Error("Geocoding request failed");
    }
    const geoData = (await geoRes.json()) as { results?: GeoResult[] };
    const results = geoData.results;
    if (!results?.length) {
      return NextResponse.json(
        { error: `No location found for "${location}". Try a different country or city name.` },
        { status: 404 }
      );
    }

    let latitude: number;
    let longitude: number;
    let name: string;
    let country: string | undefined;
    let country_code: string | undefined;

    const first = results[0];
    const isCountry = first.feature_code === "PCLI" || first.feature_code === "PCLD";
    const code = first.country_code?.toUpperCase();
    const cities = code ? COUNTRY_CITIES[code] : undefined;
    const capitalCity = code ? COUNTRY_CAPITALS[code] : undefined;

    if (isCountry && first.country_code) {
      if (cities?.length) {
        const weatherPromises: Promise<WeatherItem | null>[] = cities.map(async (cityName) => {
          const geo = await geocodeCity(cityName, code!);
          if (!geo) return null;
          return fetchWeatherForPlace(
            geo.name,
            geo.latitude,
            geo.longitude,
            first.country ?? geo.country,
            code
          ).catch(() => null);
        });
        const weatherResults = (await Promise.all(weatherPromises)).filter(
          (w): w is WeatherItem => w != null
        );
        if (weatherResults.length > 0) {
          const n = weatherResults.length;
          const avgTemp = weatherResults.reduce((s, w) => s + w.temperature, 0) / n;
          const avgHumidity = weatherResults.reduce((s, w) => s + (w.humidity ?? 0), 0) / n;
          const avgWind = weatherResults.reduce((s, w) => s + (w.wind_speed_kmh ?? 0), 0) / n;
          return NextResponse.json({
            location: { name: first.name, country: first.country, country_code: first.country_code },
            temperature: Math.round(avgTemp * 10) / 10,
            unit: "°C",
            humidity: Math.round(avgHumidity),
            wind_speed_kmh: Math.round(avgWind * 10) / 10,
          });
        }
      }
      if (capitalCity) {
        const capitalRes = await fetch(
          `${GEOCODING_URL}?name=${encodeURIComponent(capitalCity)}&count=1&language=en&countryCode=${code}`
        );
        if (capitalRes.ok) {
          const capitalData = (await capitalRes.json()) as { results?: GeoResult[] };
          const capitalResults = capitalData.results;
          if (capitalResults?.length) {
            const cap = capitalResults[0];
            latitude = cap.latitude;
            longitude = cap.longitude;
            name = first.name;
            country = first.country ?? cap.country;
            country_code = first.country_code;
          } else {
            latitude = first.latitude;
            longitude = first.longitude;
            name = first.name;
            country = first.country;
            country_code = first.country_code;
          }
        } else {
          latitude = first.latitude;
          longitude = first.longitude;
          name = first.name;
          country = first.country;
          country_code = first.country_code;
        }
      } else {
        latitude = first.latitude;
        longitude = first.longitude;
        name = first.name;
        country = first.country;
        country_code = first.country_code;
      }
    } else {
      latitude = first.latitude;
      longitude = first.longitude;
      name = first.name;
      country = first.country;
      country_code = first.country_code;
    }

    const weather = await fetchWeatherForPlace(
      name,
      latitude,
      longitude,
      country,
      country_code
    );
    return NextResponse.json(weather);
  } catch (err) {
    console.error("Weather API error:", err);
    return NextResponse.json(
      { error: "Unable to fetch weather. Please try again later." },
      { status: 500 }
    );
  }
}
