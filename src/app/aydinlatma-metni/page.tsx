import { Breadcrumb } from "@/components/breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Aydınlatma Metni" };

export default function KvkkPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Aydınlatma Metni" }]} />
      <h1 className="mb-6 font-display text-3xl">
        Kişisel Verilerin Korunması Kanunu Kapsamında Aydınlatma Metni
      </h1>
      <div className="space-y-4 text-sm leading-relaxed text-ink/80">
        <p>
          6698 sayılı KVKK uyarınca Akustik Kontrol veri sorumlusu sıfatıyla sizi
          bilgilendirir. Adres: İnkılap Mah. Göktan Sk. Taş Apt. No:7 A
          Ümraniye/İstanbul.
        </p>
        <p>
          İşlenen veriler: ad-soyad, fatura için T.C. kimlik numarası, iletişim
          ve adres bilgileri, sipariş geçmişi, IP ve site kullanım verileri.
        </p>
        <p>
          Amaçlar: sipariş, teslimat, fatura, yasal yükümlülük, müşteri ilişkileri
          ve dolandırıcılık önleme. Hukuki sebepler KVKK md. 5 kapsamında sözleşme
          ifası, hukuki yükümlülük ve meşru menfaattir.
        </p>
        <p>
          Aktarım: kargo şirketleri, ödeme kuruluşları ve yasal zorunluluk halinde
          kamu kurumları. KVKK md. 11 kapsamındaki haklarınız (öğrenme, düzeltme,
          silme, itiraz) için 0 216 630 21 41 numaralı hattı kullanabilirsiniz.
        </p>
      </div>
    </article>
  );
}
