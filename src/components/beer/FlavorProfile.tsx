"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

interface FlavorData {
  bitterness?: number | null;
  sweetness?: number | null;
  body?: number | null;
  aroma?: number | null;
  sourness?: number | null;
}

interface FlavorProfileProps {
  data: FlavorData;
  size?: "sm" | "md" | "lg";
  showLabels?: boolean;
}

export function FlavorProfile({
  data,
  size = "md",
  showLabels = true,
}: FlavorProfileProps) {
  const chartData = [
    { subject: "苦味", value: data.bitterness ?? 0, fullMark: 5 },
    { subject: "甘味", value: data.sweetness ?? 0, fullMark: 5 },
    { subject: "ボディ", value: data.body ?? 0, fullMark: 5 },
    { subject: "香り", value: data.aroma ?? 0, fullMark: 5 },
    { subject: "酸味", value: data.sourness ?? 0, fullMark: 5 },
  ];

  const sizeMap = {
    sm: { width: 150, height: 150, fontSize: 10 },
    md: { width: 200, height: 200, fontSize: 12 },
    lg: { width: 280, height: 280, fontSize: 14 },
  };

  const { width, height, fontSize } = sizeMap[size];

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis
            dataKey="subject"
            tick={showLabels ? { fontSize, fill: "#6b7280" } : false}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 5]}
            tick={false}
            axisLine={false}
          />
          <Radar
            name="味の特性"
            dataKey="value"
            stroke="#d97706"
            fill="#f59e0b"
            fillOpacity={0.5}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
