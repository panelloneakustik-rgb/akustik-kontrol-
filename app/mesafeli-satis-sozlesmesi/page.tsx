import Link from "next/link";

export default function DistanceSalesPage() {
  return (
    <main className="px-4 sm:px-6 lg:px-8 py-10 max-w-3xl mx-auto">
      <nav className="text-xs text-ink/50 mb-6">
        <Link href="/" className="hover:text-burgundy">Ana Sayfa</Link>
        <span className="mx-2">/</span>
        <span className="text-ink">Mesafeli Satış Sözleşmesi</span>
      </nav>

      <h1 className="font-display text-3xl text-ink mb-8">Mesafeli Satış Sözleşmesi</h1>

      <div className="flex flex-col gap-6 text-sm text-ink/80 leading-relaxed">
        <section>
          <h2 className="font-display text-xl text-ink mb-2">1. Taraflar</h2>
          <p>
            İşbu sözleşme, akustikkontrol.com.tr üzerinden elektronik ortamda sipariş veren
            alıcı ile satıcı Akustik Kontrol arasında kurulur.
          </p>
          <p className="mt-2">
            Satıcı: Akustik Kontrol<br />
            Adres: İnkılap Mah. Göktan Sk. Taş Apt. No:7 A, Ümraniye / İstanbul<br />
            Telefon: 0 216 630 21 41<br />
            Web: https://akustikkontrol.com.tr
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink mb-2">2. Konu</h2>
          <p>
            Alıcının sitede seçtiği ürünlerin satışı, teslimi ve bedelin ödenmesine ilişkin
            hak ve yükümlülükler bu sözleşmenin konusudur. Sipariş özeti (ürün, adet, renk,
            fiyat) sözleşmenin ayrılmaz parçasıdır.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink mb-2">3. Bedel ve ödeme</h2>
          <p>
            Fiyatlara KDV dahildir. Ödeme, sitede sunulan yöntemlerle (kartlı ödeme
            kuruluşu veya satıcının bildirdiği diğer yöntem) yapılır. Kart bilgileri
            Akustik Kontrol sunucularında saklanmaz.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink mb-2">4. Teslimat</h2>
          <p>
            Ürün, alıcının bildirdiği teslimat adresine, ürün sayfasında belirtilen iş günü
            aralığında kargoya verilir. Kargo firması ve takip numarası sipariş hazır
            olduğunda alıcıyla paylaşılır.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink mb-2">5. Cayma hakkı</h2>
          <p>
            Tüketici, teslimden itibaren 14 gün içinde cayma hakkını kullanabilir. Ayrıntı{" "}
            <Link href="/cayma-iade" className="text-burgundy hover:underline">
              Cayma ve iade
            </Link>{" "}
            sayfasındadır. Hijyen, özel ölçü veya kesilmiş ürünlerde mevzuattaki istisnalar
            saklıdır.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink mb-2">6. Fatura</h2>
          <p>
            E-fatura / e-arşiv, sipariş bilgilerindeki TCKN veya vergi kimliği esas alınarak
            düzenlenir. Belge hazır olduğunda alıcı Hesabım → Siparişlerim üzerinden görür.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink mb-2">7. Uyuşmazlık</h2>
          <p>
            Tüketici, Gümrük ve Ticaret Bakanlığı’nca ilan edilen değere kadar Tüketici
            Hakem Heyetleri ile Tüketici Mahkemelerine başvurabilir.
          </p>
        </section>
      </div>
    </main>
  );
}
