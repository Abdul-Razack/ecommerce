'use client';

import React from 'react';
import { Globe, MapPin } from 'lucide-react';

interface RegionBadgeProps {
  region: 'ALL' | 'IN' | 'MY' | string;
  showName?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function IndiaFlagSvg({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return <MapPin className={`${className} flex-shrink-0`} />;
}

export function MalaysiaFlagSvg({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return <Globe className={`${className} flex-shrink-0`} />;
}

export default function RegionBadge({ region, showName = true, className = '', size = 'md' }: RegionBadgeProps) {
  const code = (region || 'IN').toUpperCase();

  const sizeClasses = {
    sm: 'text-[9px] px-2 py-0.5 gap-1 tracking-wider uppercase font-mono font-bold',
    md: 'text-[10px] px-2.5 py-1 gap-1.5 tracking-wider uppercase font-mono font-bold',
    lg: 'text-xs px-3 py-1.5 gap-2 tracking-wider uppercase font-mono font-bold',
  }[size];

  if (code === 'ALL' || code === 'GLOBAL') {
    return (
      <span className={`inline-flex items-center rounded-lg bg-black text-white border border-black ${sizeClasses} ${className}`}>
        <Globe className="w-3 h-3 flex-shrink-0" />
        {showName && <span>All Regions</span>}
      </span>
    );
  }

  if (code === 'MY' || code === 'MYR' || code === 'MALAYSIA') {
    return (
      <span className={`inline-flex items-center rounded-lg bg-zinc-900 text-white border border-zinc-900 ${sizeClasses} ${className}`}>
        <span className="text-[9px] font-mono bg-zinc-700 text-white px-1 rounded">MY</span>
        {showName && <span>Malaysia (MYR)</span>}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center rounded-lg bg-zinc-100 text-zinc-900 border border-zinc-300 ${sizeClasses} ${className}`}>
      <span className="text-[9px] font-mono bg-zinc-900 text-white px-1 rounded">IN</span>
      {showName && <span>India (INR)</span>}
    </span>
  );
}
