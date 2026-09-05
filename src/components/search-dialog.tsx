"use client";

import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { formatTL, searchProducts } from "@/lib/catalog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function SearchDialog({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const results = useMemo(() => searchProducts(q), [q]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        aria-label="Ara"
        className={className}
      >
        <Search size={20} />
      </DialogTrigger>
      <DialogContent className="max-w-lg rounded-none border-ink/10 bg-cream sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-ink">
            Ürün ara
          </DialogTitle>
        </DialogHeader>
        <Input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Sünger, panel, bariyer…"
          className="h-11 rounded-none border-ink/20 bg-white"
        />
        <div className="max-h-80 overflow-y-auto">
          {!q.trim() ? (
            <p className="py-6 text-center text-sm text-ink/50">
              Ürün adı veya malzeme yazın.
            </p>
          ) : results.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink/50">
              “{q}” için ürün bulunamadı.
            </p>
          ) : (
            <ul className="divide-y divide-ink/10">
              {results.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/urun/${p.slug}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 py-3 hover:bg-white/60"
                  >
                    <Image
                      src={p.image}
                      alt=""
                      width={56}
                      height={56}
                      className="h-14 w-14 object-cover"
                    />
                    <span className="flex-1 text-sm text-ink">{p.name}</span>
                    <span className="text-sm font-semibold">
                      {formatTL(p.price)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
