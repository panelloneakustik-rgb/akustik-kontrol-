"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import QuantitySelector from "./QuantitySelector";
import ColorSwatchPicker from "./ColorSwatchPicker";
import { useCart } from "@/components/CartProvider";
import type { ColorSwatch } from "@/lib/api";

export default function AddToCartBox({
  productId,
  maxQty,
  colorSwatches = [],
}: {
  productId: number;
  maxQty: number;
  colorSwatches?: ColorSwatch[];
}) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [selectedColor, setSelectedColor] = useState<ColorSwatch | null>(null);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const needsColor = colorSwatches.length > 0;

  const handleAdd = async () => {
    if (needsColor && !selectedColor) {
      setError("Lütfen önce bir renk seçin.");
      return;
    }
    setError(null);
    setAdding(true);
    try {
      await addItem(productId, qty, selectedColor?.code ?? "");
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sepete eklenemedi.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 mt-2">
      {needsColor && (
        <ColorSwatchPicker swatches={colorSwatches} selected={selectedColor} onSelect={setSelectedColor} />
      )}

      {error && <p className="text-xs text-burgundy">{error}</p>}

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <QuantitySelector value={qty} onChange={setQty} max={maxQty} />
        <button
          onClick={handleAdd}
          disabled={adding || maxQty <= 0}
          className="flex-1 flex items-center justify-center gap-2 bg-burgundy hover:bg-burgundy-dark disabled:opacity-60 text-white text-sm font-medium py-3 px-6 min-h-12 transition-colors"
        >
          {added ? <Check size={18} /> : <ShoppingCart size={18} />}
          {added ? "Sepete Eklendi" : "Sepete Ekle"}
        </button>
      </div>
    </div>
  );
}