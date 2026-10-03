'use client';

import React from 'react';
import { PieChart, CreditCard, Banknote } from 'lucide-react';

interface PaymentDistributionProps {
  onlineOrders: number;
  codOrders: number;
}

export default function PaymentDistributionChart({
  onlineOrders = 0,
  codOrders = 0,
}: PaymentDistributionProps) {
  const total = Math.max(onlineOrders + codOrders, 1);
  const onlinePct = Math.round((onlineOrders / total) * 100);
  const codPct = Math.round((codOrders / total) * 100);

  // SVG Donut calculation
  const radius = 40;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const onlineDash = (onlinePct / 100) * circumference;
  const codDash = circumference - onlineDash;

  return (
    <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs flex flex-col justify-between">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-zinc-100 text-zinc-900 rounded-lg">
          <PieChart className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900">Payment Gateway Methods</h4>
          <p className="text-[10px] text-zinc-500 font-medium">Online Prepaid vs Cash on Delivery (COD)</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-2">
        {/* SVG Donut */}
        <div className="relative w-32 h-32 flex-shrink-0 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
            {/* Background Circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#f4f4f5"
              strokeWidth={strokeWidth}
            />
            {/* Online Slice */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#18181b"
              strokeWidth={strokeWidth}
              strokeDasharray={`${onlineDash} ${circumference}`}
              strokeDashoffset={0}
              className="transition-all duration-700"
            />
            {/* COD Slice */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#a1a1aa"
              strokeWidth={strokeWidth}
              strokeDasharray={`${codDash} ${circumference}`}
              strokeDashoffset={-onlineDash}
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-extrabold text-zinc-900">{onlinePct}%</span>
            <span className="text-[8px] uppercase tracking-widest font-bold text-zinc-400">Prepaid</span>
          </div>
        </div>

        {/* Legend Cards */}
        <div className="flex-1 space-y-3 w-full">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-zinc-900 text-white rounded-md">
                <CreditCard className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-900">Prepaid Online</p>
                <p className="text-[9px] text-zinc-400">Razorpay / Stripe / FPX</p>
              </div>
            </div>
            <span className="text-xs font-extrabold text-zinc-900">{onlineOrders} ({onlinePct}%)</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-zinc-300 text-zinc-800 rounded-md">
                <Banknote className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-900">Cash on Delivery</p>
                <p className="text-[9px] text-zinc-400">Courier Pay at Doorstep</p>
              </div>
            </div>
            <span className="text-xs font-extrabold text-zinc-900">{codOrders} ({codPct}%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
