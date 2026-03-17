import { fetchWeatherApi } from 'openmeteo';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json(
      { error: 'Missing required query parameters: lat and lon' },
      { status: 400 }
    );
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);

  if (isNaN(latitude) || isNaN(longitude)) {
    return NextResponse.json(
      { error: 'Invalid query parameters: lat and lon must be valid numbers' },
      { status: 400 }
    );
  }

  if (latitude < -90 || latitude > 90) {
    return NextResponse.json(
      { error: 'Invalid latitude: must be between -90 and 90' },
      { status: 400 }
    );
  }

  if (longitude < -180 || longitude > 180) {
    return NextResponse.json(
      { error: 'Invalid longitude: must be between -180 and 180' },
      { status: 400 }
    );
  }

  try {
    const params = {
      latitude: [latitude],
      longitude: [longitude],
      current: 'temperature_2m,weather_code,wind_speed_10m,wind_direction_10m,relative_humidity_2m',
      hourly: 'temperature_2m,precipitation_probability',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum',
      timezone: 'auto',
      forecast_days: 7,
    };

    const url = 'https://api.open-meteo.com/v1/forecast';
    const responses = await fetchWeatherApi(url, params);
    const response = responses[0];

    const utcOffsetSeconds = response.utcOffsetSeconds();
    const timezone = response.timezone() ?? 'UTC';

    // --- Current weather ---
    const current = response.current()!;
    const currentTime = new Date(
      (Number(current.time()) + utcOffsetSeconds) * 1000
    ).toISOString();

    const currentData = {
      temperature: current.variables(0)!.value(),
      weatherCode: current.variables(1)!.value(),
      windSpeed: current.variables(2)!.value(),
      windDirection: current.variables(3)!.value(),
      humidity: current.variables(4)!.value(),
      time: currentTime,
    };

    // --- Hourly forecast (next 24 entries) ---
    const hourly = response.hourly()!;
    const hourlyTimeStart = Number(hourly.time());
    const hourlyTimeStep = Number(hourly.interval());
    const hourlyTemps = hourly.variables(0)!.valuesArray()!;
    const hourlyPrecipProb = hourly.variables(1)!.valuesArray()!;

    const hourlyData = Array.from({ length: Math.min(24, hourlyTemps.length) }, (_, i) => ({
      time: new Date(
        (hourlyTimeStart + i * hourlyTimeStep + utcOffsetSeconds) * 1000
      ).toISOString(),
      temperature: hourlyTemps[i],
      precipitationProbability: hourlyPrecipProb[i],
    }));

    // --- Daily forecast (7 days) ---
    const daily = response.daily()!;
    const dailyTimeStart = Number(daily.time());
    const dailyTimeStep = Number(daily.interval());
    const dailyWeatherCodes = daily.variables(0)!.valuesArray()!;
    const dailyTempMax = daily.variables(1)!.valuesArray()!;
    const dailyTempMin = daily.variables(2)!.valuesArray()!;
    const dailyPrecipSum = daily.variables(3)!.valuesArray()!;

    const dailyData = Array.from({ length: Math.min(7, dailyWeatherCodes.length) }, (_, i) => ({
      date: new Date(
        (dailyTimeStart + i * dailyTimeStep + utcOffsetSeconds) * 1000
      ).toISOString().split('T')[0],
      weatherCode: dailyWeatherCodes[i],
      tempMax: dailyTempMax[i],
      tempMin: dailyTempMin[i],
      precipitation: dailyPrecipSum[i],
    }));

    return NextResponse.json({
      current: currentData,
      daily: dailyData,
      hourly: hourlyData,
      timezone,
      latitude: response.latitude(),
      longitude: response.longitude(),
    });
  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}
