"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function ProfilePage() {
  const { user, loading, updateProfile } = useAuth();
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/giris");
  }, [loading, user, router]);

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
    }
  }, [user]);

  if (loading || !user) {
    return <main className="px-4 sm:px-6 lg:px-8 py-16 text-center text-ink/50">Yükleniyor...</main>;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await updateProfile({ first_name: firstName, last_name: lastName });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("Bilgiler güncellenemedi, lütfen tekrar deneyin.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-16 max-w-lg mx-auto">
      <nav className="text-xs text-ink/50 mb-6">
        <Link href="/hesabim" className="hover:text-burgundy">Hesabım</Link>
        <span className="mx-2">/</span>
        <span className="text-ink">Kullanıcı Bilgilerim</span>
      </nav>

      <h1 className="font-display text-3xl text-ink mb-8">Kullanıcı Bilgilerim</h1>

      <form onSubmit={handleSave} className="bg-card p-6 flex flex-col gap-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-ink/50">Ad</label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="border border-ink/20 px-3 py-2.5 text-sm bg-white"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-ink/50">Soyad</label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="border border-ink/20 px-3 py-2.5 text-sm bg-white"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-ink/50">E-posta</label>
          <input
            value={user.email}
            disabled
            className="border border-ink/10 px-3 py-2.5 text-sm bg-ink/5 text-ink/50 cursor-not-allowed"
          />
          <span className="text-xs text-ink/40">E-posta adresi değiştirilemez.</span>
        </div>

        {error && <p className="text-xs text-burgundy">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 bg-burgundy hover:bg-burgundy-dark disabled:opacity-60 text-white text-sm font-medium py-3 transition-colors"
        >
          {saved ? <Check size={16} /> : null}
          {saving ? "Kaydediliyor..." : saved ? "Kaydedildi" : "Bilgileri Güncelle"}
        </button>
      </form>
    </main>
  );
}