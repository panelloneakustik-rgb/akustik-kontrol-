import Link from "next/link";

export default function CookiePolicyPage() {
  return (
    <main className="px-4 sm:px-6 lg:px-8 py-10 max-w-3xl mx-auto">
      <nav className="text-xs text-ink/50 mb-6">
        <Link href="/" className="hover:text-burgundy">Ana Sayfa</Link>
        <span className="mx-2">/</span>
        <span className="text-ink">Çerez Politikası</span>
      </nav>

      <h1 className="font-display text-3xl text-ink mb-8">Çerez Politikası</h1>

      <div className="flex flex-col gap-6 text-sm text-ink/80 leading-relaxed">
        <section>
          <h2 className="font-display text-xl text-ink mb-2">1. Çerez Nedir?</h2>
          <p>
            Çerezler, ziyaret ettiğiniz internet siteleri tarafından tarayıcınız aracılığıyla
            cihazınıza kaydedilen küçük metin dosyalarıdır. Çerezler, web sitesinin düzgün
            çalışmasını sağlamak, kullanıcı deneyimini iyileştirmek ve site kullanımına ilişkin
            istatistiksel veriler toplamak amacıyla kullanılır.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink mb-2">2. Kullandığımız Çerez Türleri</h2>
          <ul className="list-disc pl-5 flex flex-col gap-2">
            <li>
              <strong>Zorunlu Çerezler:</strong> Sitenin temel işlevlerinin (örn. sepet, oturum
              yönetimi) çalışması için gereklidir, devre dışı bırakılamaz.
            </li>
            <li>
              <strong>Performans ve Analiz Çerezleri:</strong> Ziyaretçilerin siteyi nasıl
              kullandığını anlamamıza yardımcı olur.
            </li>
            <li>
              <strong>İşlevsellik Çerezleri:</strong> Tercihlerinizi (dil, favori ürünler vb.)
              hatırlamamızı sağlar.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink mb-2">3. Çerezleri Nasıl Yönetebilirsiniz?</h2>
          <p>
            Tarayıcınızın ayarlarından çerezleri silebilir veya çerez kullanımını
            engelleyebilirsiniz. Ancak zorunlu çerezlerin devre dışı bırakılması, sitenin bazı
            bölümlerinin (örn. sepet, üyelik girişi) düzgün çalışmamasına neden olabilir.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink mb-2">4. İletişim</h2>
          <p>
            Çerez politikamız hakkında sorularınız için bizimle{" "}
            <a href="tel:+902166302141" className="text-burgundy hover:underline">
              0 216 630 21 41
            </a>{" "}
            numaralı telefondan iletişime geçebilirsiniz.
          </p>
        </section>
      </div>
    </main>
  );
}