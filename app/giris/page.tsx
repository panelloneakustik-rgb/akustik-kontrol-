"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import GoogleSignInButton from "@/components/GoogleSignInButton";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      router.push("/hesabim");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Giriş yapılamadı.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-16 max-w-sm mx-auto">
      <h1 className="font-display text-3xl text-ink mb-8 text-center">Giriş Yap</h1>

      <div className="mb-6">
        <GoogleSignInButton />
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-ink/10" />
        <span className="text-xs text-ink/40">veya</span>
        <div className="flex-1 h-px bg-ink/10" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="E-posta"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-ink/20 px-3 py-2 text-base sm:text-sm bg-white"
        />
        <input
          type="password"
          placeholder="Şifre"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-ink/20 px-3 py-2 text-base sm:text-sm bg-white"
        />

        {error && <p className="text-xs text-burgundy">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="bg-burgundy hover:bg-burgundy-dark disabled:opacity-60 text-white text-sm font-medium py-3 transition-colors"
        >
          {submitting ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>
      </form>

      <p className="text-sm text-ink/60 text-center mt-4">
        <Link href="/sifremi-unuttum" className="text-burgundy font-medium hover:underline">
          Şifremi unuttum
        </Link>
      </p>

      <p className="text-sm text-ink/60 text-center mt-6">
        Hesabın yok mu?{" "}
        <Link href="/uye-ol" className="text-burgundy font-medium hover:underline">
          Üye Ol
        </Link>
      </p>
    </main>
  );
}