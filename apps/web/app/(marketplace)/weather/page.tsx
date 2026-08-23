"use client";

import { useEffect, useState } from "react";
import { TURKISH_PROVINCES } from "@bau360/shared";
import { ProvinceDistrictSelect } from "@/components/province-district-select";
import { useLocale } from "@/lib/i18n/locale-context";

interface DailyForecast {
  date: string;
  weatherCode: number;
  tempMin: number;
  tempMax: number;
  windMax: number;
  precipProbability: number;
}

interface HourlyForecast {
  time: string;
  temperature: number;
  weatherCode: number;
  windSpeed: number;
  precipProbability: number;
}

interface RiskFlag {
  icon: string;
  label: string;
}

function describeWeatherCode(code: number): { icon: string; text: string } {
  if (code === 0) return { icon: "☀️", text: "Açık" };
  if (code === 1 || code === 2) return { icon: "🌤️", text: "Parçalı bulutlu" };
  if (code === 3) return { icon: "☁️", text: "Kapalı" };
  if (code === 45 || code === 48) return { icon: "🌫️", text: "Sisli" };
  if (code >= 51 && code <= 57) return { icon: "🌦️", text: "Çisenti" };
  if (code >= 61 && code <= 67) return { icon: "🌧️", text: "Yağmurlu" };
  if (code >= 71 && code <= 77) return { icon: "❄️", text: "Kar yağışlı" };
  if (code >= 80 && code <= 82) return { icon: "🌧️", text: "Sağanak yağmur" };
  if (code >= 85 && code <= 86) return { icon: "🌨️", text: "Kar sağanağı" };
  if (code >= 95) return { icon: "⛈️", text: "Gök gürültülü fırtına" };
  return { icon: "🌡️", text: "Hava durumu" };
}

function dayRisks(d: DailyForecast): RiskFlag[] {
  const risks: RiskFlag[] = [];
  if (d.tempMin <= 0) risks.push({ icon: "❄️", label: "Don riski" });
  if (d.tempMax >= 33) risks.push({ icon: "🔥", label: "Aşırı sıcak" });
  if (d.windMax >= 40) risks.push({ icon: "💨", label: "Kuvvetli rüzgar" });
  if (d.precipProbability >= 70) risks.push({ icon: "🌧️", label: "Yoğun yağış riski" });
  return risks;
}

function hourRisk(h: HourlyForecast): RiskFlag | null {
  if (h.temperature <= 0) return { icon: "❄️", label: "Don" };
  if (h.temperature >= 33) return { icon: "🔥", label: "Aşırı sıcak" };
  if (h.windSpeed >= 40) return { icon: "💨", label: "Kuvvetli rüzgar" };
  if (h.precipProbability >= 70) return { icon: "🌧️", label: "Yoğun yağış" };
  return null;
}

function formatDayLabel(dateStr: string) {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" });
}

function formatHourLabel(timeStr: string) {
  return timeStr.slice(11, 16);
}

async function geocode(city: string, district: string): Promise<{ lat: number; lon: number } | null> {
  const query = district ? `${district}, ${city}` : city;
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    query,
  )}&count=5&language=tr&format=json&country=TR`;
  const res = await fetch(url);
  const data = await res.json();
  const results: { latitude: number; longitude: number; admin1?: string }[] = data.results ?? [];
  if (results.length === 0) return null;
  const match = results.find((r) => r.admin1 === city) ?? results[0];
  return { lat: match.latitude, lon: match.longitude };
}

export default function WeatherPage() {
  const { t } = useLocale();
  const [city, setCity] = useState(TURKISH_PROVINCES[0]);
  const [district, setDistrict] = useState("");
  const [rangeDays, setRangeDays] = useState<7 | 16>(7);
  const [daily, setDaily] = useState<DailyForecast[]>([]);
  const [hourly, setHourly] = useState<HourlyForecast[]>([]);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    setExpandedDate(null);

    (async () => {
      const location = await geocode(city, district);
      if (!location) {
        if (!cancelled) {
          setError("Bu bölge için hava durumu verisi bulunamadı.");
          setIsLoading(false);
        }
        return;
      }
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max,precipitation_probability_max&hourly=temperature_2m,weather_code,wind_speed_10m,precipitation_probability&forecast_days=${rangeDays}&timezone=auto`;
      try {
        const res = await fetch(url);
        const data = await res.json();
        if (cancelled) return;
        const dailyPoints: DailyForecast[] = data.daily.time.map((date: string, i: number) => ({
          date,
          weatherCode: data.daily.weather_code[i],
          tempMin: Math.round(data.daily.temperature_2m_min[i]),
          tempMax: Math.round(data.daily.temperature_2m_max[i]),
          windMax: Math.round(data.daily.wind_speed_10m_max[i]),
          precipProbability: data.daily.precipitation_probability_max[i] ?? 0,
        }));
        const hourlyPoints: HourlyForecast[] = data.hourly.time.map((time: string, i: number) => ({
          time,
          temperature: Math.round(data.hourly.temperature_2m[i]),
          weatherCode: data.hourly.weather_code[i],
          windSpeed: Math.round(data.hourly.wind_speed_10m[i]),
          precipProbability: data.hourly.precipitation_probability[i] ?? 0,
        }));
        setDaily(dailyPoints);
        setHourly(hourlyPoints);
      } catch {
        if (!cancelled) setError("Hava durumu verisi alınamadı.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [city, district, rangeDays]);

  const locationLabel = district ? `${district}, ${city}` : city;

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold text-silver-300">{t("pages.weatherHeading")}</h1>
      <p className="mb-6 text-sm text-silver-500">
        İl/ilçe seç, önümüzdeki günlerin tahminini ve şantiye işleri için riskli gün ve saatleri gör.
      </p>

      <div className="mb-6 space-y-4 rounded-lg border border-ink-800 bg-ink-900/50 p-4">
        <ProvinceDistrictSelect
          city={city}
          district={district}
          onCityChange={(v) => {
            setCity(v);
            setDistrict("");
          }}
          onDistrictChange={setDistrict}
          allowEmptyDistrict
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setRangeDays(7)}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              rangeDays === 7
                ? "bg-gold-500 text-ink-950"
                : "border border-ink-700 text-silver-400 hover:border-gold-500"
            }`}
          >
            Haftalık (7 gün)
          </button>
          <button
            type="button"
            onClick={() => setRangeDays(16)}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              rangeDays === 16
                ? "bg-gold-500 text-ink-950"
                : "border border-ink-700 text-silver-400 hover:border-gold-500"
            }`}
          >
            16 Günlük
          </button>
        </div>
        <p className="text-xs text-silver-500">
          Not: Güvenilir hava tahmini en fazla ~16 gün ileriye kadar yapılabilir, bu yüzden tam aylık (30 günlük)
          tahmin sunmuyoruz — meteorolojik olarak bu kadar ileriye dair tahminler güvenilir değildir.
        </p>
      </div>

      {isLoading && <p className="text-silver-500">Yükleniyor...</p>}
      {!isLoading && error && <p className="text-sm text-red-400">{error}</p>}

      {!isLoading && !error && (
        <div className="space-y-3">
          <p className="text-sm text-silver-500">{locationLabel} için tahmin</p>
          {daily.map((d) => {
            const { icon, text } = describeWeatherCode(d.weatherCode);
            const risks = dayRisks(d);
            const isExpanded = expandedDate === d.date;
            const dayHours = hourly.filter((h) => h.time.startsWith(d.date));

            return (
              <div key={d.date} className="rounded-lg border border-ink-800 bg-ink-900">
                <button
                  type="button"
                  onClick={() => setExpandedDate(isExpanded ? null : d.date)}
                  className="flex w-full items-center justify-between gap-4 p-4 text-start"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl leading-none">{icon}</span>
                    <div>
                      <p className="font-medium capitalize text-silver-200">{formatDayLabel(d.date)}</p>
                      <p className="text-xs text-silver-500">
                        {text} · {d.tempMin}° / {d.tempMax}°C · 💨 {d.windMax} km/s
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {risks.map((r) => (
                      <span
                        key={r.label}
                        title={r.label}
                        className="rounded-full bg-ink-800 px-2 py-1 text-xs text-gold-400"
                      >
                        {r.icon} {r.label}
                      </span>
                    ))}
                    <span className="text-silver-500">{isExpanded ? "▲" : "▼"}</span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-ink-800 p-4">
                    <p className="mb-3 text-xs text-silver-500">Saatlik tahmin — riskli saatler işaretlendi</p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                      {dayHours.map((h) => {
                        const risk = hourRisk(h);
                        return (
                          <div
                            key={h.time}
                            className={`rounded-md border px-3 py-2 text-xs ${
                              risk ? "border-gold-500/50 bg-ink-800" : "border-ink-800 bg-ink-900"
                            }`}
                          >
                            <p className="font-medium text-silver-300">{formatHourLabel(h.time)}</p>
                            <p className="text-silver-500">
                              {h.temperature}°C · 💨 {h.windSpeed} km/s
                            </p>
                            {risk && (
                              <p className="mt-1 text-gold-400">
                                {risk.icon} {risk.label}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}