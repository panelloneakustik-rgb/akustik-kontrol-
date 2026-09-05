"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const { login, user } = useStore();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) router.replace("/hesabim");
  }, [user, router]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@") || password.length < 4) {
      setError("Geçerli bir e-posta ve en az 4 karakterli şifre girin.");
      return;
    }
    login(email);
    router.push("/hesabim");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-8 text-center font-display text-3xl">Giriş Yap</h1>
      <form
        onSubmit={onSubmit}
        className="space-y-4 border border-ink/10 bg-white p-6"
      >
        <div className="space-y-2">
          <Label htmlFor="email">E-posta</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 rounded-none"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Şifre</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 rounded-none"
            required
          />
        </div>
        {error ? <p className="text-sm text-burgundy">{error}</p> : null}
        <Button
          type="submit"
          className="h-11 w-full rounded-none bg-burgundy text-white hover:bg-burgundy-dark"
        >
          Giriş Yap
        </Button>
        <p className="text-center text-xs text-ink/50">
          Şifremi unuttum — bu önizlemede hesaplar tarayıcıda saklanır, gerçek
          ödeme veya üye API’si bağlı değildir.
        </p>
        <p className="text-center text-sm">
          Hesabın yok mu?{" "}
          <Link href="/uye-ol" className="font-semibold text-burgundy">
            Üye Ol
          </Link>
        </p>
      </form>
    </div>
  );
}
