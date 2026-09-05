import { Breadcrumb } from "@/components/breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Hakkımızda" };

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Hakkımızda" }]} />
      <h1 className="mb-6 font-display text-3xl">Hakkımızda</h1>
      <div className="space-y-4 leading-relaxed text-ink/80">
        <p>
          Akustik Kontrol, ses yalıtımı ve akustik tasarım alanında evler,
          stüdyolar, ofisler ve toplantı salonları için kaliteli ürünler sunmayı
          hedefleyen bir markadır. Süngerlerden dekoratif akustik panellere
          kadar geniş bir ürün yelpazesiyle mekanlarınızın hem görünümünü hem de
          ses kalitesini iyileştirmeyi amaçlıyoruz.
        </p>
        <p>
          Ürünlerimizi seçerken kalite, dayanıklılık ve estetik bir arada
          gözetiyor; her projenin ihtiyacına uygun çözümler sunmaya çalışıyoruz.
          Ekibimiz, doğru ürünü doğru mekana yönlendirmek için müşterilerimize
          danışmanlık desteği de veriyor.
        </p>
        <p>
          İstanbul merkezli mağazamızdan ve online platformumuzdan Türkiye’nin
          dört bir yanına gönderim yapıyoruz. Ücretsiz keşif, yerli üretim ve
          sahada süpervizör desteği ile projeyi teslimata kadar takip ederiz.
        </p>
      </div>
    </article>
  );
}
