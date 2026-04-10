'use client';

import React from 'react';

export function Sparkline({ values, stroke = '#1e3a2f' }: { values: number[]; stroke?: string }) {
  if (!values.length) return null;
  const max = Math.max(...values, 1);
  const points = values.map((v, i) => {
    const x = (i / Math.max(1, values.length - 1)) * 100;
    const y = 100 - (v / max) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox="0 0 100 100" className="w-full h-16">
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}
