"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { confirmPasswordReset } from "@/lib/auth";

function ResetForm() {
  const params = useSearchParams();
  const router = useRouter();
  const uid = params.get("uid") || "";
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      setError("Şifreler eşleşmiyor.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await confirmPasswordReset(uid, token, password, passwordConfirm);
      router.push("/giris");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Şifre güncellenemedi.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!uid || !token) {
    return <p className="text-sm text-burgundy text-center">Geçersiz bağlantı.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="password"
        placeholder="Yeni şifre"
        required
        minLength={8}
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border border-ink/20 px-3 py-2 text-sm bg-white"
      />
      <input
        type="password"
        placeholder="Yeni şifre tekrar"
        required
        minLength={8}
        autoComplete="new-password"
        value={passwordConfirm}
        onChange={(e) => setPasswordConfirm(e.target.value)}
        className="border border-ink/20 px-3 py-2 text-sm bg-white"
      />
      {error && <p className="text-xs text-burgundy">{error}</p>}
      <button type="submit" disabled={submitting} className="bg-burgundy text-white text-sm font-medium py-3 disabled:opacity-60">
        {submitting ? "Kaydediliyor..." : "Şifreyi güncelle"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="px-4 sm:px-6 lg:px-8 py-16 max-w-sm mx-auto">
      <h1 className="font-display text-3xl text-ink mb-8 text-center">Yeni Şifre</h1>
      <Suspense fallback={<p className="text-center text-ink/50">Yükleniyor...</p>}>
        <ResetForm />
      </Suspense>
      <p className="text-sm text-ink/60 text-center mt-6">
        <Link href="/giris" className="text-burgundy font-medium hover:underline">Giriş Yap</Link>
      </p>
    </main>
  );
}
