"use client";

import { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import InputAdornment from "@mui/material/InputAdornment";

import WbSunnyRounded from "@mui/icons-material/WbSunnyRounded";
import CloudRounded from "@mui/icons-material/CloudRounded";
import GrainRounded from "@mui/icons-material/GrainRounded";
import AcUnitRounded from "@mui/icons-material/AcUnitRounded";
import ThunderstormRounded from "@mui/icons-material/ThunderstormRounded";
import FilterDramaRounded from "@mui/icons-material/FilterDramaRounded";
import WaterDropRounded from "@mui/icons-material/WaterDropRounded";
import AirRounded from "@mui/icons-material/AirRounded";
import ExploreRounded from "@mui/icons-material/ExploreRounded";
import ThermostatRounded from "@mui/icons-material/ThermostatRounded";
import SearchRounded from "@mui/icons-material/SearchRounded";
import TravelExploreRounded from "@mui/icons-material/TravelExploreRounded";
import LocationOnRounded from "@mui/icons-material/LocationOnRounded";
import DehazeRounded from "@mui/icons-material/DehazeRounded";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CurrentWeather {
  temperature: number;
  weatherCode: number;
  windSpeed: number;
  windDirection: number;
  humidity: number;
  time: string;
}

interface DailyWeather {
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  precipitation: number;
}

interface HourlyWeather {
  time: string;
  temperature: number;
  precipitationProbability: number;
}

interface WeatherData {
  current: CurrentWeather;
  daily: DailyWeather[];
  hourly: HourlyWeather[];
  timezone: string;
  latitude: number;
  longitude: number;
}

// ---------------------------------------------------------------------------
// Weather code helpers
// ---------------------------------------------------------------------------

function WeatherIcon({ code, size = 48, color }: { code: number; size?: number; color?: string }) {
  const sx = { fontSize: size, color: color ?? "inherit" };
  if (code === 0) return <WbSunnyRounded sx={{ ...sx, color: color ?? "#f59e0b" }} />;
  if (code <= 3) return <FilterDramaRounded sx={{ ...sx, color: color ?? "#94a3b8" }} />;
  if (code === 45 || code === 48) return <DehazeRounded sx={{ ...sx, color: color ?? "#94a3b8" }} />;
  if ([51, 53, 55, 61, 63, 65].includes(code)) return <GrainRounded sx={{ ...sx, color: color ?? "#3b82f6" }} />;
  if ([71, 73, 75, 77].includes(code)) return <AcUnitRounded sx={{ ...sx, color: color ?? "#93c5fd" }} />;
  if ([80, 81, 82].includes(code)) return <GrainRounded sx={{ ...sx, color: color ?? "#60a5fa" }} />;
  if (code === 95 || code === 96 || code === 99) return <ThunderstormRounded sx={{ ...sx, color: color ?? "#8b5cf6" }} />;
  return <CloudRounded sx={{ ...sx, color: color ?? "#94a3b8" }} />;
}

function getWeatherDescription(code: number): string {
  if (code === 0) return "ท้องฟ้าแจ่มใส";
  if (code <= 3) return "มีเมฆบางส่วน";
  if (code === 45 || code === 48) return "หมอกลง";
  if ([51, 53, 55, 61, 63, 65].includes(code)) return "ฝนตก";
  if ([71, 73, 75, 77].includes(code)) return "หิมะตก";
  if ([80, 81, 82].includes(code)) return "ฝนตกเป็นระยะ";
  if (code === 95 || code === 96 || code === 99) return "พายุฝนฟ้าคะนอง";
  return "ไม่ทราบสภาพ";
}

function formatDay(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("th-TH", { weekday: "short" });
}

function formatHour(timeStr: string): string {
  return new Date(timeStr).toLocaleTimeString("th-TH", { hour: "numeric", hour12: false }) + " น.";
}

function getWindDirectionLabel(degrees: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(degrees / 45) % 8];
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Box sx={{ flex: 1, textAlign: "center", bgcolor: "#f8fafc", borderRadius: 3, py: 2, px: 1 }}>
      <Box sx={{ color: "primary.main", mb: 0.5 }}>{icon}</Box>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: "0.65rem", mb: 0.25 }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={700} color="text.primary">
        {value}
      </Typography>
    </Box>
  );
}

function LoadingSpinner() {
  return (
    <Stack alignItems="center" justifyContent="center" spacing={2} py={10}>
      <CircularProgress />
      <Typography variant="body2" color="text.secondary">
        กำลังโหลดข้อมูล...
      </Typography>
    </Stack>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <Alert severity="error" sx={{ borderRadius: 3 }}>
      {message}
    </Alert>
  );
}

function CurrentCard({ current }: { current: CurrentWeather }) {
  return (
    <Card sx={{ borderRadius: "24px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", overflow: "visible" }}>
      <CardContent sx={{ p: 4, "&:last-child": { pb: 4 } }}>
        <Stack alignItems="center" spacing={1.5}>
          <WeatherIcon code={current.weatherCode} size={80} />
          <Typography
            variant="h1"
            sx={{
              fontSize: "5.5rem",
              fontWeight: 200,
              letterSpacing: "-0.02em",
              lineHeight: 1,
              color: "text.primary",
            }}
          >
            {Math.round(current.temperature)}°
          </Typography>
          <Typography variant="h6" color="text.secondary" fontWeight={400}>
            {getWeatherDescription(current.weatherCode)}
          </Typography>
        </Stack>
        <Divider sx={{ my: 3 }} />
        <Stack direction="row" spacing={1.5}>
          <StatItem
            icon={<WaterDropRounded fontSize="small" />}
            label="ความชื้น"
            value={`${Math.round(current.humidity)}%`}
          />
          <StatItem
            icon={<AirRounded fontSize="small" />}
            label="ลม"
            value={`${Math.round(current.windSpeed)} km/h`}
          />
          <StatItem
            icon={<ExploreRounded fontSize="small" />}
            label="ทิศทาง"
            value={getWindDirectionLabel(current.windDirection)}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}

function DailyCard({ day, index }: { day: DailyWeather; index: number }) {
  const isToday = index === 0;
  return (
    <Card
      elevation={0}
      sx={{
        flexShrink: 0,
        minWidth: 88,
        borderRadius: "18px",
        cursor: "default",
        transition: "transform 0.15s",
        "&:hover": { transform: "translateY(-2px)" },
        bgcolor: isToday ? "primary.main" : "#ffffff",
        boxShadow: isToday
          ? "0 6px 20px rgba(26,115,232,0.35)"
          : "0 2px 8px rgba(0,0,0,0.06)",
      }}
    >
      <CardContent sx={{ p: 1.75, "&:last-child": { pb: 1.75 }, textAlign: "center" }}>
        <Stack alignItems="center" spacing={0.75}>
          <Typography
            variant="caption"
            fontWeight={700}
            sx={{
              fontSize: "0.65rem",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: isToday ? "rgba(255,255,255,0.9)" : "text.secondary",
            }}
          >
            {isToday ? "วันนี้" : formatDay(day.date)}
          </Typography>
          <WeatherIcon code={day.weatherCode} size={28} color={isToday ? "#ffffff" : undefined} />
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Typography
              variant="body2"
              fontWeight={700}
              sx={{ color: isToday ? "#ffffff" : "text.primary" }}
            >
              {Math.round(day.tempMax)}°
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: isToday ? "rgba(255,255,255,0.6)" : "text.disabled" }}
            >
              {Math.round(day.tempMin)}°
            </Typography>
          </Stack>
          {day.precipitation > 0 && (
            <Stack direction="row" alignItems="center" spacing={0.25}>
              <WaterDropRounded
                sx={{ fontSize: 10, color: isToday ? "rgba(255,255,255,0.8)" : "#3b82f6" }}
              />
              <Typography
                variant="caption"
                sx={{
                  fontSize: "0.65rem",
                  color: isToday ? "rgba(255,255,255,0.8)" : "#3b82f6",
                }}
              >
                {Math.round(day.precipitation)} มม.
              </Typography>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

function HourlyCard({ hour }: { hour: HourlyWeather }) {
  return (
    <Card
      elevation={0}
      sx={{
        flexShrink: 0,
        minWidth: 72,
        borderRadius: "14px",
        cursor: "default",
        bgcolor: "#ffffff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        transition: "transform 0.15s",
        "&:hover": { transform: "translateY(-2px)" },
      }}
    >
      <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 }, textAlign: "center" }}>
        <Stack alignItems="center" spacing={0.75}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>
            {formatHour(hour.time)}
          </Typography>
          <ThermostatRounded sx={{ fontSize: 20, color: "primary.main" }} />
          <Typography variant="body2" fontWeight={700} color="text.primary">
            {Math.round(hour.temperature)}°
          </Typography>
          {hour.precipitationProbability > 0 && (
            <Stack direction="row" alignItems="center" spacing={0.25}>
              <WaterDropRounded sx={{ fontSize: 10, color: "#3b82f6" }} />
              <Typography variant="caption" sx={{ fontSize: "0.65rem", color: "#3b82f6" }}>
                {hour.precipitationProbability}%
              </Typography>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function WeatherPage() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cityInput, setCityInput] = useState("");
  const [locationLabel, setLocationLabel] = useState<string | null>(null);

  const fetchWeather = useCallback(
    async (lat: number, lon: number, label?: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error ?? `HTTP ${res.status}`);
        }
        const data: WeatherData = await res.json();
        setWeather(data);
        if (label) setLocationLabel(label);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch weather data."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchWeather(pos.coords.latitude, pos.coords.longitude, "Your location");
      },
      () => {
        // Silently fall back – user can search manually
      }
    );
  }, [fetchWeather]);

  const handleSearch = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const city = cityInput.trim();
      if (!city) return;

      setLoading(true);
      setError(null);
      try {
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
        );
        if (!geoRes.ok) throw new Error("Geocoding service unavailable.");
        const geoData = await geoRes.json();
        if (!geoData.results?.length) {
          throw new Error(`No results found for "${city}". Try a different spelling.`);
        }
        const { latitude, longitude, name, country } = geoData.results[0];
        await fetchWeather(latitude, longitude, `${name}, ${country}`);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to geocode city."
        );
        setLoading(false);
      }
    },
    [cityInput, fetchWeather]
  );

  const next24Hours = weather?.hourly.slice(0, 24) ?? [];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f0f4f8", py: { xs: 3, sm: 5 } }}>
      <Container maxWidth="sm">
        <Stack spacing={3}>

          {/* Header */}
          <Box textAlign="center">
            <Typography variant="h4" fontWeight={800} color="text.primary" letterSpacing="-0.02em">
              สภาพอากาศ
            </Typography>
            {locationLabel && (
              <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5} mt={0.5}>
                <LocationOnRounded sx={{ fontSize: 14, color: "text.secondary" }} />
                <Typography variant="body2" color="text.secondary">
                  {locationLabel}
                </Typography>
              </Stack>
            )}
          </Box>

          {/* Search */}
          <Stack direction="row" spacing={1.5} component="form" onSubmit={handleSearch}>
            <TextField
              fullWidth
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              placeholder="ค้นหาเมือง..."
              size="medium"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded sx={{ color: "text.disabled" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "14px",
                  bgcolor: "#ffffff",
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                borderRadius: "14px",
                px: 3,
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              ค้นหา
            </Button>
          </Stack>

          {loading && <LoadingSpinner />}
          {!loading && error && <ErrorMessage message={error} />}

          {!loading && weather && (
            <>
              <CurrentCard current={weather.current} />

              <Box>
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{ display: "block", mb: 1.5, px: 0.5, letterSpacing: "0.1em" }}
                >
                  พยากรณ์ 7 วัน
                </Typography>
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{
                    overflowX: "auto",
                    pb: 1,
                    "&::-webkit-scrollbar": { display: "none" },
                    scrollbarWidth: "none",
                  }}
                >
                  {weather.daily.map((day, i) => (
                    <DailyCard key={day.date} day={day} index={i} />
                  ))}
                </Stack>
              </Box>

              <Box>
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{ display: "block", mb: 1.5, px: 0.5, letterSpacing: "0.1em" }}
                >
                  24 ชั่วโมงข้างหน้า
                </Typography>
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{
                    overflowX: "auto",
                    pb: 1,
                    "&::-webkit-scrollbar": { display: "none" },
                    scrollbarWidth: "none",
                  }}
                >
                  {next24Hours.map((hour) => (
                    <HourlyCard key={hour.time} hour={hour} />
                  ))}
                </Stack>
              </Box>

              <Typography variant="caption" color="text.disabled" textAlign="center" display="block">
                {weather.timezone} • อัปเดต{" "}
                {new Date(weather.current.time).toLocaleTimeString("th-TH", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Typography>
            </>
          )}

          {!loading && !error && !weather && (
            <Stack alignItems="center" spacing={2} py={10}>
              <TravelExploreRounded sx={{ fontSize: 64, color: "text.disabled" }} />
              <Typography color="text.secondary" textAlign="center">
                ค้นหาเมืองหรืออนุญาตการเข้าถึงตำแหน่งเพื่อเริ่มต้น
              </Typography>
            </Stack>
          )}

        </Stack>
      </Container>
    </Box>
  );
}
