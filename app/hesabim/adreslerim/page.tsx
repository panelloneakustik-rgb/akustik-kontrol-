"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MapPin, Trash2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { createAddress, deleteAddress, listAddresses, type Address } from "@/lib/addresses";
import { TURKISH_CITIES } from "@/lib/turkish-cities";

const EMPTY = {
  title: "",
  first_name: "",
  last_name: "",
  phone: "",
  mobile_phone: "",
  city: "",
  district: "",
  address: "",
  is_default: false,
};

const inputClass = "border border-ink/20 px-3 py-2.5 text-sm bg-white w-full focus:outline-none focus:border-burgundy";

export default function AddressesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push("/giris");
  }, [authLoading, user, router]);

  const refresh = () =>
    listAddresses()
      .then(setAddresses)
      .catch(() => setAddresses([]))
      .finally(() => setLoading(false));

  useEffect(() => {
    if (!user) return;
    refresh();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.title || !form.first_name || !form.last_name || !form.mobile_phone || !form.city || !form.district || !form.address) {
      setError("Zorunlu alanları doldurun.");
      return;
    }
    setSaving(true);
    try {
      await createAddress(form);
      setForm(EMPTY);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Adres kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !user) {
    return <main className="px-4 sm:px-6 lg:px-8 py-16 text-center text-ink/50">Yükleniyor...</main>;
  }

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-16 max-w-2xl mx-auto">
      <nav className="text-xs text-ink/50 mb-6">
        <Link href="/hesabim" className="hover:text-burgundy">Hesabım</Link>
        <span className="mx-2">/</span>
        <span className="text-ink">Adreslerim</span>
      </nav>

      <h1 className="font-display text-3xl text-ink mb-8">Adreslerim</h1>

      {loading ? (
        <p className="text-ink/50 text-sm">Yükleniyor...</p>
      ) : (
        <div className="flex flex-col gap-3 mb-10">
          {addresses.length === 0 && <p className="text-ink/50 text-sm">Kayıtlı adres yok. Aşağıdan ekleyebilirsin.</p>}
          {addresses.map((a) => (
            <div key={a.id} className="bg-card p-5 flex gap-3">
              <MapPin size={18} className="shrink-0 mt-0.5 text-burgundy" />
              <div className="flex-1 flex flex-col gap-1 text-sm">
                <span className="font-semibold text-ink">
                  {a.title}{a.is_default ? " (varsayılan)" : ""}
                </span>
                <span className="text-ink/70">{a.first_name} {a.last_name}</span>
                <span className="text-ink/70">{a.address}</span>
                <span className="text-ink/50 text-xs">{a.district} / {a.city} · {a.mobile_phone}</span>
              </div>
              <button
                type="button"
                aria-label="Sil"
                onClick={async () => {
                  await deleteAddress(a.id);
                  refresh();
                }}
                className="text-ink/40 hover:text-burgundy"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <h2 className="font-display text-xl text-ink mb-4">Yeni adres</h2>
      <form onSubmit={handleSave} className="flex flex-col gap-3">
        <input placeholder="Başlık (Ev, İş)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
        <div className="grid sm:grid-cols-2 gap-3">
          <input placeholder="Ad" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} className={inputClass} />
          <input placeholder="Soyad" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} className={inputClass} />
        </div>
        <input placeholder="Cep telefonu" value={form.mobile_phone} onChange={(e) => setForm({ ...form, mobile_phone: e.target.value })} className={inputClass} />
        <div className="grid sm:grid-cols-2 gap-3">
          <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputClass}>
            <option value="">Şehir</option>
            {TURKISH_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input placeholder="İlçe" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} className={inputClass} />
        </div>
        <textarea placeholder="Adres" rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={`${inputClass} resize-none`} />
        <label className="text-sm text-ink/70 flex items-center gap-2">
          <input type="checkbox" checked={form.is_default} onChange={(e) => setForm({ ...form, is_default: e.target.checked })} />
          Varsayılan adres
        </label>
        {error && <p className="text-xs text-burgundy">{error}</p>}
        <button type="submit" disabled={saving} className="self-start bg-burgundy text-white text-sm font-medium py-2.5 px-5 disabled:opacity-60">
          {saving ? "Kaydediliyor..." : "Adresi kaydet"}
        </button>
      </form>
    </main>
  );
}
