import { Breadcrumb } from "@/components/breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Gizlilik Politikası" };

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Gizlilik Politikası" }]} />
      <h1 className="mb-6 font-display text-3xl">Gizlilik Politikası</h1>
      <div className="space-y-4 text-sm leading-relaxed text-ink/80">
        <h2 className="font-semibold text-ink">1. Genel Bilgilendirme</h2>
        <p>
          Akustik Kontrol olarak internet sitemizi ziyaret eden ve üye olan
          kullanıcılarımızın gizliliğini korumaya önem veriyoruz. Bu metin hangi
          bilgilerin toplandığını, nasıl kullanıldığını ve korunduğunu açıklar.
        </p>
        <h2 className="font-semibold text-ink">2. Toplanan Bilgiler</h2>
        <p>
          Ad, soyad, e-posta, telefon, teslimat adresi, sipariş geçmişi ve site
          kullanım verileri (IP, tarayıcı, çerezler) toplanabilir. Kart bilgileri
          sitemizde saklanmaz.
        </p>
        <h2 className="font-semibold text-ink">3. Kullanım Amacı</h2>
        <p>
          Sipariş ve teslimat, müşteri desteği, yasal fatura yükümlülükleri ve
          site güvenliği.
        </p>
        <h2 className="font-semibold text-ink">4. Paylaşım ve Güvenlik</h2>
        <p>
          Verileriniz yasal zorunluluklar ve siparişin ifası için kargo / ödeme
          kuruluşları dışında üçüncü taraflarla satılmaz. KVKK haklarınız için
          Aydınlatma Metni sayfasını inceleyebilirsiniz.
        </p>
        <p>Sorularınız için 0 216 630 21 41.</p>
      </div>
    </article>
  );
}
