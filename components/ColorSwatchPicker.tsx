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
    <div className="flex flex-col gap-3">
      <span className="text-sm font-medium text-ink">
        Renk{selected ? `: ${selected.name || selected.code}` : " seçin"}
      </span>
      <div className="flex flex-wrap gap-3.5 items-center overflow-visible py-8">
        {swatches.map((s) => {
          const isSelected = selected?.id === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(s)}
              title={s.name || s.code}
              aria-pressed={isSelected}
              className={`relative shrink-0 w-[3.25rem] h-[3.25rem] rounded-full overflow-hidden origin-center ${
                isSelected
                  ? "z-20 scale-[2.25] border-[3px] border-burgundy shadow-[0_10px_28px_rgba(122,30,40,0.32)]"
                  : "z-0 scale-100 border-2 border-white/80 shadow-sm hover:scale-125 hover:shadow-md active:scale-[1.45]"
              }`}
              style={{
                transition:
                  "transform 280ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 280ms ease, border-color 200ms ease",
              }}
            >
              <Image src={s.image} alt={s.name || s.code} fill className="object-cover" sizes="96px" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
