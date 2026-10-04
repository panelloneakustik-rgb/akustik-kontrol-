import Link from "next/link";

export default function NotFound() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-24 max-w-lg mx-auto text-center">
      <p className="text-sm text-burgundy font-medium mb-2">404</p>
      <h1 className="font-display text-3xl text-ink mb-3">Sayfa bulunamadı</h1>
      <p className="text-sm text-ink/60 mb-8">
        Aradığınız adres taşınmış veya hiç var olmamış olabilir.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-block bg-burgundy text-white text-sm font-medium py-3 px-6 hover:bg-burgundy-dark"
        >
          Ana sayfa
        </Link>
        <Link
          href="/urunler"
          className="inline-block border border-ink/20 text-ink text-sm font-medium py-3 px-6 hover:border-burgundy hover:text-burgundy"
        >
          Tüm ürünler
        </Link>
      </div>
    </div>
  );
}
