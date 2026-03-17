# Weather App

> A real-time weather forecast application built with Next.js, featuring a Thai-language interface, global city search, and detailed weather data — no API key required.

[![Next.js](https://img.shields.io/badge/Next.js-16.1.7-black?logo=nextdotjs)](https://nextjs.org)
[![MUI](https://img.shields.io/badge/MUI-v7-007FFF?logo=mui)](https://mui.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Why This Exists

Most weather forecast services require you to register and obtain an API key before you can use them. This project uses [Open-Meteo](https://open-meteo.com/), a free and open-source API — no registration, no cost, and everything is displayed in Thai.

---

## Key Features

- **Automatic location detection** — Uses the browser's Geolocation API to load weather data for your current location as soon as the page opens.
- **City search** — Search for cities anywhere in the world via the Open-Meteo Geocoding API.
- **Current conditions** — Displays temperature, weather condition, humidity, wind speed, and wind direction.
- **7-day forecast** — A horizontally scrollable card layout showing daily weather for 7 days (today is specially highlighted).
- **24-hour hourly forecast** — A temperature chart and precipitation probability for the next 24 hours.
- **Thai-language interface** — All weather descriptions and UI text are in Thai.
- **Weather icons** — Uses MUI icons mapped to WMO weather codes (sun, clouds, rain, snow, storm, fog).
- **Responsive design** — Built mobile-first.

---

## Tech Stack

| Category | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.1.7 |
| UI Library | Material UI (MUI) | ^7.3.9 |
| Language | TypeScript | ^5 |
| Styling | TailwindCSS + Emotion | ^4 |
| Runtime | React | 19.2.3 |
| Weather API | Open-Meteo (`openmeteo` package) | ^1.2.3 |
| Font | Google Fonts — Prompt (Thai + Latin) | weights 300–700 |

---

## Project Structure

```
nextjs-weather-th/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── weather/
│   │   │       └── route.ts     # Next.js API Route — fetches data from Open-Meteo
│   │   ├── layout.tsx           # Root layout: MUI ThemeProvider + Prompt font
│   │   ├── page.tsx             # Main page (Client Component)
│   │   └── globals.css          # Global styles
│   └── theme.ts                 # MUI custom theme (colors, typography, components)
├── package.json
├── tsconfig.json
└── next.config.ts
```

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) 1.0 or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/nextjs-weather-th.git
cd nextjs-weather-th

# Install dependencies
bun install
```

### Run in Development Mode

```bash
bun dev
```

Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
bun run build
bun start
```

### All Commands

| Command | Description |
|---|---|
| `bun dev` | Start the development server |
| `bun run build` | Build for production |
| `bun start` | Start the production server |
| `bun run lint` | Lint the code with ESLint |

> **Note:** This project requires no API key and no `.env` file of any kind. It runs immediately after installing dependencies.

---

## API Reference

### `GET /api/weather`

A Next.js API Route that acts as a proxy between the UI and Open-Meteo to prevent CORS issues and centralise input validation on the server side.

#### Query Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `lat` | `number` | Yes | Latitude (range `-90` to `90`) |
| `lon` | `number` | Yes | Longitude (range `-180` to `180`) |

#### Example Request

```bash
curl "http://localhost:3000/api/weather?lat=13.7563&lon=100.5018"
```

#### Example Response (HTTP 200)

```json
{
  "current": {
    "temperature": 32.5,
    "weatherCode": 1,
    "windSpeed": 12.3,
    "windDirection": 180,
    "humidity": 72,
    "time": "2026-03-17T14:00:00.000Z"
  },
  "hourly": [
    {
      "time": "2026-03-17T07:00:00.000Z",
      "temperature": 29.1,
      "precipitationProbability": 10
    },
    {
      "time": "2026-03-17T08:00:00.000Z",
      "temperature": 30.4,
      "precipitationProbability": 15
    }
    // ... 24 entries total
  ],
  "daily": [
    {
      "date": "2026-03-17",
      "weatherCode": 1,
      "tempMax": 35.2,
      "tempMin": 26.8,
      "precipitation": 0.0
    },
    {
      "date": "2026-03-18",
      "weatherCode": 61,
      "tempMax": 32.1,
      "tempMin": 25.3,
      "precipitation": 4.2
    }
    // ... 7 entries total
  ],
  "timezone": "Asia/Bangkok",
  "latitude": 13.7563,
  "longitude": 100.5018
}
```

#### Error Responses

| HTTP Status | Condition | Example Response |
|---|---|---|
| `400` | Missing `lat` or `lon` | `{"error": "Missing required query parameters: lat and lon"}` |
| `400` | Non-numeric value | `{"error": "Invalid query parameters: lat and lon must be valid numbers"}` |
| `400` | Latitude out of range | `{"error": "Invalid latitude: must be between -90 and 90"}` |
| `400` | Longitude out of range | `{"error": "Invalid longitude: must be between -180 and 180"}` |
| `500` | Open-Meteo API failure | `{"error": "Failed to fetch weather data"}` |

#### Open-Meteo Variables Fetched

- **Current:** `temperature_2m`, `weather_code`, `wind_speed_10m`, `wind_direction_10m`, `relative_humidity_2m`
- **Hourly:** `temperature_2m`, `precipitation_probability` (24 entries)
- **Daily:** `weather_code`, `temperature_2m_max`, `temperature_2m_min`, `precipitation_sum` (7 days)

---

## Weather Data Flow

Data flow from the user opening the app through to rendering:

```
User opens app
    │
    ▼
Browser Geolocation API
(request lat/lon coordinates)
    │
    ├──[User searches city]──► Open-Meteo Geocoding API
    │                          https://geocoding-api.open-meteo.com/v1/search
    │                          (city name → lat/lon)
    │
    ▼
Next.js API Route
GET /api/weather?lat=...&lon=...
(validate input, proxy request)
    │
    ▼
Open-Meteo Forecast API
https://api.open-meteo.com/v1/forecast
(fetch current + hourly + daily data)
    │
    ▼
JSON Response
    │
    ▼
React UI (page.tsx)
(render weather in Thai UI)
```

> The Geocoding API is called directly from the client because Open-Meteo supports CORS for that endpoint.

---

## WMO Weather Codes and Thai Translations

This app uses the WMO (World Meteorological Organization) standard to map weather codes to descriptions:

| WMO Code | Condition | Icon |
|---|---|---|
| `0` | Clear sky | WbSunny |
| `1–3` | Partly cloudy | Cloud |
| `45`, `48` | Fog | DenseFog |
| `51`, `53`, `55`, `61`, `63`, `65` | Drizzle / Rain | Grain / Umbrella |
| `71`, `73`, `75`, `77` | Snow | AcUnit |
| `80`, `81`, `82` | Rain showers | Thunderstorm |
| `95`, `96`, `99` | Thunderstorm | ElectricBolt |

---

## Theme Configuration

The app theme is defined in `src/theme.ts`:

| Token | Value |
|---|---|
| Primary color | `#1a73e8` (Google Blue) |
| Secondary color | `#00897b` (Teal) |
| Background | `#f0f4f8` |
| Border radius (global) | `16px` |
| Font | Prompt (Thai + Latin, weights 300–700) |

---

## Environment

This project **requires no `.env` file** and **no API keys** of any kind.

Open-Meteo is a free, open-source weather API available for general use. See [open-meteo.com](https://open-meteo.com/) for details and usage terms.

---

## License

MIT © 2026

See [LICENSE](LICENSE) for details.
