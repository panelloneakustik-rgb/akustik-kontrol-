import { Breadcrumb } from "@/components/breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Çerez Politikası" };

export default function CookiePolicyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Çerez Politikası" }]} />
      <h1 className="mb-6 font-display text-3xl">Çerez Politikası</h1>
      <div className="space-y-4 text-sm leading-relaxed text-ink/80">
        <h2 className="font-semibold text-ink">1. Çerez Nedir?</h2>
        <p>
          Çerezler, ziyaret ettiğiniz internet siteleri tarafından tarayıcınız
          aracılığıyla cihazınıza kaydedilen küçük metin dosyalarıdır. Çerezler,
          web sitesinin düzgün çalışmasını sağlamak, kullanıcı deneyimini
          iyileştirmek ve site kullanımına ilişkin istatistiksel veriler
          toplamak amacıyla kullanılır.
        </p>
        <h2 className="font-semibold text-ink">2. Kullandığımız Çerez Türleri</h2>
        <p>
          <strong>Zorunlu çerezler:</strong> Sitenin temel işlevlerinin (sepet,
          oturum) çalışması için gereklidir. <strong>İşlevsellik çerezleri:</strong>{" "}
          Tercihlerinizi (favori ürünler vb.) hatırlamamızı sağlar.
        </p>
        <h2 className="font-semibold text-ink">3. Çerezleri Nasıl Yönetebilirsiniz?</h2>
        <p>
          Tarayıcınızın ayarlarından çerezleri silebilir veya çerez kullanımını
          engelleyebilirsiniz. Zorunlu çerezlerin kapatılması sepet ve üyelik
          girişinin çalışmamasına neden olabilir.
        </p>
        <h2 className="font-semibold text-ink">4. İletişim</h2>
        <p>
          Çerez politikamız hakkında sorularınız için 0 216 630 21 41 numaralı
          telefondan bize ulaşabilirsiniz.
        </p>
      </div>
    </article>
  );
}
