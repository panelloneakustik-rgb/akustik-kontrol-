export const CUSTOMER_STOCK_CAP = 5;

export function customerVisibleStock(quantity: number | null | undefined): number {
  const n = Number(quantity ?? 0);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(Math.floor(n), CUSTOMER_STOCK_CAP);
}

export function customerStockLabel(quantity: number | null | undefined): string {
  const shown = customerVisibleStock(quantity);
  if (shown <= 0) return "Stokta yok";
  return `Son ${shown} ürün`;
}
