"use client";

import { Minus, Plus } from "lucide-react";

export default function QuantitySelector({
  value,
  onChange,
  max = 99,
}: {
  value: number;
  onChange: (next: number) => void;
  max?: number;
}) {
  return (
    <div className="flex items-center border border-ink/20 w-fit">
      <button
        onClick={() => onChange(Math.max(1, value - 1))}
        className="w-9 h-9 flex items-center justify-center hover:bg-card transition-colors"
        aria-label="Azalt"
      >
        <Minus size={14} />
      </button>
      <span className="w-10 text-center text-sm font-medium">{value}</span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        className="w-9 h-9 flex items-center justify-center hover:bg-card transition-colors"
        aria-label="Artır"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}