"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { WeatherIcon, weatherKindFromCode, WeatherKind } from "@/components/weather-icon";
import { useLocale } from "@/lib/i18n/locale-context";

interface DayForecast {
  date: string;
  weatherCode: number;
  tempMin: number;
  tempMax: number;
}

interface WeatherData {
  temperature: number;
  weatherCode: number;
  windSpeed: number;
  todayMin: number;
  todayMax: number;
  week: DayForecast[];
}

const ISTANBUL = { lat: 41.0082, lon: 28.9784, label: "İstanbul" };

const WEATHER_CONDITION_KEYS: Record<WeatherKind, string> = {
  clear: "clear",
  "partly-cloudy": "partlyCloudy",
  cloudy: "cloudy",
  fog: "fog",
  drizzle: "drizzle",
  rain: "rain",
  snow: "snow",
  storm: "storm",
};

export function WeatherWidget() {
  const { t, locale } = useLocale();
  const [locationLabel, setLocationLabel] = useState(ISTANBUL.label);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    function loadWeather(lat: number, lon: number) {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=7&timezone=auto`;
      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          const week: DayForecast[] = data.daily.time.map((date: string, i: number) => ({
            date,
            weatherCode: data.daily.weather_code[i],
            tempMin: Math.round(data.daily.temperature_2m_min[i]),
            tempMax: Math.round(data.daily.temperature_2m_max[i]),
          }));
          setWeather({
            temperature: Math.round(data.current.temperature_2m),
            weatherCode: data.current.weather_code,
            windSpeed: Math.round(data.current.wind_speed_10m),
            todayMin: Math.round(data.daily.temperature_2m_min[0]),
            todayMax: Math.round(data.daily.temperature_2m_max[0]),
            week,
          });
        })
        .catch(() => setError(true));
    }

    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocationLabel(t("components.weatherWidget.yourLocation"));
          loadWeather(pos.coords.latitude, pos.coords.longitude);
        },
        () => loadWeather(ISTANBUL.lat, ISTANBUL.lon),
        { timeout: 5000 },
      );
    } else {
      loadWeather(ISTANBUL.lat, ISTANBUL.lon);
    }
  }, []);

  if (error) return null;
  if (!weather) {
    return (
      <div className="flex w-full max-w-4xl items-center gap-3 rounded-3xl bg-ink-900 px-7 py-6 text-base text-silver-500 ring-1 ring-ink-800">
        <span className="h-2 w-2 animate-pulse rounded-full bg-gold-400" />
        {t("components.weatherWidget.loading")}
      </div>
    );
  }

  const kind = weatherKindFromCode(weather.weatherCode);
  const showFrostWarning = weather.todayMin <= 0;
  const showHeatWarning = weather.todayMax >= 33;
  const showWindWarning = weather.windSpeed >= 40;
  const hasWarning = showFrostWarning || showHeatWarning || showWindWarning;

  return (
    <Link
      href="/weather"
      className="group flex w-full max-w-4xl flex-col gap-5 rounded-3xl bg-gradient-to-br from-ink-900 to-ink-950 px-6 py-6 text-start ring-1 ring-ink-800 transition duration-300 hover:-translate-y-0.5 hover:ring-gold-500/40 hover:shadow-[0_12px_36px_-14px_rgba(212,175,55,0.35)] sm:px-8 sm:py-7"
    >
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gold-500/10 text-gold-400 ring-1 ring-gold-500/20 transition group-hover:scale-105 group-hover:bg-gold-500/15">
            <WeatherIcon kind={kind} className="h-9 w-9" />
          </span>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-medium text-silver-400">{locationLabel}</span>
              <span className="text-3xl font-bold leading-none text-silver-50">{weather.temperature}°</span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-sm text-silver-500">
              <span>{t(`components.weatherWidget.conditions.${WEATHER_CONDITION_KEYS[kind]}`)}</span>
              <span className="text-silver-700">·</span>
              <span className="inline-flex items-center gap-0.5 text-sky-400">
                <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current">
                  <path d="M12 18L5 9h14l-7 9z" />
                </svg>
                {weather.todayMin}°
              </span>
              <span className="inline-flex items-center gap-0.5 text-orange-400">
                <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current">
                  <path d="M12 6l7 9H5l7-9z" />
                </svg>
                {weather.todayMax}°
              </span>
            </div>
          </div>
        </div>

        <span className="ms-auto flex shrink-0 items-center gap-1 self-center rounded-full px-3 py-1.5 text-sm font-medium text-gold-400 transition group-hover:bg-gold-500/10">
          {t("components.weatherWidget.weeklyForecast")}
          <svg viewBox="0 0 24 24" className="h-4 w-4 transition group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2 border-t border-ink-800 pt-5 sm:grid-cols-7">
        {weather.week.map((day, i) => {
          const dayKind = weatherKindFromCode(day.weatherCode);
          const label = new Date(`${day.date}T00:00:00`).toLocaleDateString(locale, { weekday: "short" });
          return (
            <div
              key={day.date}
              className={`flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-center ${
                i === 0 ? "bg-gold-500/10 ring-1 ring-gold-500/20" : ""
              }`}
            >
              <span className="text-xs font-medium capitalize text-silver-400">
                {i === 0 ? t("components.weatherWidget.today") : label}
              </span>
              <WeatherIcon kind={dayKind} className="h-6 w-6 text-gold-400" />
              <span className="text-xs text-silver-300">
                <span className="text-orange-400">{day.tempMax}°</span>{" "}
                <span className="text-sky-400">{day.tempMin}°</span>
              </span>
            </div>
          );
        })}
      </div>

      {hasWarning && (
        <div className="flex flex-col gap-2 border-t border-ink-800 pt-4">
          {showFrostWarning && (
            <div className="flex items-start gap-2.5 rounded-xl bg-blue-500/10 px-3.5 py-2.5 ring-1 ring-blue-500/20">
              <span className="mt-0.5 text-base">❄️</span>
              <p className="text-sm leading-relaxed text-blue-300">
                <span className="font-semibold">{t("components.weatherWidget.frostWarningTitle")}</span>{" "}
                {t("components.weatherWidget.frostWarningText")}
              </p>
            </div>
          )}
          {showHeatWarning && (
            <div className="flex items-start gap-2.5 rounded-xl bg-orange-500/10 px-3.5 py-2.5 ring-1 ring-orange-500/20">
              <span className="mt-0.5 text-base">🔥</span>
              <p className="text-sm leading-relaxed text-orange-300">
                <span className="font-semibold">{t("components.weatherWidget.heatWarningTitle")}</span>{" "}
                {t("components.weatherWidget.heatWarningText")}
              </p>
            </div>
          )}
          {showWindWarning && (
            <div className="flex items-start gap-2.5 rounded-xl bg-yellow-500/10 px-3.5 py-2.5 ring-1 ring-yellow-500/20">
              <span className="mt-0.5 text-base">💨</span>
              <p className="text-sm leading-relaxed text-yellow-300">
                <span className="font-semibold">Rüzgar Uyarısı:</span> Vinç ve iskele işlerinde dikkatli olun.
              </p>
            </div>
          )}
        </div>
      )}
    </Link>
  );
}
