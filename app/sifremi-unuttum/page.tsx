"use client";

import Link from "next/link";
import { useState } from "react";
import { requestPasswordReset } from "@/lib/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "İstek gönderilemedi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-16 max-w-sm mx-auto">
      <h1 className="font-display text-3xl text-ink mb-4 text-center">Şifremi Unuttum</h1>
      {sent ? (
        <p className="text-sm text-ink/70 text-center">
          E-posta kayıtlıysa sıfırlama bağlantısı gönderildi. Yerelde Django konsoluna düşer.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="E-posta"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-ink/20 px-3 py-2 text-sm bg-white"
          />
          {error && <p className="text-xs text-burgundy">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="bg-burgundy hover:bg-burgundy-dark disabled:opacity-60 text-white text-sm font-medium py-3"
          >
            {submitting ? "Gönderiliyor..." : "Bağlantı gönder"}
          </button>
        </form>
      )}
      <p className="text-sm text-ink/60 text-center mt-6">
        <Link href="/giris" className="text-burgundy font-medium hover:underline">Giriş Yap</Link>
      </p>
    </main>
  );
}
