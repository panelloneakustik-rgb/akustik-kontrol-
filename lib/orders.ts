import { getAccessToken } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000/api";

export type OrderItem = {
  id: number;
  product: number | null;
  product_name: string;
  product_image: string | null;
  unit_price: string;
  quantity: number;
  subtotal: string;
};

export type Order = {
  id: number;
  order_code: string;
  address_title: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  mobile_phone: string;
  tc_kimlik_no: string;
  country: string;
  city: string;
  district: string;
  address: string;
  invoice_type: "individual" | "company";
  invoice_type_display: string;
  company_name: string;
  tax_office: string;
  tax_number: string;
  status: string;
  status_display: string;
  items: OrderItem[];
  total: string;
  created_at: string;
  has_invoice: boolean;
  invoice_status: "ready" | "pending" | "none";
  invoice_number: string;
  cargo_company: string;
  cargo_company_display: string;
  tracking_number: string;
  tracking_url: string;
};

export type ReturnRequest = {
  id: number;
  order: number;
  order_id: number;
  order_total: string;
  request_type: "return" | "cancel";
  request_type_display: string;
  reason: string;
  status: string;
  status_display: string;
  admin_note: string;
  created_at: string;
};

function authHeaders(): Record<string, string> {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getMyOrders(): Promise<Order[]> {
  const token = getAccessToken();
  if (!token) return [];

  const res = await fetch(`${API_BASE}/orders/my/`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Orders API failed: ${res.status}`);
  return res.json();
}

export async function initializePayment(orderId: number): Promise<{ checkout_form_content: string }> {
  const res = await fetch(`${API_BASE}/orders/${orderId}/pay/`, { method: "POST" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || "Ödeme başlatılamadı.");
  }
  return res.json();
}

export async function createReturnRequest(
  orderId: number,
  requestType: "return" | "cancel",
  reason: string
): Promise<ReturnRequest> {
  const res = await fetch(`${API_BASE}/orders/${orderId}/return-request/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ request_type: requestType, reason }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || "Talep oluşturulamadı.");
  }
  return res.json();
}

export async function downloadInvoice(orderId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/orders/${orderId}/invoice/`, { headers: authHeaders() });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || "Fatura indirilemedi.");
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
}

export async function getMyReturnRequests(): Promise<ReturnRequest[]> {
  const token = getAccessToken();
  if (!token) return [];

  const res = await fetch(`${API_BASE}/returns/my/`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Returns API failed: ${res.status}`);
  return res.json();
}