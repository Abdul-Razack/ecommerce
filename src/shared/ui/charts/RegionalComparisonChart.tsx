'use client';

import React from 'react';
import { BarChart3 } from 'lucide-react';
import { IndiaFlagSvg, MalaysiaFlagSvg } from '../RegionBadge';

interface RegionalComparisonProps {
  indiaOrders: number;
  malaysiaOrders: number;
  indiaRevenueINR: number;
  malaysiaRevenueMYR: number;
  malaysiaRevenueINR: number;
}

export default function RegionalComparisonChart({
  indiaOrders = 0,
  malaysiaOrders = 0,
  indiaRevenueINR = 0,
  malaysiaRevenueMYR = 0,
  malaysiaRevenueINR = 0,
}: RegionalComparisonProps) {
  const totalOrders = Math.max(indiaOrders + malaysiaOrders, 1);
  const indiaOrderPct = Math.round((indiaOrders / totalOrders) * 100);
  const malaysiaOrderPct = Math.round((malaysiaOrders / totalOrders) * 100);

  const totalRevINR = Math.max(indiaRevenueINR + malaysiaRevenueINR, 1);
  const indiaRevPct = Math.round((indiaRevenueINR / totalRevINR) * 100);
  const malaysiaRevPct = Math.round((malaysiaRevenueINR / totalRevINR) * 100);

  return (
    <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-zinc-900 text-white rounded-lg">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900">Regional Performance Comparison</h4>
            <p className="text-[10px] text-zinc-500 font-medium">India vs Malaysia cross-border distribution</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Order Volume Distribution Bar */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className="text-zinc-900 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              Order Volume Share
            </span>
            <span className="text-zinc-500 text-[10px] font-mono">{totalOrders} Total Orders</span>
          </div>

          <div className="h-4 w-full bg-zinc-100 rounded-full overflow-hidden flex border border-zinc-200 p-0.5">
            <div
              style={{ width: `${indiaOrderPct}%` }}
              className="bg-zinc-900 h-full rounded-l-full transition-all duration-500"
            />
            <div
              style={{ width: `${malaysiaOrderPct}%` }}
              className="bg-zinc-400 h-full rounded-r-full transition-all duration-500"
            />
          </div>

          <div className="flex items-center justify-between mt-2.5 text-xs">
            <div className="flex items-center gap-1.5">
              <IndiaFlagSvg className="w-3.5 h-3.5" />
              <span className="text-xs font-bold text-zinc-900">India (IN):</span>
              <span className="font-semibold text-zinc-700">{indiaOrders} orders ({indiaOrderPct}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MalaysiaFlagSvg className="w-3.5 h-3.5" />
              <span className="text-xs font-bold text-zinc-900">Malaysia (MY):</span>
              <span className="font-semibold text-zinc-700">{malaysiaOrders} orders ({malaysiaOrderPct}%)</span>
            </div>
          </div>
        </div>

        {/* Revenue Contribution Distribution Bar */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className="text-zinc-900 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              Revenue Contribution (Base INR)
            </span>
            <span className="text-zinc-500 text-[10px] font-mono">₹{Math.round(totalRevINR).toLocaleString('en-IN')} Total</span>
          </div>

          <div className="h-4 w-full bg-zinc-100 rounded-full overflow-hidden flex border border-zinc-200 p-0.5">
            <div
              style={{ width: `${indiaRevPct}%` }}
              className="bg-zinc-900 h-full rounded-l-full transition-all duration-500"
            />
            <div
              style={{ width: `${malaysiaRevPct}%` }}
              className="bg-zinc-500 h-full rounded-r-full transition-all duration-500"
            />
          </div>

          <div className="flex items-center justify-between mt-2.5 text-xs">
            <div className="flex items-center gap-1.5">
              <IndiaFlagSvg className="w-3.5 h-3.5" />
              <span className="text-xs font-bold text-zinc-900">India Revenue:</span>
              <span className="font-bold text-zinc-900">₹{Math.round(indiaRevenueINR).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MalaysiaFlagSvg className="w-3.5 h-3.5" />
              <span className="text-xs font-bold text-zinc-900">Malaysia Revenue:</span>
              <span className="font-bold text-zinc-900">RM {malaysiaRevenueMYR.toLocaleString('en-MY', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
