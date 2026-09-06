"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { FileText, RotateCcw, Truck } from "lucide-react";
import {
  createReturnRequest,
  downloadInvoice,
  getMyOrders,
  getMyReturnRequests,
  type Order,
  type ReturnRequest,
} from "@/lib/orders";
import { formatTL } from "@/lib/api";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-gray-200 text-ink",
  paid: "bg-blue-100 text-blue-800",
  shipped: "bg-amber-100 text-amber-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const RETURN_STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-blue-100 text-blue-800",
  rejected: "bg-red-100 text-red-800",
  completed: "bg-green-100 text-green-800",
};

function ReturnRequestBlock({ request }: { request: ReturnRequest }) {
  const date = new Date(request.created_at).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return (
    <div className="bg-white/80 border border-ink/10 rounded-lg p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-ink">
          {request.request_type_display} talebi
        </span>
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${
            RETURN_STATUS_COLORS[request.status] ?? "bg-gray-200 text-ink"
          }`}
        >
          {request.status_display}
        </span>
      </div>
      <p className="text-xs text-ink/50">
        {date} · Sipariş #{request.order_id} · {formatTL(request.order_total)}
      </p>
      <p className="text-sm text-ink/70">{request.reason}</p>
      {request.admin_note && (
        <div className="mt-1 text-xs bg-cream p-3 border-l-2 border-burgundy">
          <span className="font-semibold text-ink/70">Mağaza notu: </span>
          <span className="text-ink/60">{request.admin_note}</span>
        </div>
      )}
    </div>
  );
}

function ReturnForm({
  orderId,
  onCreated,
}: {
  orderId: number;
  onCreated: (request: ReturnRequest) => void;
}) {
  const [open, setOpen] = useState(false);
  const [requestType, setRequestType] = useState<"return" | "cancel">("return");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const created = await createReturnRequest(orderId, requestType, reason);
      onCreated(created);
      setReason("");
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Talep gönderilemedi.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="self-start inline-flex items-center gap-2 border border-burgundy/40 text-burgundy text-sm font-medium py-2.5 px-4 hover:bg-burgundy hover:text-white transition-colors"
      >
        <RotateCcw size={16} />
        İade / iptal talebi oluştur
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 bg-white border border-ink/10 p-4 rounded-lg">
      <p className="text-sm font-medium text-ink">İade veya iptal talebi</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setRequestType("return")}
          className={`flex-1 text-sm py-2 rounded-md border ${
            requestType === "return"
              ? "bg-burgundy text-white border-burgundy"
              : "border-ink/15 text-ink"
          }`}
        >
          İade
        </button>
        <button
          type="button"
          onClick={() => setRequestType("cancel")}
          className={`flex-1 text-sm py-2 rounded-md border ${
            requestType === "cancel"
              ? "bg-burgundy text-white border-burgundy"
              : "border-ink/15 text-ink"
          }`}
        >
          İptal
        </button>
      </div>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        required
        rows={3}
        placeholder="Talebinin nedenini yaz."
        className="w-full text-sm border border-ink/15 rounded-md p-3 bg-cream outline-none focus:border-burgundy"
      />
      {error && <p className="text-xs text-burgundy">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="bg-burgundy text-white text-sm font-medium py-2 px-4 hover:bg-burgundy-dark transition-colors disabled:opacity-60"
        >
          {submitting ? "Gönderiliyor..." : "Talebi gönder"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm text-ink/50 px-3"
        >
          Vazgeç
        </button>
      </div>
    </form>
  );
}

function OrderCard({
  order,
  returns,
  onReturnCreated,
}: {
  order: Order;
  returns: ReturnRequest[];
  onReturnCreated: (request: ReturnRequest) => void;
}) {
  const [open, setOpen] = useState(false);
  const [invoiceError, setInvoiceError] = useState("");
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const date = new Date(order.created_at).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const code = order.order_code || `AK-${order.id}`;
  const canRequest = order.status !== "cancelled";

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
          {returns.length > 0 && (
            <span className="text-xs text-burgundy">
              {returns.length} iade / iptal talebi
            </span>
          )}
          {order.has_invoice && (
            <span className="text-xs text-green-800">E-fatura hazır</span>
          )}
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
          <div className="border-t border-ink/10 pt-3 flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-ink">E-Fatura</h3>
            {order.has_invoice ? (
              <>
                {order.invoice_number ? (
                  <p className="text-xs text-ink/50">Fatura no: {order.invoice_number}</p>
                ) : null}
                <button
                  type="button"
                  onClick={handleInvoice}
                  disabled={invoiceLoading}
                  className="self-start inline-flex items-center gap-2 bg-burgundy text-white text-sm font-medium py-2.5 px-4 hover:bg-burgundy-dark transition-colors disabled:opacity-60"
                >
                  <FileText size={16} />
                  {invoiceLoading ? "Açılıyor..." : "E-Faturayı gör"}
                </button>
              </>
            ) : order.invoice_status === "pending" ? (
              <p className="text-xs text-ink/50">
                E-faturan TÜRMOB’da kesildikten sonra burada görünecek. Siparişi açıp “E-Faturayı gör” ile PDF’i açabilirsin.
              </p>
            ) : (
              <p className="text-xs text-ink/50">Bu sipariş için henüz e-fatura yok.</p>
            )}
            {invoiceError && <p className="text-xs text-burgundy">{invoiceError}</p>}
          </div>

          <div className="border-t border-ink/10 pt-3 flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-ink">İade / iptal</h3>
            {returns.length > 0 ? (
              returns.map((request) => <ReturnRequestBlock key={request.id} request={request} />)
            ) : (
              <p className="text-xs text-ink/50">Bu sipariş için henüz iade veya iptal talebi yok.</p>
            )}
            {canRequest && <ReturnForm orderId={order.id} onCreated={onReturnCreated} />}
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push("/giris");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    Promise.all([getMyOrders(), getMyReturnRequests()])
      .then(([nextOrders, nextReturns]) => {
        setOrders(nextOrders);
        setReturns(nextReturns);
      })
      .catch(() => {
        setOrders([]);
        setReturns([]);
      })
      .finally(() => setOrdersLoading(false));
  }, [user]);

  const returnsByOrder = useMemo(() => {
    const map = new Map<number, ReturnRequest[]>();
    for (const request of returns) {
      const key = request.order_id ?? request.order;
      const list = map.get(key) ?? [];
      list.push(request);
      map.set(key, list);
    }
    return map;
  }, [returns]);

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

      <h1 className="font-display text-3xl text-ink mb-3">Siparişlerim</h1>
      <p className="text-sm text-ink/55 mb-8">
        Sipariş geçmişin ve iade / iptal taleplerin bu sayfada birlikte görünür.
      </p>

      {ordersLoading ? (
        <p className="text-ink/50 text-sm">Yükleniyor...</p>
      ) : orders.length === 0 && returns.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-ink/50 text-sm mb-4">Henüz siparişin yok.</p>
          <Link href="/" className="inline-block bg-burgundy text-white text-sm font-medium py-3 px-6 hover:bg-burgundy-dark transition-colors">
            Alışverişe Başla
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {returns.length > 0 && (
            <section>
              <h2 className="text-lg font-display text-ink mb-3">İade / iptal taleplerin</h2>
              <div className="flex flex-col gap-3">
                {returns.map((request) => (
                  <ReturnRequestBlock key={request.id} request={request} />
                ))}
              </div>
            </section>
          )}

          <section>
            {orders.length === 0 ? (
              <p className="text-ink/50 text-sm">Sipariş kaydı yok; açık taleplerin yukarıda listeleniyor.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {orders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    returns={returnsByOrder.get(order.id) ?? []}
                    onReturnCreated={(request) => setReturns((prev) => [request, ...prev])}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
