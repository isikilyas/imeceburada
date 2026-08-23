"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useLocale } from "@/lib/i18n/locale-context";

export interface IndexChartPoint {
  month: string;
  averageAmount: number;
  medianAmount: number;
  sampleSize: number;
  expectationAverage?: number | null;
  expectationSampleSize?: number;
}

const COLOR_AVERAGE = "#3987e5";
const COLOR_MEDIAN = "#d95926";
const COLOR_EXPECTATION = "#199e70";
const GRID_COLOR = "#262b35";
const AXIS_COLOR = "#898781";

function CustomTooltip({
  active,
  payload,
  label,
  unitLabel,
  sampleSizeLabel,
  expectationSampleSizeLabel,
}: {
  active?: boolean;
  payload?: { value: number; name: string; color: string }[];
  label?: string;
  unitLabel: string;
  sampleSizeLabel: (count: number) => string;
  expectationSampleSizeLabel: (count: number) => string;
}) {
  if (!active || !payload?.length) return null;
  const point = (payload[0] as unknown as { payload: IndexChartPoint }).payload;
  return (
    <div className="rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-medium text-silver-300">{label}</p>
      {payload
        .filter((p) => p.value !== null && p.value !== undefined)
        .map((p) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: {p.value.toLocaleString("tr-TR")} {unitLabel}
          </p>
        ))}
      {point?.sampleSize !== undefined && (
        <p className="mt-1 text-silver-500">{sampleSizeLabel(point.sampleSize)}</p>
      )}
      {point?.expectationSampleSize ? (
        <p className="text-silver-500">{expectationSampleSizeLabel(point.expectationSampleSize)}</p>
      ) : null}
    </div>
  );
}

export function IndexChart({ data, unitLabel }: { data: IndexChartPoint[]; unitLabel: string }) {
  const { t } = useLocale();

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-ink-800 bg-ink-900 text-sm text-silver-500">
        {t("components.indexChart.insufficientData")}
      </div>
    );
  }

  const hasExpectationData = data.some((d) => d.expectationAverage !== null && d.expectationAverage !== undefined);

  return (
    <div className="h-72 rounded-lg border border-ink-800 bg-ink-900 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={GRID_COLOR} vertical={false} />
          <XAxis dataKey="month" stroke={AXIS_COLOR} fontSize={12} tickLine={false} axisLine={{ stroke: GRID_COLOR }} />
          <YAxis stroke={AXIS_COLOR} fontSize={12} tickLine={false} axisLine={{ stroke: GRID_COLOR }} width={60} />
          <Tooltip
            content={
              <CustomTooltip
                unitLabel={unitLabel}
                sampleSizeLabel={(count) => t("components.indexChart.sampleSize", { count })}
                expectationSampleSizeLabel={(count) => t("components.indexChart.expectationSampleSize", { count })}
              />
            }
          />
          <Legend wrapperStyle={{ fontSize: 12, color: "#c7cbd1" }} />
          <Line
            type="monotone"
            dataKey="averageAmount"
            name={t("components.indexChart.average")}
            stroke={COLOR_AVERAGE}
            strokeWidth={2}
            dot={{ r: 4, fill: COLOR_AVERAGE }}
          />
          <Line
            type="monotone"
            dataKey="medianAmount"
            name={t("components.indexChart.median")}
            stroke={COLOR_MEDIAN}
            strokeWidth={2}
            dot={{ r: 4, fill: COLOR_MEDIAN }}
          />
          {hasExpectationData && (
            <Line
              type="monotone"
              dataKey="expectationAverage"
              name={t("components.indexChart.marketExpectation")}
              stroke={COLOR_EXPECTATION}
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={{ r: 4, fill: COLOR_EXPECTATION }}
              connectNulls
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
