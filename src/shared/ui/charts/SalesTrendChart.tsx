'use client';

import React, { useState } from 'react';
import { TrendingUp, Calendar, DollarSign } from 'lucide-react';

interface DataPoint {
  month: string;
  revenue: number;
}

interface SalesTrendChartProps {
  data: DataPoint[];
  currencySymbol?: string;
  title?: string;
}

export default function SalesTrendChart({
  data = [],
  currencySymbol = '₹',
  title = 'Revenue Trend'
}: SalesTrendChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center bg-zinc-50 rounded-xl border border-zinc-100 p-6 text-center">
        <Calendar className="w-8 h-8 text-zinc-300 mb-2" />
        <p className="text-xs text-zinc-400 font-medium">No sales trend data available yet.</p>
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map(d => d.revenue), 100);
  const minRevenue = 0;

  const width = 600;
  const height = 220;
  const paddingX = 40;
  const paddingY = 30;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const points = data.map((d, index) => {
    const x = paddingX + (index / (data.length - 1 || 1)) * chartWidth;
    const y = height - paddingY - ((d.revenue - minRevenue) / (maxRevenue - minRevenue || 1)) * chartHeight;
    return { x, y, data: d };
  });

  const pathD = points.reduce((acc, point, index) => {
    if (index === 0) return `M ${point.x},${point.y}`;
    const prev = points[index - 1];
    const cx1 = prev.x + (point.x - prev.x) / 2;
    const cy1 = prev.y;
    const cx2 = prev.x + (point.x - prev.x) / 2;
    const cy2 = point.y;
    return `${acc} C ${cx1},${cy1} ${cx2},${cy2} ${point.x},${point.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x},${height - paddingY} L ${points[0].x},${height - paddingY} Z`;

  return (
    <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-zinc-900 text-white rounded-lg">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900">{title}</h4>
            <p className="text-[10px] text-zinc-500 font-medium">Performance over recent reporting periods</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded-full border border-zinc-200">
            Live Analytics
          </span>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#18181b" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#18181b" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.33, 0.66, 1].map((ratio, i) => {
            const y = paddingY + ratio * chartHeight;
            const value = Math.round(maxRevenue - ratio * maxRevenue);
            return (
              <g key={i}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#f4f4f5"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="8"
                  className="fill-zinc-400 font-sans font-medium"
                >
                  {currencySymbol}{value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <path d={areaD} fill="url(#salesGradient)" />

          {/* Bezier Line */}
          <path d={pathD} fill="none" stroke="#18181b" strokeWidth="2.5" strokeLinecap="round" />

          {/* Interactive Data Points */}
          {points.map((pt, i) => (
            <g
              key={i}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="cursor-pointer"
            >
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredIndex === i ? 6 : 4}
                fill={hoveredIndex === i ? '#18181b' : '#ffffff'}
                stroke="#18181b"
                strokeWidth={hoveredIndex === i ? 3 : 2}
                className="transition-all duration-150"
              />
              <text
                x={pt.x}
                y={height - 8}
                textAnchor="middle"
                fontSize="9"
                className={`font-sans font-bold transition-all ${
                  hoveredIndex === i ? 'fill-zinc-900 font-extrabold' : 'fill-zinc-400'
                }`}
              >
                {pt.data.month}
              </text>
            </g>
          ))}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <div
            className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-full bg-zinc-900 text-white text-[10px] py-1.5 px-2.5 rounded-lg shadow-xl border border-zinc-800 z-20 flex flex-col items-center gap-0.5"
            style={{
              left: `${(points[hoveredIndex].x / width) * 100}%`,
              top: `${(points[hoveredIndex].y / height) * 100 - 8}%`,
            }}
          >
            <span className="text-[9px] text-zinc-400 font-medium">{points[hoveredIndex].data.month}</span>
            <span className="font-mono font-bold text-white">
              {currencySymbol}{points[hoveredIndex].data.revenue.toLocaleString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
