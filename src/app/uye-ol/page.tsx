"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const { login } = useStore();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.includes("@") || password.length < 4) {
      setError("Ad, geçerli e-posta ve en az 4 karakterli şifre gerekli.");
      return;
    }
    login(email, name);
    router.push("/hesabim");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-8 text-center font-display text-3xl">Üye Ol</h1>
      <form
        onSubmit={onSubmit}
        className="space-y-4 border border-ink/10 bg-white p-6"
      >
        <div className="space-y-2">
          <Label htmlFor="name">Ad Soyad</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-11 rounded-none"
            required
          />
        </div>
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
          Üye Ol
        </Button>
        <p className="text-center text-sm">
          Zaten hesabın var mı?{" "}
          <Link href="/giris" className="font-semibold text-burgundy">
            Giriş Yap
          </Link>
        </p>
      </form>
    </div>
  );
}
