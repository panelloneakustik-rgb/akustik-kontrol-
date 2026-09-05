"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { FileText, Truck } from "lucide-react";
import { downloadInvoice, getMyOrders, type Order } from "@/lib/orders";
import { formatTL } from "@/lib/api";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-gray-200 text-ink",
  paid: "bg-blue-100 text-blue-800",
  shipped: "bg-amber-100 text-amber-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

function OrderCard({ order }: { order: Order }) {
  const [open, setOpen] = useState(false);
  const [invoiceError, setInvoiceError] = useState("");
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const date = new Date(order.created_at).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const code = order.order_code || `AK-${order.id}`;

  async function handleInvoice() {
    setInvoiceError("");
    setInvoiceLoading(true);
    try {
      await downloadInvoice(order.id);
    } catch (err) {
      setInvoiceError(err instanceof Error ? err.message : "Fatura açılamadı.");
    } finally {
      setInvoiceLoading(false);
    }
  }

  return (
    <div className="bg-card">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-ink">Sipariş {code}</span>
          <span className="text-xs text-ink/50">{date}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[order.status] ?? "bg-gray-200 text-ink"}`}>
            {order.status_display}
          </span>
          <span className="text-sm font-bold text-ink">{formatTL(order.total)}</span>
        </div>
      </button>

      {open && (
        <div className="border-t border-ink/10 p-4 flex flex-col gap-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="relative w-12 h-12 shrink-0 bg-white">
                {item.product_image && (
                  <Image src={item.product_image} alt={item.product_name} fill className="object-cover" />
                )}
              </div>
              <div className="flex-1 flex justify-between text-sm">
                <span className="text-ink">{item.product_name} × {item.quantity}</span>
                <span className="text-ink/70">{formatTL(item.subtotal)}</span>
              </div>
            </div>
          ))}
          <div className="border-t border-ink/10 pt-3 text-xs text-ink/50">
            <p>Teslimat: {order.address}</p>
            <p className="mt-1">Sipariş kodu: {code}</p>
            {order.tracking_url ? (
              <a
                href={order.tracking_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-burgundy font-medium hover:underline"
              >
                <Truck size={14} />
                {order.cargo_company_display || "Kargo"} takip: {order.tracking_number}
              </a>
            ) : order.tracking_number ? (
              <p className="mt-2">Takip no: {order.tracking_number}</p>
            ) : null}
          </div>
          {order.has_invoice ? (
            <button
              type="button"
              onClick={handleInvoice}
              disabled={invoiceLoading}
              className="self-start inline-flex items-center gap-2 bg-burgundy text-white text-sm font-medium py-2.5 px-4 hover:bg-burgundy-dark transition-colors disabled:opacity-60"
            >
              <FileText size={16} />
              {invoiceLoading ? "Açılıyor..." : "E-Fatura indir"}
            </button>
          ) : order.invoice_status === "pending" ? (
            <p className="text-xs text-ink/50">E-faturanız hazırlanıyor. Kesildikten sonra burada görünecek.</p>
          ) : null}
          {invoiceError && <p className="text-xs text-burgundy">{invoiceError}</p>}
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push("/giris");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    getMyOrders()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));
  }, [user]);

  if (authLoading || !user) {
    return <main className="px-4 sm:px-6 lg:px-8 py-16 text-center text-ink/50">Yükleniyor...</main>;
  }

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-16 max-w-2xl mx-auto">
      <nav className="text-xs text-ink/50 mb-6">
        <Link href="/hesabim" className="hover:text-burgundy">Hesabım</Link>
        <span className="mx-2">/</span>
        <span className="text-ink">Siparişlerim</span>
      </nav>

      <h1 className="font-display text-3xl text-ink mb-8">Siparişlerim</h1>

      {ordersLoading ? (
        <p className="text-ink/50 text-sm">Yükleniyor...</p>
      ) : orders.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-ink/50 text-sm mb-4">Henüz siparişin yok.</p>
          <Link href="/" className="inline-block bg-burgundy text-white text-sm font-medium py-3 px-6 hover:bg-burgundy-dark transition-colors">
            Alışverişe Başla
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </main>
  );
}