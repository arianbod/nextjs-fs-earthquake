'use client';

import { useTranslations } from 'next-intl';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function ComparisonChart({ type, data }) {
  const t = useTranslations('Compare');

  if (!data || data.length === 0) {
    return null;
  }

  // Transform data for radar chart
  const radarData = [
    { category: t('structural'), fullMark: 100 },
    { category: t('foundation'), fullMark: 100 },
    { category: t('material'), fullMark: 100 },
    { category: t('irregularity'), fullMark: 100 },
    { category: t('site'), fullMark: 100 },
  ].map((item, idx) => {
    const categoryKey = ['structural', 'foundation', 'material', 'irregularity', 'site'][idx];
    const result = { ...item };
    data.forEach((building, i) => {
      result[`building${i}`] = building[categoryKey] || 0;
    });
    return result;
  });

  // Transform data for bar chart
  const barData = [
    { category: t('overall'), key: 'overall' },
    { category: t('structural'), key: 'structural' },
    { category: t('foundation'), key: 'foundation' },
    { category: t('material'), key: 'material' },
    { category: t('irregularity'), key: 'irregularity' },
    { category: t('site'), key: 'site' },
  ].map((item) => {
    const result = { category: item.category };
    data.forEach((building, i) => {
      result[building.name] = building[item.key] || 0;
    });
    return result;
  });

  if (type === 'radar') {
    return (
      <div className="w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
            <PolarGrid strokeDasharray="3 3" />
            <PolarAngleAxis
              dataKey="category"
              tick={{ fill: 'currentColor', fontSize: 12 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fill: 'currentColor', fontSize: 10 }}
            />
            {data.map((building, index) => (
              <Radar
                key={building.name}
                name={building.name}
                dataKey={`building${index}`}
                stroke={COLORS[index % COLORS.length]}
                fill={COLORS[index % COLORS.length]}
                fillOpacity={0.2}
                strokeWidth={2}
              />
            ))}
            <Legend />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={barData} margin={{ top: 20, right: 30, bottom: 60, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="category"
            tick={{ fill: 'currentColor', fontSize: 11 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: 'currentColor', fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Legend />
          {data.map((building, index) => (
            <Bar
              key={building.name}
              dataKey={building.name}
              fill={COLORS[index % COLORS.length]}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
