export const CUSTOMER_STOCK_CAP = 5;
export const HIDDEN_STOCK_MAX_QTY = 99;

export function isOutOfStock(stock: number | null | undefined): boolean {
  return stock === 0;
}

export function isPurchasable(stock: number | null | undefined): boolean {
  return stock !== 0;
}

export function customerStockLabel(stock: number | null | undefined): string | null {
  if (stock === 0) return "Stokta yok";
  if (typeof stock === "number" && stock > 0 && stock <= CUSTOMER_STOCK_CAP) {
    return `Son ${stock} ürün`;
  }
  return null;
}

export function customerMaxQty(stock: number | null | undefined): number {
  if (stock === 0) return 0;
  if (typeof stock === "number" && stock > 0 && stock <= CUSTOMER_STOCK_CAP) return stock;
  return HIDDEN_STOCK_MAX_QTY;
}
