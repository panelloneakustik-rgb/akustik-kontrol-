"use client";

import Image from "next/image";
import type { ColorSwatch } from "@/lib/api";

export default function ColorSwatchPicker({
  swatches,
  selected,
  onSelect,
}: {
  swatches: ColorSwatch[];
  selected: ColorSwatch | null;
  onSelect: (swatch: ColorSwatch) => void;
}) {
  if (swatches.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-ink">
        Renk{selected ? `: ${selected.name || selected.code}` : " seçin"}
      </span>
      <div className="flex flex-wrap gap-2">
        {swatches.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelect(s)}
            title={s.name || s.code}
            className={`relative w-10 h-10 rounded-full overflow-hidden border-2 transition-colors ${
              selected?.id === s.id ? "border-burgundy" : "border-transparent hover:border-ink/30"
            }`}
          >
            <Image src={s.image} alt={s.name || s.code} fill className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}