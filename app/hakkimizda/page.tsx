import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="px-4 sm:px-6 lg:px-8 py-10 max-w-4xl mx-auto">
      <nav className="text-xs text-ink/50 mb-6">
        <Link href="/" className="hover:text-burgundy">Ana Sayfa</Link>
        <span className="mx-2">/</span>
        <span className="text-ink">Hakkımızda</span>
      </nav>

      <h1 className="font-display text-3xl text-ink mb-8">Hakkımızda</h1>

      <div className="flex flex-col gap-6 text-ink/80 leading-relaxed text-sm">
        <p>
          Akustik Kontrol, ses yalıtımı ve akustik tasarım alanında evler, stüdyolar,
          ofisler ve toplantı salonları için kaliteli ürünler sunmayı hedefleyen bir
          markadır. Süngerlerden dekoratif akustik panellere kadar geniş bir ürün
          yelpazesiyle mekanlarınızın hem görünümünü hem de ses kalitesini iyileştirmeyi
          amaçlıyoruz.
        </p>
        <p>
          Ürünlerimizi seçerken kalite, dayanıklılık ve estetik bir arada gözetiyor; her
          projenin ihtiyacına uygun çözümler sunmaya çalışıyoruz. Ekibimiz, doğru ürünü
          doğru mekana yönlendirmek için müşterilerimize danışmanlık desteği de veriyor.
        </p>
        <p>
          İstanbul merkezli mağazamızdan ve online platformumuzdan Türkiye&apos;nin dört bir
          yanına gönderim yapıyoruz.
        </p>
      </div>
    </main>
  );
}