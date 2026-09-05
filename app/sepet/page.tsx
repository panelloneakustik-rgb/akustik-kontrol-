"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { useAuth } from "@/components/AuthProvider";
import { formatTL } from "@/lib/api";
import { checkoutCart, getSessionKey, type CheckoutInfo } from "@/lib/cart";
import { listAddresses, type Address } from "@/lib/addresses";
import { TURKISH_CITIES } from "@/lib/turkish-cities";
import GoogleSignInButton from "@/components/GoogleSignInButton";

const EMPTY_FORM: CheckoutInfo = {
  address_title: "",
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  mobile_phone: "",
  tc_kimlik_no: "",
  country: "Türkiye",
  city: "",
  district: "",
  address: "",
  invoice_type: "individual",
  company_name: "",
  tax_office: "",
  tax_number: "",
};

const inputClass = "border border-ink/20 px-3 py-2.5 text-base sm:text-sm bg-white w-full focus:outline-none focus:border-burgundy";

export default function CartPage() {
  const { cart, loading, updateItem, removeItem, refresh } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<CheckoutInfo>(EMPTY_FORM);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);

  useEffect(() => {
    if (!user) return;
    setForm((f) => ({ ...f, email: f.email || user.email }));
    listAddresses().then(setSavedAddresses).catch(() => setSavedAddresses([]));
  }, [user]);

  const applyAddress = (a: Address) => {
    setForm((f) => ({
      ...f,
      address_title: a.title,
      first_name: a.first_name,
      last_name: a.last_name,
      phone: a.phone,
      mobile_phone: a.mobile_phone,
      city: a.city,
      district: a.district,
      address: a.address,
      email: f.email || user?.email || "",
    }));
  };

  const items = cart?.items ?? [];
  const stockBlocked = items.some((item) => item.quantity > (item.stock ?? 0) || (item.stock ?? 0) <= 0);

  const set = (field: keyof CheckoutInfo) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleCheckout = async () => {
    const required: (keyof CheckoutInfo)[] = [
      "first_name", "last_name", "city", "district", "mobile_phone", "tc_kimlik_no", "address",
    ];
    if (required.some((f) => !form[f])) {
      setError("Yıldızlı (*) alanların tamamını doldurman gerekiyor.");
      return;
    }
    if (form.invoice_type === "company" && (!form.company_name || !form.tax_office || !form.tax_number)) {
      setError("Kurumsal fatura için firma adı, vergi dairesi ve vergi numarası zorunlu.");
      return;
    }
    setError(null);
    setPlacing(true);
    try {
      const order = await checkoutCart(getSessionKey(), form);
      await refresh();
      router.push(`/odeme?id=${(order as { id: number }).id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sipariş oluşturulamadı, lütfen tekrar deneyin.");
      setPlacing(false);
    }
  };

  if (loading) {
    return <main className="px-4 sm:px-6 lg:px-8 py-16 text-center text-ink/50">Yükleniyor...</main>;
  }

  if (items.length === 0) {
    return (
      <main className="px-4 sm:px-6 lg:px-8 py-24 max-w-lg mx-auto text-center">
        <h1 className="font-display text-3xl text-ink mb-3">Sepetiniz boş</h1>
        <p className="text-ink/60 mb-6">Alışverişe başlamak için ürünlere göz atabilirsiniz.</p>
        <Link href="/" className="inline-block bg-burgundy text-white text-sm font-medium py-3 px-6 hover:bg-burgundy-dark transition-colors">
          Alışverişe Başla
        </Link>
      </main>
    );
  }

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-10 max-w-5xl mx-auto">
      <h1 className="font-display text-3xl text-ink mb-8">Sepetim</h1>

      <div className="flex flex-col gap-4 mb-12">
        {items.map((item) => (
          <div key={item.id} className="flex flex-col sm:flex-row gap-4 sm:gap-6 bg-card p-4 sm:p-6">
            <div className="relative w-full sm:w-36 h-48 sm:h-36 shrink-0 bg-white">
              {item.product_image ? (
                <Image src={item.product_image} alt={item.product_name} fill className="object-cover" />
              ) : null}
            </div>

            <div className="flex-1 flex flex-col justify-between">
              <div className="flex justify-between gap-2">
  <div className="flex flex-col">
    <span className="text-lg font-semibold text-ink">{item.product_name}</span>
    {item.variant_note && (
      <span className="text-xs text-ink/50">Renk: {item.variant_note}</span>
    )}
  </div>
  <button
                  onClick={() => removeItem(item.id)}
                  className="text-ink/40 hover:text-burgundy transition-colors"
                  aria-label="Kaldır"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center border border-ink/20 w-fit">
                  <button
                    onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))}
                    className="w-9 h-9 flex items-center justify-center hover:bg-white transition-colors text-base"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-base">{item.quantity}</span>
                  <button
                    onClick={() => updateItem(item.id, Math.min(item.stock || item.quantity, item.quantity + 1))}
                    disabled={item.quantity >= (item.stock ?? 0)}
                    className="w-9 h-9 flex items-center justify-center hover:bg-white transition-colors text-base disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
                <span className="text-lg font-bold text-ink">{formatTL(item.subtotal)}</span>
              </div>
              {(item.stock ?? 0) <= 0 && <p className="text-xs text-burgundy">Bu ürün stokta yok.</p>}
              {(item.stock ?? 0) > 0 && item.quantity > item.stock && (
                <p className="text-xs text-burgundy">Stok yetersiz (en fazla {item.stock}).</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-card p-6 flex flex-col gap-5">
          <div>
            <h2 className="font-display text-xl text-ink mb-1">Teslimat adresi</h2>
            <p className="text-xs text-ink/50">Kayıtlı adres seç veya yeni gir.</p>
            {!user && (
              <div className="mt-4 mb-2 p-4 bg-white border border-ink/10">
                <p className="text-sm text-ink mb-3 text-center">Google ile giriş yap</p>
                <GoogleSignInButton redirectTo="/sepet" />
                <p className="text-xs text-ink/40 text-center mt-3">veya üye olmadan devam et</p>
              </div>
            )}
            {savedAddresses.length > 0 && (
              <div className="flex flex-col gap-2 mt-3">
                {savedAddresses.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => applyAddress(a)}
                    className="text-left text-sm border border-ink/15 px-3 py-2 hover:border-burgundy"
                  >
                    {a.title} — {a.district} / {a.city}
                  </button>
                ))}
              </div>
            )}
          </div>

          <input placeholder="Adres Başlığı (Örn: Ev ya da İş)" value={form.address_title} onChange={set("address_title")} className={inputClass} />

          <div className="grid sm:grid-cols-2 gap-4">
            <input placeholder="* Ad" value={form.first_name} onChange={set("first_name")} className={inputClass} />
            <input placeholder="* Soyad" value={form.last_name} onChange={set("last_name")} className={inputClass} />
          </div>

          <input placeholder="* E-posta" type="email" value={form.email} onChange={set("email")} className={inputClass} />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <select value={form.country} onChange={set("country")} className={inputClass}>
              <option value="Türkiye">Türkiye</option>
            </select>
            <select value={form.city} onChange={set("city")} className={inputClass}>
              <option value="">* Şehir</option>
              {TURKISH_CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input placeholder="* İlçe" value={form.district} onChange={set("district")} className={inputClass} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input placeholder="Telefon (Sabit)" value={form.phone} onChange={set("phone")} className={inputClass} />
            <input placeholder="* Cep Telefonu" value={form.mobile_phone} onChange={set("mobile_phone")} className={inputClass} />
            <input placeholder="* TC Kimlik No" value={form.tc_kimlik_no} onChange={set("tc_kimlik_no")} maxLength={11} className={inputClass} />
          </div>

          <textarea placeholder="* Adres" value={form.address} onChange={set("address")} rows={4} className={`${inputClass} resize-none`} />

          <div>
            <p className="text-sm font-semibold text-ink mb-2">Fatura Tipi</p>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
                <input type="radio" name="invoice_type" checked={form.invoice_type === "individual"} onChange={() => setForm((f) => ({ ...f, invoice_type: "individual" }))} />
                Bireysel
              </label>
              <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
                <input type="radio" name="invoice_type" checked={form.invoice_type === "company"} onChange={() => setForm((f) => ({ ...f, invoice_type: "company" }))} />
                Kurumsal
              </label>
            </div>
          </div>

          {form.invoice_type === "company" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input placeholder="* Firma Adı" value={form.company_name} onChange={set("company_name")} className={inputClass} />
              <input placeholder="* Vergi Dairesi" value={form.tax_office} onChange={set("tax_office")} className={inputClass} />
              <input placeholder="* Vergi No" value={form.tax_number} onChange={set("tax_number")} className={inputClass} />
            </div>
          )}

          {error && <p className="text-xs text-burgundy">{error}</p>}
        </div>

        <div className="bg-card p-6 h-fit flex flex-col gap-4">
          <h2 className="font-display text-xl text-ink">Sepet Özeti</h2>

          <div className="flex justify-between text-sm text-ink/70 pb-3 border-b border-ink/10">
            <span>Toplam</span>
            <span className="font-bold text-ink text-base">{formatTL(cart?.total ?? "0")}</span>
          </div>

          {stockBlocked && (
            <p className="text-xs text-burgundy">Stokta olmayan ürünler var. Sepeti güncelleyin.</p>
          )}

          <button
            onClick={handleCheckout}
            disabled={placing || stockBlocked}
            className="bg-burgundy hover:bg-burgundy-dark disabled:opacity-60 text-white text-sm font-medium py-3 transition-colors"
          >
            {placing ? "Yönlendiriliyor..." : "Ödemeye Geç"}
          </button>
        </div>
      </div>
    </main>
  );
}