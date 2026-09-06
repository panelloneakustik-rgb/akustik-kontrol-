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
      <div className="flex flex-wrap gap-x-2 gap-y-3 items-center overflow-visible py-2">
        {swatches.map((s) => {
          const isSelected = selected?.id === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(s)}
              title={s.name || s.code}
              aria-pressed={isSelected}
              className={`relative shrink-0 w-10 h-10 rounded-full overflow-hidden border-2 origin-center transition-transform duration-200 ease-out ${
                isSelected
                  ? "z-10 scale-[1.55] border-burgundy shadow-md"
                  : "z-0 scale-100 border-transparent hover:scale-110 hover:border-ink/20 active:scale-125"
              }`}
            >
              <Image src={s.image} alt={s.name || s.code} fill className="object-cover" sizes="64px" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
