"use client";

import type { ProductVariant } from "@/lib/api";

const AXES: { key: keyof Pick<ProductVariant, "thickness" | "dimensions" | "density" | "color">; label: string }[] = [
  { key: "thickness", label: "Kalınlık" },
  { key: "dimensions", label: "Ebat" },
  { key: "density", label: "Yoğunluk" },
  { key: "color", label: "Renk" },
];

export default function VariantPicker({
  variants,
  selectedId,
  onSelect,
}: {
  variants: ProductVariant[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}) {
  const selected = variants.find((v) => v.id === selectedId) ?? null;
  const axes = AXES.map((axis) => {
    const values = [...new Set(variants.map((v) => v[axis.key]).filter(Boolean))];
    return { ...axis, values };
  }).filter((axis) => axis.values.length > 1);

  if (variants.length <= 1) return null;

  if (axes.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-ink">Seçenek</span>
        <div className="flex flex-wrap gap-2">
          {variants.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => onSelect(v.id)}
              className={`px-3 py-2 text-sm border ${
                selectedId === v.id ? "border-burgundy bg-burgundy text-white" : "border-ink/20 hover:border-burgundy"
              }`}
            >
              {v.label || `Seçenek ${v.id}`}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const pick = (key: (typeof AXES)[number]["key"], value: string) => {
    const next = {
      thickness: selected?.thickness || "",
      dimensions: selected?.dimensions || "",
      density: selected?.density || "",
      color: selected?.color || "",
      [key]: value,
    };
    const match =
      variants.find(
        (v) =>
          (!next.thickness || !v.thickness || v.thickness === next.thickness) &&
          (!next.dimensions || !v.dimensions || v.dimensions === next.dimensions) &&
          (!next.density || !v.density || v.density === next.density) &&
          (!next.color || !v.color || v.color === next.color) &&
          v[key] === value
      ) || variants.find((v) => v[key] === value);
    if (match) onSelect(match.id);
  };

  return (
    <div className="flex flex-col gap-4">
      {axes.map((axis) => (
        <div key={axis.key} className="flex flex-col gap-2">
          <span className="text-sm font-medium text-ink">{axis.label}</span>
          <div className="flex flex-wrap gap-2">
            {axis.values.map((value) => {
              const active = selected?.[axis.key] === value;
              const possible = variants.some((v) => v[axis.key] === value && v.stock > 0);
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => pick(axis.key, value)}
                  className={`px-3 py-2 text-sm border min-h-11 ${
                    active
                      ? "border-burgundy bg-burgundy text-white"
                      : possible
                        ? "border-ink/20 hover:border-burgundy"
                        : "border-ink/10 text-ink/35"
                  }`}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
