import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <main className="px-4 sm:px-6 lg:px-8 py-10 max-w-3xl mx-auto">
      <nav className="text-xs text-ink/50 mb-6">
        <Link href="/" className="hover:text-burgundy">Ana Sayfa</Link>
        <span className="mx-2">/</span>
        <span className="text-ink">Gizlilik Politikası</span>
      </nav>

      <h1 className="font-display text-3xl text-ink mb-8">Gizlilik Politikası</h1>

      <div className="flex flex-col gap-6 text-sm text-ink/80 leading-relaxed">
        <section>
          <h2 className="font-display text-xl text-ink mb-2">1. Genel Bilgilendirme</h2>
          <p>
            Akustik Kontrol ("Şirket") olarak, internet sitemizi ziyaret eden ve/veya üye olan
            kullanıcılarımızın gizliliğini korumaya önem veriyoruz. Bu Gizlilik Politikası,
            hangi bilgilerin toplandığını, nasıl kullanıldığını ve korunduğunu açıklamaktadır.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink mb-2">2. Toplanan Bilgiler</h2>
          <p>Sitemizi kullanırken aşağıdaki bilgileri toplayabiliriz:</p>
          <ul className="list-disc pl-5 mt-2 flex flex-col gap-2">
            <li>Ad, soyad, e-posta adresi, telefon numarası</li>
            <li>Teslimat ve fatura adresi bilgileri</li>
            <li>Sipariş ve ödeme geçmişi (kart bilgileri tarafımızca saklanmaz, ödeme sağlayıcımız üzerinden güvenli şekilde işlenir)</li>
            <li>Site kullanım verileri (IP adresi, tarayıcı bilgisi, çerezler aracılığıyla)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink mb-2">3. Bilgilerin Kullanım Amacı</h2>
          <ul className="list-disc pl-5 flex flex-col gap-2">
            <li>Siparişlerinizin işleme alınması ve teslimatın gerçekleştirilmesi</li>
            <li>Müşteri hizmetleri ve destek sağlanması</li>
            <li>Yasal yükümlülüklerin yerine getirilmesi (fatura düzenleme vb.)</li>
            <li>Site güvenliğinin ve performansının iyileştirilmesi</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink mb-2">4. Bilgilerin Paylaşımı</h2>
          <p>
            Kişisel verileriniz, yasal zorunluluklar dışında ve sipariş sürecinizin gerektirdiği
            kargo/ödeme hizmet sağlayıcıları haricinde üçüncü taraflarla paylaşılmaz, satılmaz
            veya kiralanmaz.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink mb-2">5. Veri Güvenliği</h2>
          <p>
            Kişisel verilerinizin güvenliği için gerekli teknik ve idari tedbirler alınmaktadır.
            Ödeme işlemleri, iyzico gibi PCI-DSS uyumlu, lisanslı ödeme kuruluşları aracılığıyla
            gerçekleştirilir; kart bilgileriniz sitemiz üzerinden hiçbir şekilde saklanmaz.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink mb-2">6. Haklarınız</h2>
          <p>
            KVKK kapsamındaki haklarınız için{" "}
            <Link href="/aydinlatma-metni" className="text-burgundy hover:underline">
              Aydınlatma Metni
            </Link>{" "}
            sayfamızı inceleyebilirsiniz.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink mb-2">7. İletişim</h2>
          <p>
            Gizlilik politikamız hakkında sorularınız için{" "}
            <a href="tel:+902166302141" className="text-burgundy hover:underline">
              0 216 630 21 41
            </a>{" "}
            numaralı telefondan bize ulaşabilirsiniz.
          </p>
        </section>
      </div>
    </main>
  );
}