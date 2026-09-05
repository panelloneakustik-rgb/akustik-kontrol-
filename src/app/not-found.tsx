import Link from "next/link";

export default function NotFound() {
  return (
    <div className="px-4 py-20 text-center">
      <p className="text-sm tracking-widest text-burgundy">404</p>
      <h1 className="mt-2 font-display text-3xl">Sayfa bulunamadı</h1>
      <p className="mt-3 text-sm text-ink/60">
        Aradığınız adres taşınmış veya hiç var olmamış olabilir.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-11 items-center bg-burgundy px-6 text-sm text-white hover:bg-burgundy-dark"
      >
        Ana sayfaya dön
      </Link>
    </div>
  );
}
